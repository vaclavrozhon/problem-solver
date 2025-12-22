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