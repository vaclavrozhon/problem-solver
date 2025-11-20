import { z } from "zod"
export const CreateProblemFormSchema = z.object({
  problem_name: z.string().nonempty("Problem needs name!").min(5, "Problem Name needs to be at least 5 characters long."),
  problem_task: z.string().nonempty("Problem needs task description!").min(20, "Problem Task description needs to be at least 20 characters long."),
})
