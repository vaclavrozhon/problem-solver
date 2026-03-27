import { Elysia } from "elysia"
import { auth_plugin } from "../plugins"
import { jobs_router } from "./jobs"
import { users_router } from "./users"
import { invites_router } from "./invites"
import { models_router } from "./models"

export const admin_router = new Elysia({ prefix: "/admin" })
  .use(jobs_router)
  .use(users_router)
  .use(invites_router)
  .use(models_router)
  .use(auth_plugin)
