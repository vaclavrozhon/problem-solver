import { Elysia } from "elysia"
import { auth_plugin, drizzle_plugin } from "../db/plugins"
import { jobs_plugin } from "../jobs"
import { z } from "zod"
import { eq, sql } from "drizzle-orm"
import { problems } from "../../drizzle/schema"

import { NewStandardResearch } from "@shared/types/research"

export const research_router = new Elysia({ prefix: "/research" })
  .use(auth_plugin)
  .use(drizzle_plugin)
  .use(jobs_plugin)
  .get("/health", { status: "ok" })
  .post("/run-standard-research", async ({ db, body, status, jobs, user }) => {
    const problem_id = body.problem_id
    const problem = await db.query.problems.findFirst({
      columns: {
        status: true,
        owner_id: true,
      },
      where: eq(problems.id, problem_id)
    })
    if (!problem) return status(400, {
      type: "error",
      message: "Can' start research for non-existing problem – invalid problem id."
    })

    // BUG COMMENETED OUT FOR NOW 
    // if (problem.owner_id !== user.id) return status(401, {
    //   type: "error",
    //   message: "Can't start research for a problem you didn't create!"
    // })

    if (problem.status === "running" || problem.status === "queued") return status(409, {
      type: "error",
      message: "Can't start research for a problem that has running research!"
    })

    try {
      await db.update(problems)
        .set({ status: "queued", updated_at: sql`NOW()` })
        .where(eq(problems.id, problem_id))
    } catch (e) {
      // TODO: Log this error
      return status(500)
    }

    jobs.emit("standard_research", { new_research: body, user_id: user.id })

    return {
      type: "success",
      message: "Succesfully started Standard Research!"
    }
  }, {
    isAuth: true,
    body: NewStandardResearch
  })