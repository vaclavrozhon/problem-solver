import { define_job } from "./manager"
import { z } from "zod"

export const run_standard_research = define_job("standard_research")
  .input(z.number().min(1))
  .work(async (jobs) => {
    console.log("[job]{standard_research} received:", jobs)
    await sleep(6000)
    console.log("[job]{standard_research} finished after 6 seconds!")
  })

export const research_jobs = [
  run_standard_research
] as const

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
