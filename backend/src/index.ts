import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"

import { problems_router } from "./problems"
import { account_router } from "./account"
import { research_router } from "./research/routes"

const api_router = new Elysia({ prefix: "/api" })
  .get("/health", { status: "ok" })
  .use(problems_router)
  .use(account_router)
  .use(research_router)

const backend = new Elysia({ name: "backend" })
  .use(cors({
    origin: Bun.env.NODE_ENV === "production"
      ? `https://${Bun.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${Bun.env.FRONTEND_PORT}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }))
  .use(api_router)

const frontend = new Elysia({ name: "frontend" })
// NOTE: This is a workaround for serving React SPA with Browser History.
// It could be possible to use @elysiajs/static and Hash History setting in Tanstack Router
// but who even likes Hash History??? (can' use the plugin with Browser Historiy
// beucase it's completely broken... most likely a Bun issue)
// (hopefully it's not vulnerable to path-traversal attack haha)
if (Bun.env.NODE_ENV === "production") {
  frontend.get("/*", async ({ params }) => {
    const static_file = Bun.file(`../frontend/dist/${params["*"]}`);
    const react_app = Bun.file("../frontend/dist/index.html");
    return (await static_file.exists()) ? static_file : react_app;
  })
}


export const app = new Elysia()
  // PRODUCTION [RAILWAY]: The '/health' check is required by Railway for successful deployment
  .get("/health", { status: "ok" })
  .use(backend)
  .use(frontend)
  .listen(Bun.env.NODE_ENV === "production" ? Bun.env.PORT! : (Bun.env.BACKEND_PORT || 3942))

console.log(`✌️ [BACKEND] is running at http://${app.server?.hostname}:${app.server?.port}`)

// DEV Hack to let TypeScript know we will always specify these in .env
declare module "bun" {
  interface Env {
    SUPABASE_URL: string,
    SUPABASE_PUBLISHABLE_KEY: string,

    BACKEND_PORT: number,
    FRONTEND_PORT: number,

    DATABASE_URL: string,
    DATABASE_PASSWORD: string,

    OPENROUTER_API_KEY: string,
  }
}

export type App = typeof app