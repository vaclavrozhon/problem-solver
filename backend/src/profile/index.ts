import { Elysia } from "elysia"
import { z } from "zod"
import { eq, sql, and } from "drizzle-orm"
import { auth_plugin, drizzle_plugin } from "../plugins"
import { profiles, invites } from "../../drizzle/schema"
import { decrypt_api_key, encrypt_api_key } from "../encryption"
import { is_valid_openrouter_key, get_openrouter_balance } from "../openrouter/general"
import { is_valid_metacentrum_key } from "../metacentrum/provider"
import { invite_code_schema, user_name_schema, openrouter_api_key_schema, metacentrum_api_key_schema } from "@shared/auth"
import { get_enabled_transports } from "@shared/admin/models"
import type {
  ClaudeUsageSnapshot,
  CodexUsageSnapshot,
  GeminiUsageSnapshot,
  ProviderUsagePayload,
} from "@shared/profile/provider_usage"
import { get_admin_model_settings, get_admin_model_visibility } from "../app_settings"
import { cached_claude_usage_snapshot, refresh_claude_usage_snapshot } from "../usage/claude"
import { read_live_codex_usage_snapshot } from "../usage/codex"
import { read_live_gemini_usage_snapshot } from "../usage/gemini"

function disabled_codex_snapshot(error: string | null = null): CodexUsageSnapshot {
  return {
    available: false,
    captured_at: null,
    weekly: null,
    five_hour: null,
    limit_id: null,
    limit_name: null,
    plan_type: null,
    error,
  }
}

function disabled_gemini_snapshot(error: string | null = null): GeminiUsageSnapshot {
  return {
    available: false,
    captured_at: null,
    profiles: {
      pro: null,
      flash: null,
    },
    pooled: null,
    error,
  }
}

function disabled_claude_snapshot(error: string | null = null): ClaudeUsageSnapshot {
  return {
    available: false,
    refreshed: false,
    captured_at: null,
    weekly: null,
    session: null,
    overage: null,
    error,
  }
}

async function build_provider_usage_payload(db: Parameters<typeof get_admin_model_visibility>[0]): Promise<ProviderUsagePayload> {
  const model_visibility = await get_admin_model_visibility(db)
  const transports = get_enabled_transports(model_visibility)
  const [codex, gemini] = await Promise.all([
    transports.codex_cli
      ? read_live_codex_usage_snapshot()
      : Promise.resolve(disabled_codex_snapshot("Codex transport is disabled in admin model settings.")),
    transports.gemini_cli
      ? read_live_gemini_usage_snapshot()
      : Promise.resolve(disabled_gemini_snapshot("Gemini transport is disabled in admin model settings.")),
  ])

  return {
    enabled_transports: {
      codex_cli: transports.codex_cli,
      gemini_cli: transports.gemini_cli,
      claude_cli: transports.claude_cli,
    },
    codex,
    gemini,
    claude: transports.claude_cli
      ? cached_claude_usage_snapshot()
      : disabled_claude_snapshot("Claude transport is disabled in admin model settings."),
  }
}

export const profile_router = new Elysia({ prefix: "/profile" })
  .use(auth_plugin)
  .use(drizzle_plugin)

  /**
   * [AUTH] GET /profile/me
   * Returns current user's profile.
   * 
   * This endpoint exists even though it's the same as /auth/me
   * because in the future, we might want to extend it to accommodate
   * new requirements and it'd have to re-created. Therefore, it's better
   * to keep it rather than delete it now and re-introduce it later
   * 
   * MANUALLY TESTED?: YES, works.
   */
  .get("/me", async ({ user }) => {
    return user
  }, { isAuth: true })

  /**
   * [AUTH] PATCH /profile/me
   * Updates profile's name
   * 
   * MANUALLY TESTED?: YES, works
   */
  .patch("/me", async ({ user, db, body, status }) => {
    try {
      await db.update(profiles)
        .set({
          name: body.name,
          updated_at: sql`NOW()`,
        })
        .where(eq(profiles.id, user.id))

      return { type: "success", message: "Profile successfully updated." }
    } catch (e) {
      console.error(`[profile] Failed to update for user_id: ${user.id}`, e)
      return status(500, { type: "error", message: "Failed to update profile." })
    }
  }, {
    isAuth: true,
    body: z.object({
      name: user_name_schema,
    })
  })

  /**
   * POST /profile/openrouter-key
   * Sets encrypted OpenRouter API key.
   * 
   * MANUALLY TESTED?: YES, works!
   */
  .post("/openrouter-key", async ({ user, db, body, status }) => {    
    try {
      // (1) Validate OpenRouter key
      const is_valid = await is_valid_openrouter_key(body.api_key)
      if (!is_valid) return status(401, {
        type: "error",
        message: "Invalid API key or unable to verify."
      })
      
      // (2) Encrypt the key for at reast storage
      const { encrypted, iv, version } = encrypt_api_key(body.api_key, user.id)

      // (3) Update profile
      await db.update(profiles)
        .set({
          openrouter_key_encrypted: encrypted,
          openrouter_key_iv: iv,
          encryption_key_version: version,
          key_source: "self",
          updated_at: sql`NOW()`,
        })
        .where(eq(profiles.id, user.id))

      return { type: "success", message: "OpenRouter API key saved securely." }
    } catch (e) {
      console.error("[profile] Failed to process OpenRouter API key:", e)
      return status(500, { type: "error", message: "Failed to process OpenRouter API key!" })
    }
  }, {
    isAuth: true,
    body: z.object({
      api_key: openrouter_api_key_schema,
    })
  })

  /**
   * [AUTH] DELETE /profile/openrouter-key
   * Removes OpenRouter API key.
   * 
   * MANUALLY TESTED?: Yes, it works!
   */
  .delete("/openrouter-key", async ({ user, db, status }) => {
    try {
      await db.update(profiles)
        .set({
          openrouter_key_encrypted: null,
          openrouter_key_iv: null,
          encryption_key_version: null,
          key_source: null,
          provisioned_invite_id: null,
          updated_at: sql`NOW()`,
        })
        .where(eq(profiles.id, user.id))

      return { type: "success", message: "OpenRouter API key removed." }
    } catch (e) {
      console.error("[profile] Failed to remove API key:", e)
      return status(500, { type: "error", message: "Failed to remove API key." })
    }
  }, { isAuth: true })

  /**
   * POST /profile/metacentrum-key
   * Sets encrypted MetaCentrum API key.
   */
  .post("/metacentrum-key", async ({ user, db, body, status }) => {
    try {
      const is_valid = await is_valid_metacentrum_key(body.api_key)
      if (!is_valid) return status(401, {
        type: "error",
        message: "Invalid MetaCentrum API key or unable to verify."
      })

      const { encrypted, iv, version } = encrypt_api_key(body.api_key, user.id)
      await db.update(profiles)
        .set({
          metacentrum_key_encrypted: encrypted,
          metacentrum_key_iv: iv,
          metacentrum_encryption_key_version: version,
          updated_at: sql`NOW()`,
        })
        .where(eq(profiles.id, user.id))

      return { type: "success", message: "MetaCentrum API key saved securely." }
    } catch (e) {
      console.error("[profile] Failed to process MetaCentrum API key:", e)
      const error_message = e instanceof Error ? e.message : String(e)
      if (error_message.includes("ENCRYPTION_MASTER_KEY_V")) {
        return status(500, {
          type: "error",
          message: "Server encryption key is not configured (`ENCRYPTION_MASTER_KEY_V1`). Please set it in .env and restart backend."
        })
      }
      return status(500, { type: "error", message: "Failed to process MetaCentrum API key!" })
    }
  }, {
    isAuth: true,
    body: z.object({
      api_key: metacentrum_api_key_schema,
    })
  })

  /**
   * [AUTH] DELETE /profile/metacentrum-key
   * Removes MetaCentrum API key.
   */
  .delete("/metacentrum-key", async ({ user, db, status }) => {
    try {
      await db.update(profiles)
        .set({
          metacentrum_key_encrypted: null,
          metacentrum_key_iv: null,
          metacentrum_encryption_key_version: null,
          updated_at: sql`NOW()`,
        })
        .where(eq(profiles.id, user.id))

      return { type: "success", message: "MetaCentrum API key removed." }
    } catch (e) {
      console.error("[profile] Failed to remove MetaCentrum API key:", e)
      return status(500, { type: "error", message: "Failed to remove MetaCentrum API key." })
    }
  }, { isAuth: true })

  /**
   * POST /profile/redeem-invite
   * 
   * Redeems an invite code and assigns the provisioned key to user.
   * If user already has set their OpenRouter key, this overrides the key
   * (if the invite code is valid, of course)
   * 
   * MANUALLY TESTED?: Yes, works!
   */
  .post("/redeem-invite", async ({ db, body, user, status }) => {
    // (1) Find the invite
    const invite = await db.query.invites.findFirst({
      where: eq(invites.code, body.code),
      columns: {
        id: true,
        status: true,
        openrouter_key_encrypted: true,
        openrouter_key_iv: true,
        encryption_key_version: true,
        credit_limit: true,
        created_by: true,
      }
    })

    if (!invite) return status(400, {
      type: "error",
      message: "Invalid invite code."
    })

    if (invite.status !== "pending") return status(400, {
      type: "error",
      message: "This invite has already been redeemed."
    })

    // (2) Assign key to user and mark invite as redeemed
    const result = await db.transaction(async (tx) => {
      // Only update the invite if still pending
      const updated = await tx.update(invites)
        .set({
          status: "redeemed",
          redeemed_by: user.id,
          redeemed_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        })
        .where(and(
          eq(invites.id, invite.id),
          eq(invites.status, "pending")
        ))
        .returning({ id: invites.id })

      // If no rows updated, invite was remove between read and write
      if (updated.length === 0) return {
        type: "error",
        message: "Invite is no longer available."
      }

      // Need to re-encrypt the OpenRouter key with new users id.
      const { encrypted, iv, version } = encrypt_api_key(
        decrypt_api_key(
          invite.openrouter_key_encrypted,
          invite.openrouter_key_iv,
          invite.created_by,
          invite.encryption_key_version
        ),
        user.id,
      )

      // Invite claimed successfully, now assign key to user
      await tx.update(profiles)
        .set({
          openrouter_key_encrypted: encrypted,
          openrouter_key_iv: iv,
          encryption_key_version: version,
          key_source: "provisioned",
          provisioned_invite_id: invite.id,
          updated_at: sql`NOW()`,
        })
        .where(eq(profiles.id, user.id))

      return { type: "success" }
    })

    if (result.type !== "success") return status(409, {
      type: "error",
      message: result.message,
    })

    return {
      type: "success",
      message: "Invite redeemed! You now have an API key with credit limit."
    }
  }, {
    isAuth: true,
    body: z.object({
      code: invite_code_schema,
    })
  })

  /**
   * [AUTH] GET /profile/model-visibility
   *
   * Returns admin-managed model visibility for model selectors.
   */
  .get("/model-visibility", async ({ db }) => {
    return get_admin_model_settings(db)
  }, { isAuth: true })

  /**
   * [AUTH] GET /profile/provider-usage
   *
   * Returns compact provider usage data for enabled local transports.
   */
  .get("/provider-usage", async ({ db }) => {
    return build_provider_usage_payload(db)
  }, { isAuth: true })

  /**
   * [AUTH] POST /profile/provider-usage/claude-refresh
   *
   * Manual-only Claude usage refresh.
   */
  .post("/provider-usage/claude-refresh", async ({ db }) => {
    const model_visibility = await get_admin_model_visibility(db)
    const transports = get_enabled_transports(model_visibility)
    if (!transports.claude_cli) {
      return disabled_claude_snapshot("Claude transport is disabled in admin model settings.")
    }
    return await refresh_claude_usage_snapshot()
  }, { isAuth: true })

  /**
   * [AUTH] GET /profile/balance
   * 
   * Retrieves OpenRouter balance & usage
   * If no key set, returns `204` code.
   * 
   * MANUALLY TESTED?: yes, works
   */
  .get("/balance", async ({ db, user, status }) => {
    try {
      const balance = await get_openrouter_balance(db, user)
      if (balance === null) return status(204)
      return balance
    } catch (e) {
      console.log("[/profile/balance] failed", e)
      return status(500, {
        type: "error",
        message: "Failed to get balance."
      })
    }
  }, { isAuth: true })
