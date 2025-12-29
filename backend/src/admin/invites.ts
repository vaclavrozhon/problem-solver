import { Elysia } from "elysia"
import { z } from "zod"
import { eq, desc, and } from "drizzle-orm"
import { OpenRouter } from "@openrouter/sdk"

import { auth_plugin, drizzle_plugin } from "../plugins"
import { invites } from "../../drizzle/schema"
import { encrypt_api_key } from "../encryption"
import {
  provision_openrouter_key,
  get_provisioned_key_usage,
  revoke_provisioned_key,
  generate_invite_code
} from "../openrouter/provision"
import type { ProvisionedKeyUsage } from "@shared/admin/invites"
import { invite_schema } from "@shared/admin/invites"

export const invites_router = new Elysia({ prefix: "/invites" })
  .use(auth_plugin)
  .use(drizzle_plugin)

  /**
   * [ADMIN] GET /admin/invites/all
   * 
   * Lists all invites with details.
   * 
   * MANUALLY TESTED?: Yes, works
   */
  .get("/all", async ({ db, admin }) => {
    const all_invites = await db.query.invites.findMany({
      columns: {
        id: true,
        code: true,
        recipient_name: true,
        credit_limit: true,
        status: true,
        created_at: true,
        redeemed_at: true,
        openrouter_key_hash: true,
      },
      with: {
        created_by_profile: {columns: { name: true } },
        redeemed_by_profile: { columns: {
          name: true,
          email: true,
          key_source: true,
        }},
      },
      orderBy: [desc(invites.created_at)],
    })

    const invites_with_usage = await Promise.all(
      all_invites.map(async (invite) => {
        let usage: ProvisionedKeyUsage | null = null
        if (invite.status === "redeemed") {
          try {
            usage = await get_provisioned_key_usage(invite.openrouter_key_hash)
          } catch (e) {
            console.error(`[admin/invites] Failed to get usage for ${invite.code}:`, e)
          }
        }
        let user_switched_to_own_key = false
        if (invite.redeemed_by_profile) {
          // NOTE: Can't simplify to ?-nesting as it would introduce `undefined`
          if (invite.redeemed_by_profile.key_source !== "provisioned") {
            // The user simply switched to his own key, then maybe removed it
            // or just removed the key he got from us without providing his own
            // (very unlikely behavior but still possible)
            // either way this check is not entirely 100 % sure but
            // with current architecture, we can't do any better
            // and this should cover most cases and be enough
            user_switched_to_own_key = true
          }
        }

        return {
          id: invite.id,
          code: invite.code,
          recipient_name: invite.recipient_name,
          credit_limit: invite.credit_limit,
          status: invite.status,
          created_at: invite.created_at,
          created_by: invite.created_by_profile.name,
          redeemed_at: invite.redeemed_at,
          redeemed_by: invite.redeemed_by_profile ? {
            name: invite.redeemed_by_profile.name,
            email: invite.redeemed_by_profile.email,
          } : null,
          usage,
          user_switched_to_own_key,
        }
      })
    )

    let { data: admin_openrouter_credits } = await new OpenRouter({
      apiKey: Bun.env.OPENROUTER_API_KEY
    }).credits
      .getCredits()

    return {
      invites: invites_with_usage,
      admin_balance: admin_openrouter_credits.totalCredits 
        - admin_openrouter_credits.totalUsage
    }
  }, { isAdmin: true })

  /**
   * [ADMIN] POST /admin/invites/create
   * Creates a new invite with provisioned OpenRouter key.
   * 
   * MANUALLY TESTED?: Yes, works
   */
  .post("/create", async ({ db, body, admin, status }) => {
    try {
      // (1) Provision key from OpenRouter
      const provisioned = await provision_openrouter_key(
        body.recipient_name,
        body.credit_limit,
      )
      if (provisioned === null) return status(500, {
        type: "error",
        message: "Failed to provision new key."
      })

      // (2) Encrypt the key for storage
      const { encrypted, iv, version } = encrypt_api_key(provisioned.key, admin.id)

      // (3) Generate unique invite code
      const code = generate_invite_code()

      // (4) Store in database
      const [invite] = await db.insert(invites)
        .values({
          code,
          recipient_name: body.recipient_name,
          openrouter_key_encrypted: encrypted,
          openrouter_key_iv: iv,
          openrouter_key_hash: provisioned.hash,
          encryption_key_version: version,
          credit_limit: body.credit_limit,
          created_by: admin.id,
        })
        .returning({
          id: invites.id,
          code: invites.code,
        })

      return {
        type: "success",
        message: "Invite created successfully.",
        invite: {
          id: invite.id,
          code: invite.code,
          recipient_name: body.recipient_name,
          credit_limit: body.credit_limit,
        }
      }
    } catch (e) {
      console.error("[admin/invites] Failed to create invite:", e)
      return status(500, {
        type: "error",
        message: `Failed to create invite: ${(e as Error).message}`
      })
    }
  }, {
    isAdmin: true,
    body: invite_schema,
  })

  /**
   * [ADMIN] DELETE /admin/invites/:invite_id
   * 
   * Removes an invite and its associated key.
   * 
   * MANUALLY TESTED?: Yes, works.
   */
  .delete("/:invite_id", async ({ params, db, status }) => {
    try {
      // (1) Firstly, mark as `to-be-removed` (only if still pending)
      // This prevents race condition with user redemption
      const updated = await db.update(invites)
        .set({ status: "to-be-removed" })
        .where(and(
          eq(invites.id, params.invite_id),
          eq(invites.status, "pending")
        ))
        .returning({
          id: invites.id,
          openrouter_key_hash: invites.openrouter_key_hash,
        })

      // Check if invite exists and why it couldn't be updated
      if (updated.length === 0) {
        const invite = await db.query.invites.findFirst({
          where: eq(invites.id, params.invite_id),
          columns: { status: true }
        })

        if (!invite) {
          return status(400, { type: "error", message: "Invite not found." })
        }
        if (invite.status === "redeemed") {
          return status(409, {
            type: "error",
            message: "Cannot remove: invite was already redeemed."
          })
        }
        return status(422, {
          type: "error",
          message: "Invite is already pending removal!"
        })
      }

      // (2) Invite marked as expired, now revoke key from OpenRouter
      // Even if this fails, the invite is expired so user can't redeem
      let revoked = await revoke_provisioned_key(updated[0].openrouter_key_hash)
      if (!revoked) throw new Error("Failed to revoke provisioned key.")

      await db.delete(invites)
        .where(and(
          eq(invites.id, params.invite_id),
          eq(invites.status, "to-be-removed")
        ))

      return { type: "success", message: "Invite expired and key revoked." }
    } catch (e) {
      console.error(e)
      return status(500, {
        type: "error",
        message: "Failed to remove invite or revoke key."
      })
    }
  }, {
    isAdmin: true,
    params: z.object({
      // TODO: can this potentially be empty?
      invite_id: z.uuid(),
    }),
  })
