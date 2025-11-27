import { pgSchema, foreignKey, uuid, timestamp, integer, text, jsonb, json } from "drizzle-orm/pg-core"
import { OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"

export const main = pgSchema("main-dev")

export const files_types = main.enum("files-types", [
  "task", "proofs", "notes", "output",
  "prover_prompt", "verifier_prompt", "summarizer_prompt",
  "prover_reasoning", "verifier_reasoning", "summarizer_reasoning",
  "prover_output", "verifier_output", "summarizer_output",


  "round_meta"
])

export const problem_files = main.table("problem_files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	problem_id: uuid().notNull(),
	round: integer().notNull(),
	file_type: files_types().notNull(),
  // TODO I think `file_name` is unnecessary
	file_name: text().notNull(),
	content: text().notNull(),

  usage: json().$type<OpenRouterUsageAccounting>(),



  // For what?????
	metadata: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.problem_id],
			foreignColumns: [problems.id],
			name: "problem_files_problem_id_fkey"
		}),
])

// TODO: rename from "completed" to "finished", sounds better
// TODO: I think i will remove "queued" problem status and jsut keep in the run phase
export const problem_status = main.enum("problem-status", ["created", "idle", "queued", "running", "failed", "completed"])

export const problems = main.table("problems", {
  id: uuid().defaultRandom().primaryKey().notNull(),
	owner_id: uuid().notNull(),
	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
	name: text().notNull(),
	status: problem_status().notNull().default("created"),
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

export const run_phase = main.enum("run-phase", [
  "queued",
  "prover_working", "prover_finished", "prover_failed",
  "verifier_working", "verifier_finished", "verifier_failed",
  "summarizer_working", "summarizer_finished", "summarizer_failed",
  "ended"
])

export const run_status = main.enum("run-status", ["running", "completed", "failed"])

export const runs = main.table("runs", {
  id: uuid().defaultRandom().primaryKey().notNull(),
	problem_id: uuid().notNull(),
  phase: run_phase().notNull(),

	status: run_status().notNull().default("running"),

	created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),

  updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),

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

// TODO Add rounds table to store each round
// then we create a job for each round
// and one main which runs all the roudns after each other and that's the architecture
// there we will store the summary, times, model information
// TOTAL ROUND USAGE

/**
 * The purpose of this table is to store all LLM responses in extra place
 * so that we don't lose any piece of valuable data.
 */
export const llms = main.table("llms", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  response: text().notNull(),
  usage: json().$type<OpenRouterUsageAccounting>().notNull(),
  // BUG/TODO: Need to add .notNull() to prompt_file_id
  // its optional for now because twe just testing
  prompt_file_id: uuid(),

  // TODO this name change pls bugs drizzle
  model: text("modeels").notNull(),

}, (table) => [
  foreignKey({
    columns: [table.prompt_file_id],
    foreignColumns: [problem_files.id],
    name: "problem_files_id_in_llms_fkey"
  }),
])

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