import { eq } from "drizzle-orm"
import { profiles } from "../../drizzle/schema"
import { get_db } from "../db"
import type { Database } from "../db"

const LOCAL_ACCESS_TOKEN = "local-auth-access"
const LOCAL_REFRESH_TOKEN = "local-auth-refresh"

export function is_local_auth_mode() {
  return (Bun.env.AUTH_MODE ?? "local") === "local"
}

export function get_local_auth_user() {
  return {
    id: Bun.env.LOCAL_AUTH_USER_ID ?? "00000000-0000-4000-8000-000000000001",
    username: Bun.env.LOCAL_AUTH_USERNAME ?? "admin",
    password: Bun.env.LOCAL_AUTH_PASSWORD ?? "admin",
    name: Bun.env.LOCAL_AUTH_NAME ?? "Local Admin",
    email: Bun.env.LOCAL_AUTH_EMAIL ?? "admin@local",
  }
}

export function get_local_auth_tokens() {
  return {
    access_token: LOCAL_ACCESS_TOKEN,
    refresh_token: LOCAL_REFRESH_TOKEN,
  }
}

export function is_valid_local_credentials(identifier: string, password: string) {
  const local = get_local_auth_user()
  if (password !== local.password) return false
  return identifier === local.username || identifier === local.email
}

export async function ensure_local_profile(db: Database = get_db()) {
  if (!is_local_auth_mode()) return

  const local = get_local_auth_user()
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, local.id),
    columns: { id: true },
  })

  if (!existing) {
    await db.insert(profiles).values({
      id: local.id,
      role: "admin",
      name: local.name,
      email: local.email,
    })
    return
  }

  await db.update(profiles).set({
    name: local.name,
    email: local.email,
    role: "admin",
  }).where(eq(profiles.id, local.id))
}
