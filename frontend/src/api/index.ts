import { treaty } from "@elysiajs/eden"
import type { App, app } from "@backend/index"
import { problems_router } from "@backend/problems"
import { supabase } from "../config/supabase"

const backend_url = process.env.NODE_ENV === "production"
  ? import.meta.env.VITE_RAILWAY_PUBLIC_DOMAIN
  : `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`

export const server = treaty<typeof app>(backend_url, {
  async onRequest() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session === null) return {}
    console.log(session.access_token)
    return {
      headers: {
        authorization: `Bearer ${session.access_token}`
      }
    }
  }
})

export const api = server.api