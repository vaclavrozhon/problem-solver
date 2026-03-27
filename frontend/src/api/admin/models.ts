import { api } from "../index"
import type { ModelVisibility } from "@shared/admin/models"

/**
 * GET /admin/models/settings
 *
 * Retrieves global admin model visibility settings.
 */
export const get_admin_model_settings = async () => {
  const response = await api.admin.models.settings.get()
  if (response.error) throw response.error
  return response.data
}

/**
 * PATCH /admin/models/settings
 *
 * Updates global admin model visibility settings.
 */
export const update_admin_model_settings = async (model_visibility: ModelVisibility) => {
  const response = await api.admin.models.settings.patch({ model_visibility })
  if (response.error) throw response.error
  return response.data
}
