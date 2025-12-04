import { relations } from "drizzle-orm/relations"
import { problems, problem_files, rounds, llms, users } from "./schema"

export const problem_files_relations = relations(problem_files, ({ one }) => ({
  problem: one(problems, {
    fields: [problem_files.problem_id],
    references: [problems.id],
  }),

  round: one(rounds, {
    fields: [problem_files.round_id],
    references: [rounds.id],
  }),

  llm_response: one(llms, {
    fields: [problem_files.id],
    references: [llms.prompt_file_id],
  }),
}))

export const problems_relations = relations(problems, ({ one, many }) => ({
  user: one(users, {
    fields: [problems.owner_id],
    references: [users.id],
  }),

  files: many(problem_files),

  rounds: many(rounds),
}))

export const rounds_relations = relations(rounds, ({ one, many }) => ({
  problem: one(problems, {
    fields: [rounds.problem_id],
    references: [problems.id],
  }),

  files: many(problem_files),
}))

export const users_relations = relations(users, ({ many }) => ({
  problems: many(problems),
}))

export const llms_relations = relations(llms, ({ one }) => ({
  prompt_file: one(problem_files, {
    fields: [llms.prompt_file_id],
    references: [problem_files.id],
  }),
}))