import { OpenRouter } from "@openrouter/sdk"
import type { GetKeyResponse, DeleteKeysResponse } from "@openrouter/sdk/models/operations"
import type { ProvisionedKeyUsage } from "@shared/admin/invites"

interface ProvisionedKey {
  key: string,
  hash: string,
  name: string,
  /**
   * Credit limit in `USD`.
   */
  limit: number,
}

let api_key_manager_client: OpenRouter | null = null

function get_api_key_manager() {
  if (api_key_manager_client) return api_key_manager_client
  const provision_key = Bun.env.OPENROUTER_PROVISION_KEY
  api_key_manager_client = new OpenRouter({ apiKey: provision_key })
  return api_key_manager_client
}

/**
 * Creates a new API key using OpenRouter's Provisioning API.
 * 
 * Docs: https://openrouter.ai/docs/features/provisioning-api-keys
 * @returns `null` if error happened
 */
export async function provision_openrouter_key(
  recipient_name: string,
  credit_limit: number,
): Promise<ProvisionedKey | null> {
  const openrouter = get_api_key_manager()

  let response
  try {
    response = await openrouter.apiKeys.create({
      name: `Invite key for ${recipient_name}`,
      limit: credit_limit,
    })
  } catch (e) {
    console.error(`[provision_openrouter_key] failed to create new key for ${recipient_name}: ${e}`)
    return null
  }

  const new_key: ProvisionedKey = {
    key: response.key,
    hash: response.data.hash,
    name: response.data.name,
    limit: credit_limit,
  }
  return new_key
}

/**
 * Gets usage/balance for a provisioned key.
 * 
 * @returns `null` if error happened
 */
export async function get_provisioned_key_usage(key_hash: string) {
  const openrouter = get_api_key_manager()

  let response: GetKeyResponse | null = null
  try {
    response = await openrouter.apiKeys.get({
      hash: key_hash
    })
  } catch (e) {
    console.error(`[provision] Failed to get key usage`)
    return null
  }

  return {
    limit: response.data.limit!,
    remaining: response.data.limitRemaining!,
    usage: response.data.usage,
  } as ProvisionedKeyUsage
}

/**
 * Deletes a provisioned key.
 * @throws if OpenRouter API request fails
 */
export async function revoke_provisioned_key(key_hash: string) {
  const openrouter = get_api_key_manager()

  let response: DeleteKeysResponse | null = null
  try {
    response = await openrouter.apiKeys.delete({ hash: key_hash })
    return response.deleted
  } catch (e) {
    console.log("Failed to revoke provisioned key!", e)
    return false
  }
}

/**
 * Generates a unique invite code.
 * Uses characters that are easy to read and type (no 0, O, 1, I).
 * @returns {string} generated invite code
 */
export function generate_invite_code() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  // TODO: Sync this number
  const length = 10
  const random_values = new Uint32Array(length)
  crypto.getRandomValues(random_values)

  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[random_values[i] % chars.length]
  }
  return code
}