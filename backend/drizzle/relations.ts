import { relations } from "drizzle-orm/relations"
import { problems, problem_files, runs, users } from "./schema"

export const problemFilesInMainRelations = relations(problem_files, ({one}) => ({
	problems: one(problems, {
		fields: [problem_files.problem_id],
		references: [problems.id]
	}),
}))

export const problemsInMainRelations = relations(problems, ({one, many}) => ({
	problemFilesInMains: many(problem_files),
	user: one(users, {
		fields: [problems.owner_id],
		references: [users.id]
	}),
	runsInMains: many(runs),
}))

export const usersInAuthRelations = relations(users, ({many}) => ({
	problemsInMains: many(problems),
}))

export const runsInMainRelations = relations(runs, ({one}) => ({
	problems: one(problems, {
		fields: [runs.problem_id],
		references: [problems.id]
	}),
}))