import { Elysia } from "elysia"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { drizzle_plugin } from "../plugins"
import { profiles } from "../../drizzle/schema"
import { get_supabase_admin } from "../db"

export const auth_router = new Elysia({ prefix: "/auth" })
  .use(drizzle_plugin)

  /**
   * POST /api/auth/signup
   * Creates a new user with email/password and profile.
   */
  .post("/signup", async ({ db, body, status }) => {
    const supabase_admin = get_supabase_admin()

    // (1) Create user in Supabase Auth using admin SDK
    const { data: auth_data, error: auth_error } = await supabase_admin.auth.admin.createUser({
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
      await supabase_admin.auth.admin.deleteUser(auth_data.user.id)
      return status(500, {
        type: "error",
        message: "Failed to create user profile."
      })
    }

    // (3) Sign in the user to get session tokens
    const { data: session_data, error: session_error } = await supabase_admin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (session_error || !session_data.session) {
      // User created but couldn't sign in - they can try login page
      return {
        type: "success",
        message: "Account created. Please sign in.",
        session: null,
      }
    }

    return {
      type: "success",
      message: "Account created successfully.",
      session: {
        access_token: session_data.session.access_token,
        refresh_token: session_data.session.refresh_token,
        expires_in: session_data.session.expires_in,
        expires_at: session_data.session.expires_at,
      },
    }
  }, {
    // SYNC THESE
    body: z.object({
      email: z.email("Invalid email address."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      name: z.string().min(2, "Name is required.").max(50, "Name too long."),
    })
  })

  /**
   * POST /api/auth/signin
   * Signs in existing user with email/password.
   */
  .post("/signin", async ({ body, status }) => {
    const supabase_admin = get_supabase_admin()

    const { data, error } = await supabase_admin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error || !data.session) {
      return status(401, {
        type: "error",
        message: error?.message ?? "Invalid credentials."
      })
    }

    return {
      type: "success",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      }
    }
  }, {
    // TODO: sync theses
    body: z.object({
      email: z.email(),
      password: z.string().min(8),
    })
  })

  /**
   * GET /api/auth/oauth/google
   * Initiates Google OAuth flow.
   * @returns OAuth URL for frontend to redirect to
   */
  .get("/oauth/google", async ({ status }) => {
    const supabase_admin = get_supabase_admin()

    // TODO: make this external reusable function
    const backend_url = Bun.env.NODE_ENV === "production"
      ? `https://${Bun.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${Bun.env.BACKEND_PORT}`

    const { data, error } = await supabase_admin.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${backend_url}/api/auth/callback`,
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
   * Exchanges code for session and creates profile if needed.
   */
  .get("/callback", async ({ query, db, redirect }) => {
    const supabase_admin = get_supabase_admin()

    const code = query.code
    const error = query.error
    const error_description = query.error_description

    console.log(code, error, error_description)

    // TODO: move external
    const frontend_url = Bun.env.NODE_ENV === "production"
      ? `https://${Bun.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${Bun.env.FRONTEND_PORT}`

    // Handle OAuth errors
    if (error) {
      console.error("[auth/callback] OAuth error:", error, error_description)
      return redirect(`${frontend_url}/login?error=${encodeURIComponent(error_description ?? error)}`)
    }

    if (!code) return redirect(`${frontend_url}/login?error=missing_code`)

    try {
      // Exchange the code for session tokens
      const { data: session_data, error: session_error } = await supabase_admin.auth.exchangeCodeForSession(code)

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

      // Redirect to frontend with tokens in URL fragment (hash)
      // Tokens in fragment are not sent to server in HTTP requests
      const redirect_url = new URL(`${frontend_url}/auth/callback`)
      redirect_url.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&expires_in=${session.expires_in}&token_type=bearer`

      return redirect(redirect_url.toString())
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
