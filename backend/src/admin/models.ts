import { Elysia } from "elysia"
import { z } from "zod"

import { auth_plugin, drizzle_plugin } from "../plugins"
import { get_admin_model_settings, save_admin_model_visibility } from "../app_settings"

export const models_router = new Elysia({ prefix: "/models" })
  .use(auth_plugin)
  .use(drizzle_plugin)

  .get("/settings", async ({ db }) => {
    return get_admin_model_settings(db)
  }, { isAdmin: true })

  .patch("/settings", async ({ db, body, status }) => {
    try {
      return await save_admin_model_visibility(db, body.model_visibility)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to update model visibility settings."
      return status(400, {
        type: "error",
        message,
      })
    }
  }, {
    isAdmin: true,
    body: z.object({
      model_visibility: z.record(z.string(), z.boolean()),
    }),
  })
