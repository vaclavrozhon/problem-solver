import type { Cookie } from "elysia"

export const COOKIE_CONFIG = {
  access_token: {
    name: "bolzano_access",
    max_age: 60 * 60,
  },
  refresh_token: {
    name: "bolzano_refresh",
    max_age: 60 * 60 * 24 * 30,
  },
} as const

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: Bun.env.NODE_ENV === "production",
  /** For Google OAuth */
  sameSite: "lax",
  path: "/",
} as const

export function set_auth_cookies(
  cookie: Record<string, Cookie<unknown>>,
  access_token: string,
  refresh_token: string
) {
  const opts = COOKIE_OPTIONS
  cookie[COOKIE_CONFIG.access_token.name].set({
    value: access_token,
    ...opts,
    maxAge: COOKIE_CONFIG.access_token.max_age,
  })
  cookie[COOKIE_CONFIG.refresh_token.name].set({
    value: refresh_token,
    ...opts,
    maxAge: COOKIE_CONFIG.refresh_token.max_age,
  })
}

export function clear_auth_cookies(cookie: Record<string, Cookie<unknown>>) {
  cookie[COOKIE_CONFIG.access_token.name].remove()
  cookie[COOKIE_CONFIG.refresh_token.name].remove()
}