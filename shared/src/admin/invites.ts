import { z } from "zod"
import { user_name_schema } from "@shared/auth"

export const InviteStatusValues = ["pending", "redeemed", "to-be-removed"] as const
export type InviteStatus = typeof InviteStatusValues[number]

export interface KeyUsage {
  limit: number | null,
  remaining: number,
  usage: number,
}

export type ProvisionedKeyUsage = KeyUsage & {
  limit: number,
}

export interface Invite {
  id: string,
  code: string,
  recipient_name: string,
  credit_limit: number,
  status: InviteStatus,
  created_at: string,
  created_by: string,
  redeemed_at: string | null,
  redeemed_by: {
    name: string,
    email: string,
  } | null,
  usage: ProvisionedKeyUsage | null,
  user_switched_to_own_key: boolean,
}


// TODO: could be derived from invite_schema
export interface CreateInviteParams {
  recipient_name: string,
  credit_limit: number,
}

export interface CreateInviteResult {
  type: string
  message: string,
  invite?: {
    id: string,
    code: string,
    recipient_name: string,
    credit_limit: number,
  },
}


// Schemas
export const INVITE_CREDIT_MIN = 1
export const INVITE_CREDIT_MAX = 100

export const invite_schema = z.object({
  recipient_name: user_name_schema,
  credit_limit: z.int32().min(INVITE_CREDIT_MIN).max(INVITE_CREDIT_MAX),
})