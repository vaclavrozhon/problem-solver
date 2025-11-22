import { define_job } from "./manager"
import { z } from "zod"

export const run_standard_research = define_job("standard_research")
  .input(z.object({
    rounds: z.number().min(1),
    provers: z.object({
      count: z.number().min(1),
    })
  }))
  .work(async (jobs) => {
    console.log("[job]{standard_research} received:", jobs)
  })

export const research_jobs = [
  run_standard_research
] as const

