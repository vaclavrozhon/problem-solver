import { pgTable, pgSchema, foreignKey, uuid, timestamp, integer, text, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// TODO: need to migrate to pg
// export const main = pgSchema("main")

export const problem_files = pgTable("problem_files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	problem_id: uuid().notNull(),
	round: integer().notNull(),
	file_type: text().notNull(),
	file_name: text().notNull(),
	content: text(),
	metadata: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.problem_id],
			foreignColumns: [problems.id],
			name: "problem_files_problem_id_fkey"
		}),
])

export const problems = pgTable("problems", {
  id: uuid().defaultRandom().primaryKey().notNull(),
	owner_id: uuid().notNull(),
	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	name: text().notNull(),
	status: text().notNull(),
	updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	active_run_id: uuid(),
	current_round: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.owner_id],
			foreignColumns: [users.id],
			name: "problems_owner_id_fkey"
		}),
])

export const runs = pgTable("runs", {
  id: uuid().defaultRandom().primaryKey().notNull(),
	problem_id: uuid().notNull(),
	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	status: text().notNull(),
	started_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	completed_at: timestamp({ withTimezone: true, mode: "string" }),
	error_message: text(),
	parameters: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.problem_id],
			foreignColumns: [problems.id],
			name: "runs_problem_id_fkey"
		}),
])


export const auth_schema = pgSchema("auth")
export const users = auth_schema.table("users", {
  id: uuid().primaryKey().notNull(),
  email: text().notNull(),
  raw_user_meta_data: jsonb().notNull().$type<{
    name?: string,
  }>(),
})