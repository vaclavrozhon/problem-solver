import { z } from "zod"

export const UserRoleValues = ["default", "admin"] as const
export type UserRole = typeof UserRoleValues[number]

// tracks where user's OpenRouter key came from
export const KeySourceValues = ["provisioned", "self"] as const
export type KeySource = typeof KeySourceValues[number] | null

export interface User {
  id: string,
  name: string,
  email: string,
  role: UserRole,
  created_at: string,
  has_openrouter_key: boolean,
  key_source: KeySource
}

export const auth_headers = z.object({
  authorization: z.string("Please provide Authorization Bearer token in HTTP headers.")
    .startsWith("Bearer ")
    .min(8, "Authorization header should contain Bearer token."),
})
export type AuthHeaders = z.infer<typeof auth_headers>

/**
 * Check if user is admin.
 */
export function is_admin(role: UserRole): boolean {
  return role === "admin"
}