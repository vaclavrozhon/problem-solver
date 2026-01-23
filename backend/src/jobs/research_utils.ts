import { eq, sql, and, inArray, lt } from "drizzle-orm"
import { problems, rounds, problem_files, llms, files_types } from "../../drizzle/schema"
import type { OpenRouterProvider, OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"
import { z } from "zod"
import { streamText, ModelMessage, Output, generateText } from "ai"
import { ModelConfig, VerifierOutputSchema, SummarizerOutputSchema, get_model_by_id } from "@shared/types/research"
import type { ModelID } from "@shared/types/research"
import type { Database } from "../db"
import { InferSelectModel } from "drizzle-orm"

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

export type LLMResponse<T> =
  {
    success: true,
    output: T,
    usage: OpenRouterUsageAccounting,
    request: Awaited<ReturnType<typeof streamText>["request"]>,
    time: number,
    model_id: ModelID,
  } | {
    success: false,
    error: Error,
    model_id: ModelID,
  }

export interface ResearchContext {
  db: DbOrTx,
  problem_id: string,
  round_id: string,
  user_id: string,
  round_index: number,
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
 * - round instructions (shared across all agents)
 * - per_prover instructions
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
  round_instructions?: string,
  prover_instructions?: string
) {
  if (round_instructions) {
    prompt += "\n\n=== ADDITIONAL INSTRUCTIONS ===\n"
    prompt += round_instructions
  }
  if (prover_instructions) {
    prompt += "\n\n=== IMPORTANT INSTRUCTIONS ===\n"
    prompt += prover_instructions
  }

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
 * - round instructions (shared across all agents)
 * - verifier from previous (only) round (summary & feedback),
 * - summarizer from all previous rounds
 * - notes.md
 * - proofs.md
 * - output.md
 * - the task
 * - prover outputs
 * - TODO: in the future: papers?
 */
export function create_verifier_prompt(prompt: string, files: PromptBuildingFiles, prover_output: string[], round_instructions?: string) {
  let prompt_1 = create_prover_prompt(prompt, files, round_instructions, undefined)
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
  new_main_files: { notes: string, proofs: string, output: string, task: string },
  round_instructions?: string
) {
  let prompt = base_prompt

  if (round_instructions) {
    prompt += "\n\n=== ADDITIONAL INSTRUCTIONS ===\n"
    prompt += round_instructions
  }

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
    model_id?: ModelID,
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

/**
 * params for generating LLM response with structured output
 * @template T expected output type inferred from the zod schema
 */
export interface GenerateLLMResponseParams<T> {
  db: DbOrTx,
  openrouter: OpenRouterProvider,
  /** model configuration */
  model: ModelConfig,
  /** 
   * user_id` for OpenRouter tracking/usage/stats
   * 
   * FUNFACT: leaks internal user ids to OpenRouter
   * */
  user_id: string,
  /** zod schema for validating and typing the structured output */
  schema?: z.ZodType<T>,
  messages: ModelMessage[],
  /** UUID of the file that stores the prompt contained in `messages` */
  prompt_file_id: string,
  /** [dev helper] context for error messages: [prover], [verifier], ... */
  context: string,
  max_retries?: number,
  /** save LLM response to DB (default: `true`) */
  save_to_db?: boolean,
  /** OpenRouter supporst values `0-2` with default being `1` */
  temperature?: number,
}

export async function generate_llm_response<T>({
  db,
  openrouter,
  model,
  user_id,
  messages,
  schema,
  prompt_file_id,
  context,
  max_retries = 3,
  save_to_db = true,
  temperature = 1,
}: GenerateLLMResponseParams<T>): Promise<LLMResponse<T>> {
  const log_prefix = `[OpenRouter][${model.id}][${context}]`

  const model_id = model.id
  const model_info = get_model_by_id(model_id)!

  let last_error: Error | null = null

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    const llm_start_time = performance.now()
    
    // No Schema => Generate Text only
    // That's via streaming for better connection
    if (schema === undefined) {
      // (1) Initialize stream
      let stream: ReturnType<typeof streamText>
      try {
        stream = streamText({
          model: openrouter(model_id, {
            user: user_id,
            usage: { include: true },
            extraBody: {
              reasoning: get_reasoning_config(model),
              plugins: [
                { id: "response-healing" },
              ],
            },
            provider: {
              only: [model_info.provider],
            },
          }),
          messages,
          temperature,
          onError({ error }: { error: unknown }) {
            console.log(error)
            last_error = error instanceof Error ? error : new Error(String(error))
          }
        })
      } catch (e) {
        last_error = e instanceof Error ? e : new Error(String(e))
        console.warn(`${log_prefix}[${attempt}/${max_retries}] init failed: ${last_error.message}`)
        continue
      }
  
      // (2) consume stream – don't process chunks, just wait for the end
      try {
        // this can throw only network errors
        // other errors should be handled via the `streamText` function
        for await (const _ of stream.fullStream) {}
      } catch (e) {
        last_error = e instanceof Error ? e : new Error(String(e))
        console.warn(`${log_prefix}[${attempt}/${max_retries}] stream failed: ${last_error.message}`)
        continue
      }
  
      // (2a): (3) is gonna potentially overwrite some older errors so we need
      // to handle errors here and then later again
      if (last_error) continue
  
      // (3) await final results
      try {
        // BUG: weird cast conflicts with return below
        const output = await stream.output as T
        const request = await stream.request
        const provider_metadata = await stream.providerMetadata
        const usage = provider_metadata?.openrouter?.usage as OpenRouterUsageAccounting
        const time = (performance.now() - llm_start_time) / 1000
  
        if (save_to_db) {
          await save_llm_log(db, prompt_file_id, output, usage, model_id)
        }
  
        return { success: true, output, usage, request, time, model_id }
      } catch (e) {
        last_error = e instanceof Error ? e : new Error(String(e))
        console.warn(`${log_prefix}[${attempt}/${max_retries}] finalization failed: ${last_error.message}`)
        continue
      }
    // Schema set => No streaming – waiting for response
    } else {
      try {
        const { output, request, providerMetadata } = await generateText({
          model: openrouter(model_id, {
            user: user_id,
            usage: { include: true },
            extraBody: {
              reasoning: get_reasoning_config(model),
              plugins: [
                { id: "response-healing" },
              ],
            },
            provider: {
              only: [model_info.provider],
            },
          }),
          messages,
          temperature,
          output: Output.object({ schema }),
        })

        const usage = providerMetadata?.openrouter?.usage as OpenRouterUsageAccounting
        const time = (performance.now() - llm_start_time) / 1000
        
        if (save_to_db) {
          await save_llm_log(db, prompt_file_id, output, usage, model_id)
        }
        
        return {
          success: true,
          output,
          usage,
          request,
          time,
          model_id,
        }
      } catch (e) {
        last_error = e instanceof Error ? e : new Error(String(e))
        console.warn(`${log_prefix}[${attempt}/${max_retries}] schema generation call failed: ${last_error.message}`)
      }
    }
  }

  return {
    success: false,
    error: last_error ?? new Error("Unknown error"),
    model_id,
  }
}

/**
 * @returns valid reasoning request config for OpenRouter API based on model config
 */
function get_reasoning_config(model: ModelConfig) {
  const reasoning = model.config.reasoning_effort

  if (reasoning === null) return undefined

  if (typeof reasoning === "boolean") return {
    "enabled": reasoning,
  }

  // This check is for models that support both effort values & turning thinking on/off
  // and don't support `none` -> instead must be turned off through `enabled`
  // TODO: make a note somewhere that when adding model, to always also add them here
  if (reasoning === "none") {
    if (model.id === "google/gemini-3-flash-preview") return {
      "enabled": false,
    }
  }

  return {
    "effort": reasoning,
  }
}
