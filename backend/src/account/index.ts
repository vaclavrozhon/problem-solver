import { Elysia } from "elysia"
import { auth_plugin } from "../db/plugins"

export const account_router = new Elysia({ prefix: "/account" })
  .use(auth_plugin)
  .get("/health", { status: "ok" })
  .get("/openrouter-balance", async ({ status }) => {
    const response = await fetch("https://openrouter.ai/api/v1/credits", {
      headers: {
        "Authorization": `Bearer ${Bun.env.OPENROUTER_API_KEY}`
      }
    })
    if (!response.ok) return status(500, {
      type: "error",
      message: "Failed to retrieve OpenRouter remaining balance."
    })
    const json = await response.json() as {
      data: {
        total_credits: number,
        total_usage: number,
      }
    }
    return json.data
  }, { isAuth: true })