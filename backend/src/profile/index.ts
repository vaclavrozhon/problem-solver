import { Elysia } from "elysia"
import { z } from "zod"
import { eq, sql, and } from "drizzle-orm"
import { auth_plugin, drizzle_plugin } from "../plugins"
import { profiles, invites } from "../../drizzle/schema"
import { decrypt_api_key, encrypt_api_key } from "../encryption"
import { is_valid_openrouter_key, get_openrouter_balance } from "../openrouter/general"
import { invite_code_schema, user_name_schema, openrouter_api_key_schema } from "@shared/auth"

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
   * [AUTH] GET /profile/balance
   * 
   * Retrieves OpenRouter balance & usage
   * If no key set, returns `204` code.
   * 
   * MANUALLY TESTED?: yes, works
   */
  .get("/balance", async ({ db, user, status }) => {
    try {
      const balance = get_openrouter_balance(db, user)
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