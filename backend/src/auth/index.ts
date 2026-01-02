import { Elysia } from "elysia"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { drizzle_plugin, auth_plugin, supabase_plugin } from "../plugins"
import { profiles } from "../../drizzle/schema"
import { COOKIE_CONFIG, set_auth_cookies, clear_auth_cookies } from "./cookies"
import { get_server_url } from "@backend/server"
import { login_schema, signup_schema } from "@shared/auth"

export const auth_router = new Elysia({ prefix: "/auth" })
  .use(drizzle_plugin)
  .use(auth_plugin)
  .use(supabase_plugin)

  /**
   * GET /api/auth/me
   * Returns current user's profile based on cookie auth.
   * Auto-refreshes tokens via auth_plugin's resolve_auth.
   */
  .get("/me", ({ user }) => {
    return { type: "success", user }
  }, { isAuth: true })

  /**
   * POST /api/auth/signout
   * Clears auth cookies and signs out user.
   * 
   * Supabase allows only revoking all refresh tokens for user. Access tokens must expire on its own therefore it's recommended to set shorter expiry on them.
   */
  .post("/signout", async ({ cookie, status, sb  }) => {
      const refresh_token = cookie[COOKIE_CONFIG.refresh_token.name]?.value as string | undefined
      if (refresh_token) {
        const { error } = await sb.auth.admin.signOut(refresh_token, "local")
        if (!error) {
          clear_auth_cookies(cookie)
          return { type: "success" }
        }
      }

      return status(500, {
        type: "error",
        message: "Failed to log user out (invalidate refresh tokens)"
      })
  }, { isAuth: true })

  /**
   * POST /api/auth/signup
   * Creates a new user with email/password and profile.
   * Sets HttpOnly cookies on success.
   */
  .post("/signup", async ({ db, body, cookie, status, sb }) => {
    // (1) Create user in Supabase Auth using admin SDK
    const { data: auth_data, error: auth_error } = await sb.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name: body.name,
      }
    })

    if (auth_error || !auth_data.user) {
      console.error("[auth/signup] Supabase createUser failed:", auth_error)
      return status(400, {
        type: "error",
        message: auth_error?.message ?? "Failed to create user."
      })
    }

    // (2) Create profile row
    try {
      await db.insert(profiles).values({
        id: auth_data.user.id,
        name: body.name,
        email: body.email,
        role: "default",
      })
    } catch (profile_error) {
      // Rollback: delete the auth user if profile creation fails
      console.error("[auth/signup] Profile creation failed:", profile_error)
      await sb.auth.admin.deleteUser(auth_data.user.id)
      return status(500, {
        type: "error",
        message: "Failed to create user profile."
      })
    }

    // (3) Sign in the user to get session tokens
    const { data: session_data, error: session_error } = await sb.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (session_error || !session_data.session) {
      // User created but couldn't sign in - they can try login page
      return {
        type: "success",
        message: "Account created. Please sign in.",
      }
    }

    set_auth_cookies(
      cookie,
      session_data.session.access_token,
      session_data.session.refresh_token
    )

    return {
      type: "success",
      message: "Account created successfully.",
    }
  }, {
    body: signup_schema,
  })

  /**
   * POST /api/auth/signin
   * Signs in existing user with email/password.
   * Sets HttpOnly cookies on success.
   */
  .post("/signin", async ({ body, cookie, status, sb }) => {
    const { data, error } = await sb.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error || !data.session) {
      return status(401, {
        type: "error",
        message: error?.message ?? "Invalid credentials."
      })
    }

    set_auth_cookies(
      cookie,
      data.session.access_token,
      data.session.refresh_token
    )

    return { type: "success" }
  }, {
    body: login_schema,
  })

  /**
   * GET /api/auth/oauth/google
   * Initiates Google OAuth flow.
   * @returns OAuth URL for frontend to redirect to
   */
  .get("/oauth/google", async ({ status, sb }) => {
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${get_server_url("backend")}/api/auth/callback`,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: "offline",
        }
      },
    })

    if (error || !data.url) {
      console.error("[auth/oauth/google] Failed to initiate OAuth:", error)
      return status(500, {
        type: "error",
        message: "Failed to initiate OAuth flow."
      })
    }

    return { url: data.url }
  })

  /**
   * GET /api/auth/callback
   * Handles OAuth callback from Supabase/Google.
   * Exchanges code for session, sets cookies, and redirects to frontend.
   */
  .get("/callback", async ({ query, db, cookie, redirect, sb }) => {
    const code = query.code
    const error = query.error
    const error_description = query.error_description

    console.log(code, error, error_description)

    const frontend_url = get_server_url("frontend")

    // Handle OAuth errors
    if (error) {
      console.error("[auth/callback] OAuth error:", error, error_description)
      return redirect(`${frontend_url}/login?error=${encodeURIComponent(error_description ?? error)}`)
    }

    if (!code) return redirect(`${frontend_url}/login?error=missing_code`)

    try {
      // Exchange the code for session tokens
      const {
        data: session_data,
        error: session_error,
      } = await sb.auth.exchangeCodeForSession(code)

      if (session_error || !session_data.session || !session_data.user) {
        console.error("[auth/callback] Code exchange failed:", session_error)
        return redirect(`${frontend_url}/login?error=auth_failed`)
      }

      const user = session_data.user
      const session = session_data.session

      // Check if profile exists
      const existing_profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
        columns: { id: true }
      })

      // Create profile if doesn't exist (new OAuth user)
      if (!existing_profile) {
        // Extract name from Google metadata
        // TODO: Check Google name provided always?
        const google_name = user.user_metadata?.name
          ?? user.user_metadata?.full_name
          ?? user.email?.split("@")[0]
          ?? "Unknown Google User"

        await db.insert(profiles).values({
          id: user.id,
          name: google_name,
          email: user.email!,
          role: "default",
        })
      }

      set_auth_cookies(
        cookie,
        session.access_token,
        session.refresh_token,
      )

      return redirect(frontend_url)
    } catch (e) {
      console.error("[auth/callback] Unexpected error:", e)
      return redirect(`${frontend_url}/login?error=server_error`)
    }
  }, {
    query: z.object({
      code: z.string().optional(),
      error: z.string().optional(),
      error_description: z.string().optional(),
    })
  })
