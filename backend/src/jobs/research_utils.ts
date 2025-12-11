import { eq, sql, and, inArray, lt } from "drizzle-orm"
import { problems, rounds, problem_files, llms, files_types } from "../../drizzle/schema"
import { OpenRouterProvider, OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"
import { z } from "zod"
import { generateObject, ModelMessage } from "ai"
import { AllowedModelsID, VerifierOutputSchema, SummarizerOutputSchema } from "@shared/types/research"
import { get_db } from "../db/plugins"
import { InferSelectModel } from "drizzle-orm"

type Database = ReturnType<typeof get_db>
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
type DbOrTx = Database | Transaction

export type ProblemFile = InferSelectModel<typeof problem_files>
export type Round = InferSelectModel<typeof rounds>
export type RoundPhase = Round["phase"]
export type ProblemStatus = InferSelectModel<typeof problems>["status"]
export type FileType = InferSelectModel<typeof problem_files>["file_type"]

// IMPORTANT: If this type gets update, `zod_file` needs to be also updated!
export type File = Pick<
  ProblemFile,
  "file_type" | "round_id" | "content"
> & {
  round: Pick<Round, "index">
}

type DrizzleFileType = typeof files_types.enumValues[number]

export const zod_file = <T extends DrizzleFileType>(types: readonly [T, ...T[]]) =>
  z.object({
    file_type: z.enum(types as unknown as [string, ...string[]]),
    content: z.string(),
    round_id: z.uuid(),
    round: z.object({
      index: z.number(),
    })
  })

export type PromptBuildingFiles = {
  main_files: File[],
  previous_verifier_output: File[],
  all_previous_summarizer_outputs: File[],
}

export type LLMResponse<T> = {
  object: T,
  usage: OpenRouterUsageAccounting,
  reasoning: any,
  time: number
  model_id: AllowedModelsID,
}

export interface ResearchContext {
  db: DbOrTx
  problem_id: string
  round_id: string
  user_id: string
  round_index: number
}

function safe_json_parse<T>(content: string, schema: z.ZodType<T>, context: string): T {
  try {
    const parsed = JSON.parse(content)
    const result = schema.safeParse(parsed)
    if (!result.success) {
      throw new Error(`Schema validation failed for ${context}: ${result.error.message}`)
    }
    return result.data
  } catch (e) {
    throw new Error(`Failed to parse ${context}: ${(e as Error).message}`)
  }
}

// Prompt Builders

/**
 * The prover should receive
 * - general advice
 * - per_prover advice
 * - verifier from previous (only) round (summary & feedback),
 * - summarizer from all previous rounds
 * - notes.md
 * - proofs.md
 * - output.md
 * - the task
 * - TODO: in the future: papers
 */
export function create_prover_prompt(
  prompt: string, 
  {
    main_files,
    previous_verifier_output,
    all_previous_summarizer_outputs
  }: PromptBuildingFiles,
  general_advice?: string,
  advice?: string
) {
  if (general_advice || advice) prompt += "\n\n=== PERSONALIZED INSTRUCTIONS ===\n"
  if (general_advice) prompt += "\n" + general_advice
  if (advice) prompt += "\n" + advice

  if (previous_verifier_output.length === 1) {
    prompt += "\n\n=== VERIFIER OUTPUT FROM PREVIOUS ROUND ===\n"
    const parsed_verifier_output = safe_json_parse(
      previous_verifier_output[0].content,
      VerifierOutputSchema,
      `Verifier Output (Round ${previous_verifier_output[0].round.index})`
    )
    prompt += "\n## Feedback\n"
    prompt += parsed_verifier_output.feedback_md
    prompt += "\n## Summary\n"
    prompt += parsed_verifier_output.summary_md
  }

  if (all_previous_summarizer_outputs.length > 0) {
    prompt += "\n\n=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ===\n"
    for (let summarizer_output of all_previous_summarizer_outputs) {
      const content = safe_json_parse(
        summarizer_output.content,
        SummarizerOutputSchema,
        `Summarizer Output (Round ${summarizer_output.round.index})`
      )
      prompt += `\n## Round ${summarizer_output.round.index}`
      prompt += `\n${content.summary}`
    }
  }

  for (let file of main_files) {
    if (file.file_type === "notes") prompt += "\n\n=== NOTES (notes.md) ===\n"
    else if (file.file_type === "proofs") prompt += "\n\n=== PROOFS (proofs.md) ===\n"
    else if (file.file_type === "output") prompt += "\n\n=== OVERALL OUTPUTS (output.md) ===\n"
    else prompt += "\n\n=== TASK ==="
    prompt += "\n" + file.content
  }

  return prompt
}

/**
 * VERIFIER PROMPT
 * - specific advice
 * - verifier from previous (only) round (summary & feedback),
 * - summarizer from all previous rounds
 * - notes.md
 * - proofs.md
 * - output.md
 * - the task
 * - TODO: in the future: papers?
 */
export function create_verifier_prompt(prompt: string, files: PromptBuildingFiles, prover_output: string[], advice?: string,) {
  let prompt_1 = create_prover_prompt(prompt, files, undefined, advice)
  for (let [i, output] of prover_output.entries()) {
    prompt_1 += `\n\n=== PROVER-${i + 1} OUTPUT ===\n`
    prompt_1 += output
  }
  return prompt_1
}

export function create_summarizer_prompt(
  base_prompt: string,
  verifier_output: string,
  all_previous_summarizer_outputs: File[],
  new_main_files: { notes: string, proofs: string, output: string, task: string }
) {
  let prompt = base_prompt
  prompt += "\n\n=== VERIFIER OUTPUT ===\n"
  prompt += verifier_output

  if (all_previous_summarizer_outputs.length > 0) {
    prompt += "\n\n=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ===\n"
    for (let summarizer_output of all_previous_summarizer_outputs) {
      const content = safe_json_parse(
        summarizer_output.content,
        SummarizerOutputSchema,
        `Summarizer Output (Round ${summarizer_output.round.index})`
      )
      prompt += `\n## Round ${summarizer_output.round.index}\n`
      prompt += `\n${content.summary}`
    }
  }

  prompt += "\n\n=== NOTES (notes.md) ===\n"
  prompt += new_main_files.notes
  prompt += "\n\n=== PROOFS (proofs.md) ===\n"
  prompt += new_main_files.proofs
  prompt += "\n\n=== OUTPUT (output.md) ===\n"
  prompt += new_main_files.output
  prompt += "\n\n=== TASK ===\n"
  prompt += new_main_files.task

  return prompt
}

export async function update_round_phase(
  db: DbOrTx,
  round_id: string,
  phase: RoundPhase,
  error_message?: string
) {
  const update_round_data: Partial<typeof rounds.$inferInsert> = {
    phase,
    updated_at: sql`NOW()` as any,
  }
  if (error_message) update_round_data.error_message = error_message
  if (phase === "finished") update_round_data.completed_at = sql`NOW()` as any

  await db.update(rounds)
    .set(update_round_data)
    .where(eq(rounds.id, round_id))
}

export async function update_problem_status(db: DbOrTx, problem_id: string, status: ProblemStatus) {
  const update_problem_data: Partial<typeof problems.$inferInsert> = {
    status,
    updated_at: sql`NOW()` as any,
  }
  if (status === "completed") update_problem_data.active_round_id = sql`NULL` as any

  await db.update(problems)
    .set(update_problem_data)
    .where(eq(problems.id, problem_id))
}

export async function save_problem_files(
  db: DbOrTx,
  files: {
    problem_id: string,
    round_id: string,
    file_type: FileType,
    file_name: string,
    content: string,
    usage?: OpenRouterUsageAccounting,
    model_id?: AllowedModelsID
  }[]
) {
  if (files.length === 0) return []
  const result = await db.insert(problem_files)
    .values(files)
    .returning({ id: problem_files.id })
  return result
}

export async function save_llm_log(
  db: DbOrTx,
  prompt_file_id: string,
  response: unknown,
  usage: OpenRouterUsageAccounting,
  model: string
) {
  await db.insert(llms)
    .values({
      prompt_file_id,
      response: JSON.stringify(response, null, 2),
      usage,
      model,
    })
}

export async function update_main_files(
  db: DbOrTx,
  problem_id: string,
  notes: string,
  proofs: string,
  output: string
) {
  await db.transaction(async (tx) => {
    await tx.update(problem_files)
      .set({ content: notes })
      .where(and(
        eq(problem_files.problem_id, problem_id),
        eq(problem_files.file_type, "notes")
      ))
    await tx.update(problem_files)
      .set({ content: proofs })
      .where(and(
        eq(problem_files.problem_id, problem_id),
        eq(problem_files.file_type, "proofs")
      ))
    await tx.update(problem_files)
      .set({ content: output })
      .where(and(
        eq(problem_files.problem_id, problem_id),
        eq(problem_files.file_type, "output")
      ))
  })
}

export async function fetch_previous_round_files(
  db: DbOrTx,
  problem_id: string,
  current_round_index: number
): Promise<PromptBuildingFiles> {
  // (1) Main files - fetch latest version (assuming update_main_files keeps them current)
  // We don't filter by round here because main files evolve.
  const main_files = await db.query.problem_files.findMany({
    columns: {
      file_type: true,
      round_id: true,
      content: true,
    },
    with: {
      round: {
        columns: {
          index: true,
        }
      }
    },
    where: and(
      inArray(problem_files.file_type, ["task", "notes", "proofs", "output"]),
      eq(problem_files.problem_id, problem_id)
    )
  })

  // (2) Verifier from ONLY previous round
  const previous_verifier_output = await db.select({
    file_type: problem_files.file_type,
    content: problem_files.content,
    round_id: problem_files.round_id,
    round: {
      index: rounds.index,
    }
  }).from(problem_files)
    .innerJoin(rounds, eq(problem_files.round_id, rounds.id))
    .where(
      and(
        eq(problem_files.file_type, "verifier_output"),
        eq(problem_files.problem_id, problem_id),
        eq(rounds.index, current_round_index - 1),
      )
    )

  // (3) Summarizer from ALL previous rounds
  const all_previous_summarizer_outputs = await db.select({
    file_type: problem_files.file_type,
    content: problem_files.content,
    round_id: problem_files.id,
    round: {
      index: rounds.index,
    }
  }).from(problem_files)
    .innerJoin(rounds, eq(problem_files.round_id, rounds.id))
    .where(
      and(
        eq(problem_files.file_type, "summarizer_output"),
        eq(problem_files.problem_id, problem_id),
        lt(rounds.index, current_round_index),
      )
    )

  return {
    main_files,
    previous_verifier_output,
    all_previous_summarizer_outputs,
  }
}

export async function generate_llm_response<T>(
  db: DbOrTx,
  openrouter: OpenRouterProvider,
  model_id: AllowedModelsID,
  user_id: string,
  messages: ModelMessage[],
  schema: z.ZodType<T>,
  prompt_file_id: string,
  context: string,
  max_retries: number = 3
): Promise<LLMResponse<T>> {
  let llm_start_time = performance.now()
  let llm_response
  let last_error: Error | null = null

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    try {
      const local_llm_start_time = performance.now()
      llm_response = await generateObject({
        model: openrouter(model_id, {
          reasoning: { effort: "high" },
          user: user_id,
          usage: { include: true },
        }),
        messages,
        schema,
      })
      llm_start_time = local_llm_start_time
      break
    } catch (e) {
      last_error = e as Error
      if (attempt < max_retries) {
        console.warn(`[OpenRouter][${model_id}] Attempt ${attempt}/${max_retries} failed for ${context}: ${last_error.message}. Retrying...`)
      }
    }
  }

  if (!llm_response) {
    throw new Error(`[OpenRouter][${model_id}] LLM generation failed for ${context} after ${max_retries} attempts: ${last_error?.message}`)
  }

  const time = (performance.now() - llm_start_time) / 1000
  const usage = llm_response.providerMetadata!.openrouter!.usage as OpenRouterUsageAccounting
  const reasoning = llm_response.providerMetadata!.openrouter!.reasoning_details

  await save_llm_log(db, prompt_file_id, llm_response, usage, model_id)

  return { object: llm_response.object, usage, reasoning, time, model_id }
}