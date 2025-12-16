import { api } from "./index"

export const get_jobs_overview = async () => {
  const response = await api.admin.jobs.overview.get()
  if (response.error) throw response.error
  return response.data
}

export const get_job_details = async (queue_name: string, job_id: string) => {
  const response = await api.admin.jobs({ queue_name })({ job_id }).get()
  if (response.error) throw response.error
  if (response.data === "No Content") throw new Error("Job not found.")
  return response.data
}