import { Elysia } from "elysia"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { JobManager, QueueNameUnion } from "@shared/jobs/manager"
import { get_db } from "../db/plugins"
import { research_jobs } from "./research"
import { experimental_research_jobs } from "./experimental_research"

export type Database = ReturnType<typeof get_db>

const db = get_db()
const openrouter = createOpenRouter({ apiKey: Bun.env.OPENROUTER_API_KEY })
const redis_url = Bun.env.REDIS_URL

export const jobs = new JobManager<[], Database>({ db, openrouter, redis_url })
  .register(...research_jobs)
  .register(...experimental_research_jobs)

type Builders = typeof jobs extends JobManager<infer B, any> ? B : never
export type QueueName = QueueNameUnion<Builders>

export const jobs_plugin = new Elysia({ name: "jobs" })
  .decorate("jobs", jobs)