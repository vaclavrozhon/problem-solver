import { Elysia } from "elysia"
import { eq } from "drizzle-orm"

import { profiles } from "../drizzle/schema"
import { is_admin, auth_headers } from "@shared/auth"
import type { AuthHeaders, User } from "@shared/auth"
import { get_db, get_supabase } from "./db"

/**
 * This plugin injects every request with acccess to DB through `Drizzle`.
 */
export const drizzle_plugin = new Elysia({ name: "drizzle-plugin" })
  .decorate("db", get_db())

/**
 * This plugin injects every request with access to `SupabaseSDK`.
 * 
 * In this project, `SupabaseSDK` is used only for `auth` purposes.
 */
export const supabase_plugin = new Elysia({ name: "supabase-plugin" })
  .decorate("supabase", get_supabase())

/**
 * Shared auth check logic. Used by both `isAuth` and `isAdmin` macros.
 */
async function resolve_auth({ headers }: {
  headers: AuthHeaders,
}) {
  const db = get_db()
  const supabase  = get_supabase()

  // (1) Validate JWT
  const jwt_token = headers.authorization.split(" ")[1]
  const {
    data: { user: supabase_user }
  } = await supabase.auth.getUser(jwt_token)

  if (!supabase_user) return {
    error: { type: "error", message: "Invalid Bearer token. Access denied." },
    error_code: 401,
    user: null,
  }

  // (2) Load profile (profiles.id = auth.users.id)
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, supabase_user.id),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
      openrouter_key_encrypted: true,
      key_source: true,
    }
  })

  if (!profile) return {
    error: {
      type: "error",
      message: "Profile not found. Please complete registration."
    },
    error_code: 403,
    user: null,
  }

  // (3) Build user object
  const user: User = {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name,
    // NEVER EXPOSE KEY!
    has_openrouter_key: !!profile.openrouter_key_encrypted,
    key_source: profile.key_source,
    created_at: profile.created_at,
  }

  return {
    user,
    error_code: null,
    error: null,
  }
}

/**
 * This plugin adds `isAuth` & `isAdmin` macro that can automatically
 * protect any route. If authorized, injects the request with `user`
 * (i.e. `admin`) object of the user who made request.
 */
export const auth_plugin = new Elysia({ name: "auth-plugin" })
  .macro({
    /**
     * Checks if user is properly authorized with Bearer token & the user exists.
     * 
     * Injects context with `user`: `User`
     */
    isAuth: {
      beforeHandle: ({ request }) => {
        let path = new URL(request.url).pathname
        console.log("[auth route]: ", path)
      },
      headers: auth_headers,
      resolve: async ({ headers, status }) => {
        const result = await resolve_auth({ headers: headers as AuthHeaders })
        // BUG: This is perfectly valid code, but bugs out in elysia eden
        // it actually works but broken type-hinting -> investigate, create issue
        // if (result.user === null) return status(result.error_code, result.error)
        if (result.user === null) return status(401)
        return { user: result.user }
      }
    },

    /**
     * Check if request user is authorized and has Admin permissions.
     * 
     * Injects context with `admin`: `User`.
     */
    isAdmin: {
      beforeHandle: ({ request }) => {
        let path = new URL(request.url).pathname
        console.log("[admin route]: ", path)
      },
      headers: auth_headers,
      resolve: async ({ headers, status }) => {
        const result = await resolve_auth({ headers: headers as AuthHeaders })
        // BUG!!
        // if (result.user === null) return status(result.error_code, result.error)
        if (result.user === null) return status(401)

        if (!is_admin(result.user.role)) return status(403, {
          type: "error",
          message: "Admin access required.",
        })

        return { admin: result.user }
      }
    },
  })