import { api } from "./index"

/**
 * Retrieves OpenRouter balance & usage.
 * 
 * Used at `/usage`.
 */
export async function get_openrouter_usage() {
  const response = await api.account["openrouter-balance"].get()
  if (response.error || response.data === null) throw response.error
  return response.data
}