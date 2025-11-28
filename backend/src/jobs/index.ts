import { Elysia } from "elysia"
import { JobManager, define_job } from "./manager"
import { z } from "zod"
import { research_jobs } from "./research"

export const jobs = new JobManager()
  .register(...research_jobs)

export const jobs_plugin = new Elysia({ name: "jobs" })
  .decorate("jobs", jobs)


