import { api } from "../index"
import type { Invite, CreateInviteParams, CreateInviteResult } from "@shared/admin/invites"

/**
 * GET /admin/invites
 * 
 * List all invites
 */
export const get_all_invites = async () => {
  const response = await api.admin.invites.all.get()
  if (response.error) throw response.error
  return response.data
}

/**
 * POST /admin/invites
 * 
 * Create new invite
 */
export const create_invite = async (params: CreateInviteParams): Promise<CreateInviteResult> => {
  const response = await api.admin.invites.create.post(params)
  if (response.error) throw response.error
  return response.data
}

/**
 * DELETE /admin/invites/:invite_id
 * 
 * Revoke invite by `invite_id`.
 */
export const revoke_invite = async (invite_id: string) => {
  const response = await api.admin.invites({ invite_id }).delete()
  if (response.error) throw response.error
  return response.data
}
