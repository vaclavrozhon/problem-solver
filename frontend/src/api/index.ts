import { treaty } from "@elysiajs/eden"
import type { App } from "@backend/index"

const backend_url = process.env.NODE_ENV === "production"
  ? `https://${import.meta.env.VITE_RAILWAY_PUBLIC_DOMAIN}`
  : `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`

export const server = treaty<App>(backend_url, {
  // include cookies with every request
  fetch: { credentials: "include" }
})

export const api = server.api