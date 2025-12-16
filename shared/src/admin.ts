import { z } from "zod"

import { jobs } from "@backend/jobs/index"
import { JobManager, QueueNameUnion } from "@backend/jobs/manager"

export type QueueName = typeof jobs extends JobManager<infer Bs>
  ? QueueNameUnion<Bs>
  : never

// The order of values here influences the order they are rendered in the dashboard.
export const JobStatusValues = ["running", "queued", "failed", "finished", "delayed"] as const
export const JobStatusEnum = z.enum(JobStatusValues)
export type JobStatus = z.infer<typeof JobStatusEnum>
export type JobCounts = Record<JobStatus, number>

export const JobStatusIcon: Record<JobStatus, string> = {
  "running": "⚙️",
  "queued": "⏳",
  "failed": "❌",
  "finished": "✅",
  "delayed": "🔜",
}

export interface Job {
  id: string, 
  name: string,
  queue_name: QueueName
  attempts: number,
  status: JobStatus,
  data?: any,
  created_at: number,
  started_at?: number,
  ended_at?: number,
  error_message?: string,
  error: {
    message: string,
    stacktrace: string[]
  } | null,
  problem: {
    id: string,
    name: string,
  } | null,
  user: {
    id: string,
    name: string,
    email: string,
  } | null,
}

export type JobSummary = Pick<
  Job,
  "id" | "name" | "created_at" | "started_at" | "attempts" | "error"
>

export type JobInputSchema = z.core.JSONSchema.BaseSchema | null;

export interface QueueState {
  counts: JobCounts,
  jobs: Record<JobStatus, JobSummary[]>,
  schemas: Record<string, JobInputSchema>,
}

/**
 * Formats the name of given Queue or Job.
 * The name is usually defined in code in snake_case
 */
export function format_name(name: string) {
  return name.replace(/_/g, " ")
    .replace(/\b\w/g, first_letter => first_letter.toUpperCase())
}