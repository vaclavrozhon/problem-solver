import { Elysia } from "elysia"
import { jobs_router } from "./jobs"

export const admin_router = new Elysia({ prefix: "/admin" })
  .use(jobs_router)
