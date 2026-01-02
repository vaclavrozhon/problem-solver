import { Cookie, Elysia, t } from "elysia"
import { eq } from "drizzle-orm"

import { profiles } from "../drizzle/schema"
import { is_admin } from "@shared/auth"
import type { User } from "@shared/auth"
import { get_db, get_supabase_admin } from "./db"
import { COOKIE_CONFIG, set_auth_cookies, clear_auth_cookies } from "./auth/cookies"

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
  .decorate("sb", get_supabase_admin())

/**
 * Shared auth check logic. Used by both `isAuth` and `isAdmin` macros.
 * Auto-refreshes tokens if access token expired but refresh token valid.
 */
async function resolve_auth({ cookie }: {
  cookie: Record<string, Cookie<unknown>>,
}) {
  const db = get_db()
  const supabase = get_supabase_admin()

  // (1) Get tokens from cookies
  const access_token = cookie[COOKIE_CONFIG.access_token.name]?.value as string | undefined
  const refresh_token = cookie[COOKIE_CONFIG.refresh_token.name]?.value as string | undefined

  if (!access_token && !refresh_token) return {
    error: { type: "error", message: "Not authenticated." },
    error_code: 401,
    user: null,
  }

  // (2) Try access token first
  let supabase_user = null
  if (access_token) {
    const { data } = await supabase.auth.getUser(access_token)
    supabase_user = data.user
  }

  // (3) Access token invalid/expired - try refresh
  if (!supabase_user && refresh_token) {
    const { data: refresh_data, error: refresh_error } = await supabase.auth.refreshSession({
      refresh_token
    })

    if (refresh_error || !refresh_data.session) {
      clear_auth_cookies(cookie)
      return {
        error: { type: "error", message: "Session expired." },
        error_code: 401,
        user: null,
      }
    }

    set_auth_cookies(
      cookie,
      refresh_data.session.access_token,
      refresh_data.session.refresh_token
    )
    supabase_user = refresh_data.user
  }

  if (!supabase_user) {
    clear_auth_cookies(cookie)
    return {
      error: { type: "error", message: "Invalid session. Access denied." },
      error_code: 401,
      user: null,
    }
  }

  // (4) Load profile (profiles.id = auth.users.id)
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

  // (5) Build user object
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
     * Checks if user is properly authorized via HttpOnly cookie
     * 
     * Injects context with `user`: `User`
     */
    isAuth: {
      beforeHandle: ({ request }) => {
        let path = new URL(request.url).pathname
        console.log("[auth route]: ", path)
      },
      resolve: async ({ cookie, status }) => {
        const result = await resolve_auth({ cookie })
        if (result.user === null) return status(401)
        return { user: result.user }
      },
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
      resolve: async ({ cookie, status }) => {
        const result = await resolve_auth({ cookie })
        if (result.user === null) return status(401)

        if (!is_admin(result.user.role)) return status(403, {
          type: "error",
          message: "Admin access required.",
        })

        return { admin: result.user }
      }
    },
  })