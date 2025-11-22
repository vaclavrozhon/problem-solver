import { Elysia } from "elysia"
import { auth_plugin, drizzle_plugin } from "../db/plugins"
import { jobs_plugin } from "../jobs/index"

export const research_router = new Elysia({ prefix: "/research" })
  .use(auth_plugin)
  .use(drizzle_plugin)
  .use(jobs_plugin)
  .get("/health", { status: "ok" })