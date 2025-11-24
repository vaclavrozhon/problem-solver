import { Elysia } from "elysia"
import { auth_plugin, drizzle_plugin } from "../db/plugins"
import { jobs_plugin } from "../jobs"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { problems } from "../../drizzle/schema"

export const research_router = new Elysia({ prefix: "/research" })
  .use(auth_plugin)
  .use(drizzle_plugin)
  .use(jobs_plugin)
  .get("/health", { status: "ok" })
  .get("/test-jobs", async ({ jobs }) => {
    jobs.emit("standard_research", 10)
    return "test job started!"
  })
  .post("/run-standard", async ({ db, body, status }) => {
    const problem_id = body.problem_id
    const problem = await db.query.problems.findFirst({
      columns: {
        status: true,
      },
      where: eq(problems.id, problem_id)
    })
    if (!problem) return status(400, {
      type: "error",
      message: "Can' start research for non-existing problem – invalid problem id."
    })
    if (problem.status === "running") return status(409, {
      type: "error",
      message: "Can't start research for a problem that already has running research!"
    })

    // TODO run the standard research job...

    return {
      type: "success",
      message: "Succesfully started Standard Research!"
    }
  }, {
    isAuth: true,
    body: z.object({
      problem_id: z.uuid(),
      rounds: z.number().min(1).max(10),
      general_advice: z.string().optional(),
      prover: z.object({
        provers: z.array(z.object({
          advice: z.string().optional(),
          model: z.enum(["GPT5", "Gemini3"]),
        })),
        prompt: z.string(),
      }),
      verifier: z.object({
        advice: z.string(),
        model: z.enum(["GPT5"]),
        prompt: z.string(),
      }),
      summarizer: z.object({
        prompt: z.string(),
        model: z.enum(["GPT5-mini"])
      })
    })
  })