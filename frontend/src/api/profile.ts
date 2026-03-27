import { api } from "./index"

/**
 * GET /profile/me
 * 
 * Get current user's profile
 */
export const get_my_profile = async () => {
  const response = await api.profile.me.get()
  if (response.error) throw response.error
  return response.data
}

/**
 * GET /profile/model-visibility
 *
 * Retrieves admin-managed model visibility settings.
 */
export const get_model_visibility = async () => {
  const response = await api.profile["model-visibility"].get()
  if (response.error) throw response.error
  return response.data
}

/**
 * GET /profile/provider-usage
 *
 * Retrieves compact provider usage data for the top bar.
 */
export const get_provider_usage = async () => {
  const response = await api.profile["provider-usage"].get()
  if (response.error) throw response.error
  return response.data
}

/**
 * POST /profile/provider-usage/claude-refresh
 *
 * Manually refreshes Claude usage.
 */
export const refresh_claude_usage = async () => {
  const response = await api.profile["provider-usage"]["claude-refresh"].post()
  if (response.error) throw response.error
  return response.data
}

/**
 * PATCH /profile/me
 * 
 * Update profile name
 */
export const update_my_profile = async (name: string) => {
  const response = await api.profile.me.patch({ name })
  if (response.error) throw response.error
  return response.data
}

/**
 * POST /profile/openrouter-key
 * 
 * Set OpenRouter API key
 */
export const set_openrouter_key = async (api_key: string) => {
  const response = await api.profile["openrouter-key"].post({ api_key })
  if (response.error) throw response.error
  return response.data
}

/**
 * DELETE /profile/openrouter-key
 * 
 * Remove OpenRouter API key
 */
export const delete_openrouter_key = async () => {
  const response = await api.profile["openrouter-key"].delete()
  if (response.error) throw response.error
  return response.data
}

/**
 * POST /profile/metacentrum-key
 *
 * Set MetaCentrum API key
 */
export const set_metacentrum_key = async (api_key: string) => {
  const response = await api.profile["metacentrum-key"].post({ api_key })
  if (response.error) throw response.error
  return response.data
}

/**
 * DELETE /profile/metacentrum-key
 *
 * Remove MetaCentrum API key
 */
export const delete_metacentrum_key = async () => {
  const response = await api.profile["metacentrum-key"].delete()
  if (response.error) throw response.error
  return response.data
}

/**
 * POST /profile/redeem-invite
 * 
 * Redeem an invite code
 */
export const redeem_invite = async (code: string) => {
  const response = await api.profile["redeem-invite"].post({ code })
  if (response.error) throw response.error
  return response.data
}
