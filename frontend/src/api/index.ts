import { treaty } from "@elysiajs/eden"
import type { App } from "@backend/index"
import { useAuthStore } from "../auth/store"

const backend_url = process.env.NODE_ENV === "production"
  ? import.meta.env.VITE_RAILWAY_PUBLIC_DOMAIN
  : `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`

export const server = treaty<App>(backend_url, {
  async onRequest() {
    const session = useAuthStore.getState().session
    // TODO: Is there more appropriate return/error indication?
    if (session === null) return {}
    // [DEV ONLY] Easy access to access token for API testing
    if (process.env.NODE_ENV !== "production ") {
      console.log(session.access_token)
    }
    return {
      headers: {
        authorization: `Bearer ${session.access_token}`
      }
    }
  }
})

export const api = server.api