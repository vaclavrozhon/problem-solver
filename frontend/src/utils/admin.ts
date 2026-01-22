import type { Invite } from "@shared/admin/invites"

export const calculate_allocated_money_for_invites =
  (invites: Invite[]) => invites.reduce(
    (acc, invite) => acc + (invite.usage?.remaining ?? invite.credit_limit),
    0
  )

export const calculate_spent_allocated_money_in_invites =
  (invites: Invite[]) => invites.reduce(
    (acc, invite) => acc + (invite.usage?.usage ?? 0),
    0
  )
