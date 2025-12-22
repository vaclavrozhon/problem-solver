import { relations } from "drizzle-orm/relations"
import { problems, problem_files, rounds, llms, users, profiles, invites } from "./schema"

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
  profile: one(profiles, {
    fields: [problems.owner_id],
    references: [profiles.id],
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

export const profiles_relations = relations(profiles, ({ one, many }) => ({
  problems: many(problems),
  created_invites: many(invites, { relationName: "created_by" }),
  redeemed_invite: one(invites, {
    fields: [profiles.provisioned_invite_id],
    references: [invites.id],
  }),
}))

export const invites_relations = relations(invites, ({ one }) => ({
  created_by_profile: one(profiles, {
    fields: [invites.created_by],
    references: [profiles.id],
    relationName: "created_by",
  }),
  redeemed_by_profile: one(profiles, {
    fields: [invites.redeemed_by],
    references: [profiles.id],
  }),
}))