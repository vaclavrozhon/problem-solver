import { Elysia } from "elysia"
import { drizzle_plugin } from "../db/plugins"
import { jobs_plugin } from "../jobs/index"
import { problems, users } from "../../drizzle/schema"
import { eq, inArray } from "drizzle-orm"
import { z } from "zod"

import type { QueueName, QueueState, Job } from "@shared/admin"

// TODO: Add isAdmin to all!
// TODO: Write automatic tests to check if isUser & isAdmin work!
export const jobs_router = new Elysia({ prefix: "/jobs" })
  .use(drizzle_plugin)
  .use(jobs_plugin)
  .get("/:queue_name/:job_id", async ({ params, status, db, jobs }) => {
    const { queue_name, job_id } = params
    const result = await jobs.get_job(queue_name, job_id)

    if (!result) return status(204)

    const { job, job_status } = result

    // (1) Extract problem_id from job data if present
    let problem_id: string | null = null
    if (job.data?.ctx?.problem_id) problem_id = job.data.ctx.problem_id
    else if (job.data?.new_research?.problem_id) problem_id = job.data.new_research.problem_id

    // (2) Extract user_id from job data if present
    let user_id: string | null = null
    if (job.data?.ctx?.user_id) user_id = job.data.ctx.user_id

    // (3) Get problem name
    let problem: {
      id: string,
      name: string,
    } | null = null
    if (problem_id) {
      const result = await db.select({ name: problems.name })
        .from(problems)
        .where(eq(problems.id, problem_id))
        .limit(1)
      if (result.length === 1) problem = {
        id: problem_id,
        name: result[0].name,
      }
    }

    // (4) Get user name
    // TODO: Edit this after the update with new `profile` table
    let user: {
      id: string,
      name: string,
      email: string,
    } | null = null
    if (user_id) {
      const found = await db.select({
        email: users.email,
        meta: users.raw_user_meta_data
      })
        .from(users)
        .where(eq(users.id, user_id))
        .limit(1)
      if (found.length > 0) {
        user = {
          id: user_id,
          name: found[0].meta?.name || found[0].email.split('@')[0],
          email: found[0].email,
        }
      }
    }

    let error: {
      message: string,
      stacktrace: string[]
    } | null= null
    if (job.failedReason && job.stacktrace?.length > 0) {
      error = {
        message: job.failedReason,
        stacktrace: job.stacktrace,
      }
    }

    const retrieved_job: Job = {
      id: job_id,
      name: job.name,
      queue_name: queue_name as QueueName,
      attempts: job.attemptsStarted,
      status: job_status,
      data: job.data,
      created_at: job.timestamp,
      ended_at: job.finishedOn,
      started_at: job.processedOn,
      error,
      user,
      problem,
    }
    return retrieved_job
  }, {
    params: z.object({
      queue_name: z.string(),
      job_id: z.string(),
    })
  })
  .get("/overview", async ({ jobs }) => {
    let states: Record<QueueName, QueueState> = await jobs.get_all_job_details()

    return states
  })
