import { Elysia } from "elysia"
import { cors } from '@elysiajs/cors'

import { problems_router } from "./problems"

const api_router = new Elysia({ prefix: "/api" })
  .use(problems_router)

// TODO: Add static files from frontend/dist
export const app = new Elysia()
  // TODO: Properly config cors
  .use(cors({
    origin: "http://localhost:5173"
  }))
  .use(api_router)
  // RAILWAY: The '/health' check is required by Railway for successful deployment
  .get("/health", { status: "ok" })
  .listen(Bun.env.BACKEND_PORT_DEV || 3942)

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)

// DEV Hack to let TypeScript know we will always specify these in .env
declare module "bun" {
  interface Env {
    SUPABASE_URL: string,
    SUPABASE_PUBLISHABLE_KEY: string,
    SUPABASE_ADMIN_KEY: string,

    DATABASE_URL: string,
    DATABASE_PASSWORD: string,
  }
}

export type App = typeof app