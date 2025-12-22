import { api } from "./index"

/**
 * Retrieves OpenRouter balance & usage.
 * 
 * Used at `/usage`.
 */
export async function get_openrouter_usage() {
  const response = await api.profile.balance.get()
  if (response.error) throw response.error
  // BUG: THIS IS SUPER BUGGY TO THE POINT IT MAKES NO SENSE
  if (response.status === 204 || response.data === "No Content") return null
  return response.data
}