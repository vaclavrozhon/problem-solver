import { Elysia } from "elysia"
import { JobManager, QueueNameUnion } from "@shared/jobs/manager"
import { get_db } from "../db"
import { research_jobs } from "./research"
import { experimental_research_jobs } from "./experimental_research"
import { get_openrouter_for_user } from "../openrouter/provider"
import type { Database } from "../db"

const db = get_db()
const redis_url = Bun.env.REDIS_URL

export const jobs = new JobManager<[], Database>({
  openrouter_resolver: get_openrouter_for_user,
  redis_url,
  db,
}).register(...research_jobs)
  .register(...experimental_research_jobs)

type Builders = typeof jobs extends JobManager<infer B, any> ? B : never
export type QueueName = QueueNameUnion<Builders>

export const jobs_plugin = new Elysia({ name: "jobs" })
  .decorate("jobs", jobs)