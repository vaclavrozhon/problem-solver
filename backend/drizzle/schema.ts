import { pgSchema, foreignKey, uuid, timestamp, integer, text, jsonb, json, numeric } from "drizzle-orm/pg-core"

import type { OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"
import { UserRoleValues, KeySourceValues } from "../../shared/src/auth"
import { InviteStatusValues } from "../../shared/src/admin/invites"

// TODO: convert all "json" to "jsonb"?

export const main = pgSchema("main")

export const files_types = main.enum("files-types", [
  "task", "proofs", "notes", "todo",
  "output", // v1-only
  "round_instructions",
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

// TODO: could actually make this dynamic and import them dynamically based on
// queue defintions in job manager?
export const research_type = main.enum("research-type", ["standard", "v2"])

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
export const problem_status = main.enum("problem-status", ["created", "idle", "queued", "running", "failed", "completed"])

export const user_role = main.enum("user-role", UserRoleValues)

// tracks where user's OpenRouter key came from
export const key_source = main.enum("key-source", KeySourceValues)

export const invite_status = main.enum("invite-status", InviteStatusValues)

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
  // TODO: remove email & raw_user_meta_data? in favor of `profiles` table
  email: text().notNull(),
  raw_user_meta_data: jsonb().notNull().$type<{
    name?: string,
  }>(),
})

export const profiles = main.table("profiles", {
  // Primary key = auth.users.id (1:1 relationship, same UUID)
  id: uuid().primaryKey().notNull(),

  name: text().notNull(),
  email: text().notNull(),
  role: user_role().notNull().default("default"),

  // Encrypted OpenRouter API key (nullable - users must set their own)
  openrouter_key_encrypted: text(),
  openrouter_key_iv: text(),
  encryption_key_version: integer(),

  key_source: key_source(),
  // FK to invites.id if key was provisioned
  // BUG: Shoulnd't the FK be defined below as well?
  provisioned_invite_id: uuid(),

  created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.id],
    foreignColumns: [users.id],
    name: "profiles_id_fkey"
  }),
])

export const invites = main.table("invites", {
  id: uuid().defaultRandom().primaryKey().notNull(),

  code: text().notNull().unique(),
  recipient_name: text().notNull(),

  openrouter_key_encrypted: text().notNull(),
  openrouter_key_iv: text().notNull(),
  // Hash to identify key in OpenRouter API
  openrouter_key_hash: text().notNull(),
  encryption_key_version: integer().notNull().default(1),

  // Credit limit set on OpenRouter
  credit_limit: numeric({ mode: "number" }).notNull(),

  status: invite_status().notNull().default("pending"),
  // this can be NULL since the user could remove their profile and then what?!
  // FK to profiles.id when redeemed
  redeemed_by: uuid(),
  redeemed_at: timestamp({ withTimezone: true, mode: "string" }),

  // FK to profiles.id (admin who created)
  created_by: uuid().notNull(),
  created_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.created_by],
    foreignColumns: [profiles.id],
    name: "invites_created_by_fkey"
  }),
  foreignKey({
    columns: [table.redeemed_by],
    foreignColumns: [profiles.id],
    name: "invites_redeemed_by_fkey"
  }),
])
