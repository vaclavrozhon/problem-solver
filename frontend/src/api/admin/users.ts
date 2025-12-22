import { api } from "../index"

/**
 * GET /admin/users - List all users (Admin only)
 */
export const get_all_users = async () => {
  const response = await api.admin.users.all.get()
  if (response.error) throw response.error
  return response.data
}