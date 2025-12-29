import { eq } from "drizzle-orm"
import { profiles } from "../../drizzle/schema"
import { OpenRouter } from "@openrouter/sdk"
import type { GetCreditsData } from "@openrouter/sdk/models/operations"

import { is_admin } from "@shared/auth"
import { decrypt_api_key } from "../encryption"
import type { User } from "@shared/auth"
import type { Database } from "../db"

/**
 * Validates OpenRouter key against its API
 * @param api_key API key to validate
 * @returns `true` if valid OpenRouter key, else `false`
 */
export async function is_valid_openrouter_key(api_key: string) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { "Authorization": `Bearer ${api_key}` }
    })
    if (response.ok) return true
    return false
  } catch (e) {
    console.error("[profile] Failed to validate API key:", e)
    throw new Error("Failed to validate API key.")
  }
}

/**
 * Retrieves OpenRouter & usage through linked API key
 * Usage per key (not total for account)
 * @returns `null` is not key set, otherwise balance on key
 */
// TODO: Should actually split this even futher by cutting out the openrouter key decryption
export async function get_openrouter_balance(db: Database, user: User) {
  let decrypted_key
  if (is_admin(user.role)) {
    decrypted_key = Bun.env.OPENROUTER_API_KEY
  } else {
    const api_key = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: {
        openrouter_key_encrypted: true,
        openrouter_key_iv: true,
        encryption_key_version: true,
      }
    })
    if (!api_key) return null
    if (
      api_key.encryption_key_version === null
      || api_key.openrouter_key_encrypted === null
      || api_key.openrouter_key_iv === null
    ) return null

    decrypted_key = decrypt_api_key(
      api_key.openrouter_key_encrypted,
      api_key.openrouter_key_iv,
      user.id,
      api_key.encryption_key_version
    )
  }

  const openrouter = new OpenRouter({ apiKey: decrypted_key })

  // Works for all keys
  const { data: key_metadata } = await openrouter.apiKeys.getCurrentKeyMetadata()

  // This endpoint works only for non-provisioned keys
  let credits: GetCreditsData | null = null
  try {
    const response = await openrouter.credits.getCredits()
    credits = response.data
  } catch (e) {}

  // /credits returns usage for whole account even if current key has no usage
  // => usage needs to be inherited from key metadata at all times
  const key_usage = key_metadata.usage
  
  /**
   * if the key is provisioned, openrouter disallows access to /credits
   * that reveals total account balance -> no way to get actual available
   * credits for provisioned key – uncertainty whether you can use it or not
   * => provisioned key: show remaining key limit, if no limit, return null
   * => manual key:
   *      -    limit: min{ account_balance, remaining_key_limit }
   *      - no limit: account balance
   */
  let key_balance: number | null
  if (credits) {
    const total_account_balance = credits.totalCredits - credits.totalUsage
    if (key_metadata.limitRemaining) key_balance = Math.min(total_account_balance, key_metadata.limitRemaining)
    else key_balance = total_account_balance
  } else {
    key_balance = key_metadata.limitRemaining
  }

  return {
    usage: key_usage,
    balance: key_balance,
    // TODO: BYOK UI
    // byok_usage: key_metadata.byokUsage,
  }
}