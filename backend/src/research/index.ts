import { Elysia } from "elysia"
import { auth_plugin, drizzle_plugin } from "../plugins"
import { jobs_plugin } from "../jobs"
import { eq, sql } from "drizzle-orm"
import { problems } from "../../drizzle/schema"

import { user_has_openrouter_key } from "../openrouter/provider"
import { NewStandardResearch } from "@shared/types/research"

export const research_router = new Elysia({ prefix: "/research" })
  .use(auth_plugin)
  .use(drizzle_plugin)
  .use(jobs_plugin)
  .get("/health", { status: "ok" })

  /**
   * [AUTH] POST /research/run-standard-research
   * 
   * Starts standard research configured via body.
   * You must own the problem to run new research and the problem can't
   * have running/queued research.
   * 
   * MANUALLY TESTED?: NO
   */
  .post("/run-standard-research", async ({ db, body, status, jobs, user }) => {
    const problem_id = body.problem_id

    // (1) Validate user can run research (has API key or is admin)
    const has_openrouter_key = await user_has_openrouter_key(db, user.id)
    if (!has_openrouter_key) return status(403, {
      type: "error",
      message: "You must configure your OpenRouter API key before running research. Go to Profile Settings to add your key."
    })

    // (2) Fetch problem details
    const problem = await db.query.problems.findFirst({
      columns: {
        status: true,
        owner_id: true,
      },
      where: eq(problems.id, problem_id)
    })
    if (!problem) return status(400, {
      type: "error",
      message: "Can't start research for non-existing problem – invalid problem id."
    })

    // (3) Authorization check: must own the problem.
    if (problem.owner_id !== user.id) return status(403, {
      type: "error",
      message: "Can't start research for a problem you don't own!"
    })

    // (4) Check problem is not already running
    if (problem.status === "running" || problem.status === "queued") return status(409, {
      type: "error",
      message: "Can't start research for a problem that has running research!"
    })

    // (5) Queue the job
    try {
      await db.update(problems)
        .set({ status: "queued", updated_at: sql`NOW()` })
        .where(eq(problems.id, problem_id))

      jobs.queue("standard_research")
        .emit("start_research", {
          new_research: body,
          ctx: {
            user_id: user.id,
            current_relative_round_index: 1,
          }
        })
    } catch (e) {
      return status(500, {
        type: "error",
        message: "Failed to queue new research!"
      })
    }

    return {
      type: "success",
      message: "Successfully started Standard Research!"
    }
  }, {
    isAuth: true,
    body: NewStandardResearch
  })