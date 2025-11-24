import { pgSchema, foreignKey, uuid, timestamp, integer, text, jsonb, pgEnum } from "drizzle-orm/pg-core"

export const main = pgSchema("main")

export const problem_files = main.table("problem_files", {
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

export const problem_status = pgEnum("status", ["idle", "running", "failed", "completed"])


export const problems = main.table("problems", {
  id: uuid().defaultRandom().primaryKey().notNull(),
	owner_id: uuid().notNull(),
	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	name: text().notNull(),
	status: problem_status().notNull().default("idle"),
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

export const runs = main.table("runs", {
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

// Let's say we enable like 10 jobs at once.
// the user should see the whole queue
export const queue = main.table("queue", {
  
})

/**
 * Since we're using Supabase for Auth we don't manage the `auth` schema
 * and tables ourselves but we let Supabase handle it.
 * But we sometimes need to reference e.g. `user.id` etc
 * and for type-safety we're required to provide just
 * a bit from how the schema/tables look. This is merely a placeholder
 * that doesn't at all reflect the state of auth in the DB.
 */
export const auth_schema = pgSchema("auth")
export const users = auth_schema.table("users", {
  id: uuid().primaryKey().notNull(),
  email: text().notNull(),
  raw_user_meta_data: jsonb().notNull().$type<{
    name?: string,
  }>(),
})