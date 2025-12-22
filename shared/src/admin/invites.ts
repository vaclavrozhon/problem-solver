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