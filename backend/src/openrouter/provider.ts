import { createOpenRouter, type OpenRouterProvider } from "@openrouter/ai-sdk-provider"
import { eq } from "drizzle-orm"
import { profiles } from "../../drizzle/schema"
import { decrypt_api_key } from "../encryption"
import { is_admin } from "@shared/auth"
import type { Database } from "../db"

/**
 * TODO: Remove this function. It's not used anymore.
 * 
 * Returns OpenRouter provider for a specific user.
 *
 * @throws If no profile with `user_id` exists.
 * @returns OpenRouterProvider for user: `user.id === user_id`
 */
export async function get_openrouter_for_user(
  db: Database,
  user_id: string
): Promise<OpenRouterProvider> {
  return createOpenRouter({
    apiKey: await get_user_openrouter_key(db, user_id),
    headers: {
      "HTTP-Referer": "https://bolzano.app",
      "X-Title": "Bolzano",
    },
  })
}

/**
 * Fetches the user's role from DB (don't trust the payload).
 * Admin -> system key from OPENROUTER_API_KEY env
 * Regular user -> decrypts their stored key
 *
 * This function is called at job **EXECUTION time**, not when job is queued.
 * Keys are never stored in Redis.
 * 
 * @throws If no profile with `user_id` exists.
 * @returns decrypted OpenRouter API key for specific user
 */
export async function get_user_openrouter_key(
  db: Database,
  user_id: string,
): Promise<string> {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user_id),
    columns: {
      id: true,
      role: true,
      openrouter_key_encrypted: true,
      openrouter_key_iv: true,
      encryption_key_version: true,
    }
  })

  if (!profile) throw new Error(`[get_openrouter_for_user] User profile not found for id: ${user_id}`)

  // Admin users **ALWAYS** use system key
  if (is_admin(profile.role)) return Bun.env.OPENROUTER_API_KEY

  // Regular users must have their own key
  if (!profile.openrouter_key_encrypted || !profile.openrouter_key_iv || !profile.encryption_key_version) throw new Error("You must configure your OpenRouter API key before running research. Go to Profile Settings to add your key.")

  // Decrypt key at execution time
  return decrypt_api_key(
    profile.openrouter_key_encrypted,
    profile.openrouter_key_iv,
    profile.id,
    profile.encryption_key_version,
  )
}

/**
 * Checks whether user has set openrouter key or is admin (admin use system key).
 * 
 * Used before calling JobManager to make sure the user can finish the job.
 * User can always remove their key whilst job is queued/before job
 * calls openrouter but the fact the job fails, is their mistake.
 * 
 * Call this BEFORE queueing a job to fail fast.
 * 
 * @throws If no profile with `user_id` exists.
 * @returns `true` if user has set OpenRouter key, else `false`.
 */
export async function user_has_openrouter_key(
  db: Database,
  user_id: string
): Promise<boolean> {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user_id),
    columns: {
      role: true,
      openrouter_key_encrypted: true,
      openrouter_key_iv: true,
      encryption_key_version: true,
    }
  })
  if (!profile) throw new Error(`[user_has_openrouter_key] Couldn't find user with id: ${user_id}`)

  // Admin always uses system key
  if (is_admin(profile.role)) return true

  // Regular user needs own key
  if (profile.openrouter_key_encrypted
    && profile.openrouter_key_iv
    && profile.encryption_key_version) return true

  return false
}
