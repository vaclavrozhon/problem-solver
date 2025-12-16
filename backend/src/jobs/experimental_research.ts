import { z } from "zod"

import { define_job } from "./manager"

export const run_experimental_research = define_job("start")
  .queue("experimental_research")
  // .input(z.number())
  .work(async (data, { db, openrouter }) => {
    console.log("exprimental research running!!")
  })

export const experimental_research_jobs = [
  run_experimental_research
]