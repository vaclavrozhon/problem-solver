import { treaty } from "@elysiajs/eden"
import type { App, app } from "@backend/index"
import { problems_router } from "@backend/problems"
import { supabase } from "../config/supabase"

// TODO: Will need more setup before deploying to production
// TODO: fix ts bug
export const server = treaty<typeof app>("localhost:5174", {
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