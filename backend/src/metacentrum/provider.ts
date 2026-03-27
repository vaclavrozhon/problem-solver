import { eq } from "drizzle-orm"
import { profiles } from "../../drizzle/schema"
import { decrypt_api_key } from "../encryption"
import type { Database } from "../db"

function get_metacentrum_base_url() {
  const base = Bun.env.METACENTRUM_BASE_URL ?? "https://llm.ai.e-infra.cz/v1"
  return base.endsWith("/") ? base.slice(0, -1) : base
}

export async function is_valid_metacentrum_key(api_key: string) {
  try {
    const response = await fetch(`${get_metacentrum_base_url()}/models`, {
      headers: { Authorization: `Bearer ${api_key}` },
    })
    if (!response.ok) return false

    const data = await response.json() as Record<string, unknown>
    return Array.isArray(data.data)
  } catch (error) {
    console.error("[metacentrum] Failed to validate API key:", error)
    throw new Error("Failed to validate MetaCentrum API key.")
  }
}

export async function get_user_metacentrum_key(
  db: Database,
  user_id: string,
): Promise<string> {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user_id),
    columns: {
      id: true,
      metacentrum_key_encrypted: true,
      metacentrum_key_iv: true,
      metacentrum_encryption_key_version: true,
    }
  })

  if (!profile) throw new Error(`[get_user_metacentrum_key] User profile not found for id: ${user_id}`)
  if (!profile.metacentrum_key_encrypted || !profile.metacentrum_key_iv || !profile.metacentrum_encryption_key_version) {
    throw new Error("You must configure your MetaCentrum API key before running research. Go to Profile Settings to add your key.")
  }

  return decrypt_api_key(
    profile.metacentrum_key_encrypted,
    profile.metacentrum_key_iv,
    profile.id,
    profile.metacentrum_encryption_key_version,
  )
}

export async function user_has_metacentrum_key(
  db: Database,
  user_id: string
): Promise<boolean> {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user_id),
    columns: {
      metacentrum_key_encrypted: true,
      metacentrum_key_iv: true,
      metacentrum_encryption_key_version: true,
    }
  })
  if (!profile) throw new Error(`[user_has_metacentrum_key] Couldn't find user with id: ${user_id}`)

  return !!(
    profile.metacentrum_key_encrypted
    && profile.metacentrum_key_iv
    && profile.metacentrum_encryption_key_version
  )
}

export function get_metacentrum_model_id(model_id: string) {
  if (model_id === "metacentrum/kimi-k2.5") return "kimi-k2.5"
  if (model_id === "metacentrum/gpt-oss-120b") return "gpt-oss-120b"
  if (model_id === "metacentrum/deepseek-v3.2-thinking") return "deepseek-v3.2-thinking"
  if (model_id === "metacentrum/glm-4.7") return "glm-4.7"
  return model_id
}

export function get_metacentrum_api_base_url() {
  return get_metacentrum_base_url()
}
