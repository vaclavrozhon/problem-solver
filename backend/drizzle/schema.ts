import { pgSchema, foreignKey, uuid, timestamp, integer, text, jsonb, json, numeric } from "drizzle-orm/pg-core"
import { OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"
// TODO: convert all "json" to "jsonb"?

export const main = pgSchema("main")

export const files_types = main.enum("files-types", [
  "task", "proofs", "notes", "output",
  "prover_prompt", "verifier_prompt", "summarizer_prompt",
  "prover_reasoning", "verifier_reasoning", "summarizer_reasoning",
  "prover_output", "verifier_output", "summarizer_output",
])

export const problem_files = main.table("problem_files", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  problem_id: uuid().notNull(),
  round_id: uuid().notNull(),
  file_type: files_types().notNull(),
  file_name: text().notNull(),
  content: text().notNull(),

  usage: json().$type<OpenRouterUsageAccounting>(),
  model_id: text()

}, (table) => [
  foreignKey({
    columns: [table.problem_id],
    foreignColumns: [problems.id],
    name: "problem_files_problem_id_fkey"
  }),
  foreignKey({
    columns: [table.round_id],
    foreignColumns: [rounds.id],
    name: "problem_files_rounds_id_fkey",
  })
])

export const research_type = main.enum("research-type", ["standard", "adrian"])

export const run_phase = main.enum("run-phase", [
  "prover_working", "prover_finished", "prover_failed",
  "verifier_working", "verifier_finished", "verifier_failed",
  "summarizer_working", "summarizer_finished", "summarizer_failed",
  "finished"
])

// TODO: Need to update problem_files.round to reference rounds.id
export const rounds = main.table("research_rounds", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  problem_id: uuid().notNull(),
  index: integer().notNull(),

  research_type: research_type().notNull(),
  phase: run_phase().notNull(),

  failed_provers: json().$type<string[]>(),

  prover_time: numeric({ mode: "number" }),
  verifier_time: numeric({ mode: "number" }),
  summarizer_time: numeric({ mode: "number" }),

  usage: numeric({ mode: "number" }).notNull().default(0),
  estimated_usage: numeric({ mode: "number" }),

  created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  completed_at: timestamp({ withTimezone: true, mode: "string" }),

  error_message: text(),

  // This shall be used when resuming failed research
  research_config: json(),
}, table => [
  foreignKey({
    columns: [table.problem_id],
    foreignColumns: [problems.id],
    name: "problems_round_id_fkey",
  })
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
  /**
   * Honestly, `active_round_id` should also be a forgein key referencing `rounds.id`
   * but that would require me to create a bridge table and that's too much work rn.
   * So it's just uuid type and not foregin key. The app works fine like this.
   */
  active_round_id: uuid(),
  current_round: integer().default(0).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.owner_id],
    foreignColumns: [users.id],
    name: "problems_owner_id_fkey"
  }),
])

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

  model: text().notNull(),

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