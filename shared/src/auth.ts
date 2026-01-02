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

/**
 * Check if user is admin.
 */
export function is_admin(role: UserRole): boolean {
  return role === "admin"
}

// Auth Form Zod Schemas
export const user_name_schema = z.string().trim()
  .nonempty("Name is required")
  .min(1, "Name must be at least 1 character long")
  .max(50, "Wow, such a long name!")

export const login_schema = z.object({
  // TODO: constrain the email?
  email: z.email("Please enter a valid email").trim()
    .nonempty("Email is required"),
  password: z.string().trim()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters")
    // NOTE: Supabase imposed limit
    .max(72, "Password must be less than 73 characters"),
})

// BUG/TODO: add trim() everywhere needed
// TODO: add .nonempty() to more places like in @shared/problem
export const signup_schema = login_schema.extend({
  name: user_name_schema,
})

export const INVITE_CODE_LENGTH = 7
export const invite_code_schema = z.string().trim()
  .length(INVITE_CODE_LENGTH, "Invite code must be 7 chars long")

export const openrouter_api_key_schema = z.string().trim()
  .nonempty("Openrouter API key is required")
  .startsWith("sk-or-")