import { Elysia, t } from "elysia";
import { auth_plugin, drizzle_plugin } from "../db/plugins";
import { runs } from "../../drizzle/schema";

export const research_router = new Elysia({ prefix: "/research" })
  .use(auth_plugin)
  .use(drizzle_plugin)