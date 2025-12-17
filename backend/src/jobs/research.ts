import { z } from "zod"
import { eq, inArray, sql, and } from "drizzle-orm"
import { problems, rounds, problem_files } from "../../drizzle/schema"
import { define_job } from "./job_factory"
import { NewStandardResearch, AllowedModelsID, get_model_id, VerifierOutputSchema, SummarizerOutputSchema, ProverOutputSchema, ProverOutput, VerifierConfigSchema, SummarizerConfigSchema } from "@shared/types/research"
import {
  create_verifier_prompt,
  create_summarizer_prompt,
  create_prover_prompt,
  update_round_phase,
  save_problem_files,
  update_main_files,
  update_problem_status,
  fetch_previous_round_files,
  generate_llm_response,
  PromptBuildingFiles,
  LLMResponse,
  zod_file,
  FileType,
  File,
} from "./research_utils"

const StandardResearchContext = z.object({
  problem_id: z.uuid(),
  current_round_id: z.uuid(),
  user_id: z.uuid(),
  current_round_index: z.number(),
  current_relative_round_index: z.number(),
  research_config: NewStandardResearch,
})

export const run_standard_research = define_job("start_research")
  .queue("standard_research")
  .input(z.object({
    new_research: NewStandardResearch,
    ctx: z.object({
      user_id: z.uuid(),
      current_relative_round_index: z.number().default(1),
    }),
  }))
  .work(async ({ new_research, ctx }, { db, openrouter }) => {
    const problem_id = new_research.problem_id

    console.log(`[job]{standard_research} started for round ${ctx.current_relative_round_index}/${new_research.rounds}`)

    // (1) Create new round we're going to be working on
    const [current_round_id, current_round_index] = await db.transaction(async (tx) => {
      // increment round index
      const [{ current_round }] = await tx.update(problems)
        .set({
          status: "running",
          current_round: sql`${problems.current_round} + 1`,
          updated_at: sql`NOW()`,
        })
        .where(eq(problems.id, problem_id))
        .returning({ current_round: problems.current_round })

      // initialize new round in the db
      const [new_round] = await tx.insert(rounds)
        .values({
          problem_id,
          index: current_round,
          research_type: "standard",
          phase: "prover_working",
          research_config: new_research
        })
        .returning({ id: rounds.id })

      // update active round
      await tx.update(problems)
        .set({ active_round_id: new_round.id })
        .where(eq(problems.id, problem_id))

      return [new_round.id, current_round]
    })

    // (2) Prepare prover prompts
    const files = await fetch_previous_round_files(db, problem_id, current_round_index)

    const prover_prompts = new_research.prover.provers.map(prover =>
      create_prover_prompt(
        new_research.prover.prompt,
        files,
        new_research.prover.general_advice,
        prover.advice,
      )
    )

    const prover_prompt_files_ids = await save_problem_files(
      db,
      prover_prompts.map((prompt, i) => ({
        problem_id,
        file_type: "prover_prompt",
        file_name: `prover-${i + 1}.prompt`,
        content: prompt,
        round_id: current_round_id
      }))
    )

    // (3) Run all provers in parallel
    const llm_start_time = performance.now()
    const prover_promises = new_research.prover.provers.map((prover, i) => {
      const model = get_model_id(prover.model)
      return generate_llm_response(
        db,
        openrouter,
        model,
        ctx.user_id,
        [
          { role: "system", content: "You are a research mathematician." },
          { role: "user", content: prover_prompts[i] },
        ],
        ProverOutputSchema,
        prover_prompt_files_ids[i].id,
        `prover ${i + 1}`
      )
    })

    const results = await Promise.allSettled(prover_promises)
    // TODO: provers_total_time could possibly be calculated from the results
    // as max from all times
    const provers_total_time = (performance.now() - llm_start_time) / 1000

    // (4) Process LLM outputs
    // The typecasts are required to narrow the filter result
    // to correct type as TS can't do this on its own yet.
    const successful_results = results
      .map((result, index) => ({ result, index }))
      .filter(item => item.result.status === "fulfilled") as {
        result: PromiseFulfilledResult<LLMResponse<ProverOutput>>,
        index: number
      }[]

    const failed_results = results
      .map((result, index) => ({ result, index }))
      .filter(item => item.result.status === "rejected") as {
        result: PromiseRejectedResult,
        index: number
      }[]

    if (failed_results.length > 0) {
      console.warn(`[job]{standard_research} ${failed_results.length} provers failed.`)
      const failed_file_ids = failed_results.map(f => prover_prompt_files_ids[f.index].id)

      await db.delete(problem_files)
        .where(inArray(problem_files.id, failed_file_ids))
      console.log(`[job]{standard_research} deleted ${failed_file_ids.length} failed prompt files.`)

      const failed_models = failed_results.map(f => new_research.prover.provers[f.index].model)
      await db.update(rounds)
        .set({
          failed_provers: failed_models,
          updated_at: sql`NOW()`,
        })
        .where(eq(rounds.id, current_round_id))
    }

    if (successful_results.length === 0) {
      await update_round_phase(db, current_round_id, "prover_failed", "All provers failed!")
      await update_problem_status(db, problem_id, "failed")
      return
    }

    const provers_usage_cost = successful_results.reduce((acc, result) =>
      acc + (result.result.value.usage.cost || 0), 0)

    await db.update(rounds)
      .set({
        prover_time: provers_total_time,
        usage: sql`${rounds.usage} + ${provers_usage_cost}`,
        updated_at: sql`NOW()`,
      })
      .where(eq(rounds.id, current_round_id))

    // (5) Save successful outputs
    const prover_output = []
    const files_to_save = []

    for (const { result, index } of successful_results) {
      const { object: content, usage, reasoning, model_id } = result.value
      files_to_save.push({
        problem_id,
        round_id: current_round_id,
        file_type: "prover_output" as FileType,
        file_name: `prover-${index + 1}.output`,
        content: content.content,
        model_id,
        usage,
      })
      files_to_save.push({
        problem_id,
        round_id: current_round_id,
        file_type: "prover_reasoning" as FileType,
        file_name: `prover-${index + 1}.reasoning`,
        content: JSON.stringify(reasoning, null, 2),
        model_id,
      })

      prover_output.push(content.content)
    }

    await save_problem_files(db, files_to_save)

    await update_round_phase(db, current_round_id, "prover_finished")

    // (Final) Run Verifier!
    run_standard_verifier.emit({
      ctx: {
        problem_id,
        current_round_id,
        user_id: ctx.user_id,
        current_round_index,
        current_relative_round_index: ctx.current_relative_round_index,
        research_config: new_research,
      },
      summarizer: new_research.summarizer,
      verifier: new_research.verifier,
      files: files,
      prover_output,
    })
  })

export const run_standard_verifier = define_job("verifier")
  .queue("standard_research")
  .input(z.object({
    ctx: StandardResearchContext,
    prover_output: z.array(z.string()),
    verifier: VerifierConfigSchema,
    summarizer: SummarizerConfigSchema,
    files: z.object({
      main_files: z.array(zod_file(["task", "proofs", "notes", "output"])),
      previous_verifier_output: z.array(zod_file(["verifier_output"])),
      all_previous_summarizer_outputs: z.array(zod_file(["summarizer_output"])),
    })
  }))
  .work(async (research, { db, openrouter }) => {
    const ctx = research.ctx

    await update_round_phase(db, ctx.current_round_id, "verifier_working")

    // (1) Build verifier prompt
    const files = research.files as PromptBuildingFiles

    const verifier_prompt = create_verifier_prompt(
      research.verifier.prompt,
      files,
      research.prover_output,
      research.verifier.advice,
    )
    const model = get_model_id(research.verifier.model)

    const [verifier_prompt_file] = await save_problem_files(db, [{
      problem_id: ctx.problem_id,
      file_type: "verifier_prompt",
      file_name: "verifier.prompt",
      content: verifier_prompt,
      round_id: ctx.current_round_id
    }])

    // (2) Generate verifier output
    const { object: verifier_output, usage, reasoning, time, model_id } = await generate_llm_response(
      db,
      openrouter,
      model,
      ctx.user_id,
      [
        { role: "system", content: "You are a strict mathematical verifier & research manager." },
        { role: "user", content: verifier_prompt },
      ],
      VerifierOutputSchema,
      verifier_prompt_file.id,
      "Verifier"
    )

    await db.update(rounds)
      .set({
        verifier_time: time,
        usage: sql`${rounds.usage} + ${usage.cost || 0}`,
        updated_at: sql`NOW()`,
      })
      .where(eq(rounds.id, ctx.current_round_id))

    // (3) Save verifier output
    await save_problem_files(db, [
      {
        problem_id: ctx.problem_id,
        file_type: "verifier_output",
        file_name: "verifier.output",
        content: JSON.stringify(verifier_output, null, 2),
        round_id: ctx.current_round_id,
        model_id,
        usage,
      },
      {
        problem_id: ctx.problem_id,
        file_type: "verifier_reasoning",
        file_name: "verifier.reasoning",
        content: JSON.stringify(reasoning, null, 2),
        round_id: ctx.current_round_id,
        model_id,
      }
    ])

    // (4) Update main files
    const notes = files.main_files.find(f => f.file_type === "notes")!
    const proofs = files.main_files.find(f => f.file_type === "proofs")!
    const output = files.main_files.find(f => f.file_type === "output")!

    const new_notes = verifier_output.notes_update.action === "append"
      ? notes.content + "\n\n" + verifier_output.notes_update.content
      : verifier_output.notes_update.content

    const new_proofs = verifier_output.proofs_update.action === "append"
      ? proofs.content + "\n\n" + verifier_output.proofs_update.content
      : verifier_output.proofs_update.content

    const new_output = verifier_output.output_update.action === "append"
      ? output.content + "\n\n" + verifier_output.output_update.content
      : verifier_output.output_update.content

    await update_main_files(db, ctx.problem_id, new_notes, new_proofs, new_output)
    await update_round_phase(db, ctx.current_round_id, "verifier_finished")

    // (FINAL) Run Summarizer!
    run_standard_summarizer.emit({
      ctx: {
        problem_id: ctx.problem_id,
        current_round_id: ctx.current_round_id,
        user_id: ctx.user_id,
        current_round_index: ctx.current_round_index,
        current_relative_round_index: ctx.current_relative_round_index,
        research_config: ctx.research_config,
      },
      summarizer: research.summarizer,
      verifier_output: JSON.stringify(verifier_output, null, 2),
      files: {
        new_main_files: {
          notes: new_notes,
          proofs: new_proofs,
          output: new_output,
          task: files.main_files.find(f => f.file_type === "task")!.content
        },
        all_previous_summarizer_outputs: research.files.all_previous_summarizer_outputs,
      },
    })
  })
  .on("failed", async ({ db }, job, error) => {
    const ctx = job!.data.ctx as z.infer<typeof StandardResearchContext>
    await update_round_phase(db, ctx.current_round_id, "verifier_failed", error.message)
    await update_problem_status(db, ctx.problem_id, "failed")
  })

export const run_standard_summarizer = define_job("summarizer")
  .queue("standard_research")
  .input(z.object({
    ctx: StandardResearchContext,
    verifier_output: z.string(),
    files: z.object({
      new_main_files: z.object({
        notes: z.string(),
        proofs: z.string(),
        output: z.string(),
        task: z.string(),
      }),
      all_previous_summarizer_outputs: z.array(zod_file(["summarizer_output"])),
    }),
    summarizer: SummarizerConfigSchema,
  }))
  .work(async (research, { db, openrouter }) => {
    const ctx = research.ctx
    const files = research.files

    await update_round_phase(db, ctx.current_round_id, "summarizer_working")

    // (1) Build summarizer prompt
    const prev_summarizer_outputs = files.all_previous_summarizer_outputs as File[]

    const summarizer_prompt = create_summarizer_prompt(
      research.summarizer.prompt,
      research.verifier_output,
      prev_summarizer_outputs,
      files.new_main_files
    )

    const [summarizer_prompt_file] = await save_problem_files(db, [{
      problem_id: ctx.problem_id,
      file_type: "summarizer_prompt",
      file_name: "summarizer.prompt",
      content: summarizer_prompt,
      round_id: ctx.current_round_id
    }])

    // (2) Generate summarizer output
    const model = get_model_id(research.summarizer.model)
    const { object: summarizer_output, usage, reasoning, time, model_id } = await generate_llm_response(
      db,
      openrouter,
      model,
      ctx.user_id,
      [
        { role: "system", content: "You are a research summarizer." },
        { role: "user", content: summarizer_prompt },
      ],
      SummarizerOutputSchema,
      summarizer_prompt_file.id,
      "Summarizer"
    )

    // (3) Save summarizer output & Finalize round
    await db.transaction(async (tx) => {
      await save_problem_files(tx, [
        {
          problem_id: ctx.problem_id,
          file_type: "summarizer_output",
          file_name: "summarizer.output",
          content: JSON.stringify(summarizer_output, null, 2),
          round_id: ctx.current_round_id,
          model_id,
          usage
        },
        {
          problem_id: ctx.problem_id,
          file_type: "summarizer_reasoning",
          file_name: "summarizer.reasoning",
          content: JSON.stringify(reasoning, null, 2),
          round_id: ctx.current_round_id,
          model_id,
        }
      ])

      await tx.update(rounds)
        .set({
          summarizer_time: time,
          phase: "finished",
          updated_at: sql`NOW()`,
          completed_at: sql`NOW()`,
          usage: sql`${rounds.usage} + ${usage.cost || 0}`,
        })
        .where(eq(rounds.id, ctx.current_round_id))
    })

    // (FINAL) Decide whether to start next round or finish research
    if (ctx.current_relative_round_index < ctx.research_config.rounds) {
      run_standard_research.emit({
        new_research: ctx.research_config,
        ctx: {
          user_id: ctx.user_id,
          current_relative_round_index: ctx.current_relative_round_index + 1,
        },
      })
    } else {
      await update_problem_status(db, ctx.problem_id, "completed")
      console.log(`[job]{summarizer} research completed after ${ctx.current_relative_round_index} rounds!`)
    }
  })
  .on("failed", async ({ db }, job, error) => {
    const ctx = job!.data.ctx as z.infer<typeof StandardResearchContext>
    await update_round_phase(db, ctx.current_round_id, "summarizer_failed", error.message)
    await update_problem_status(db, ctx.problem_id, "failed")
  })

export const research_jobs = [
  run_standard_research,
  run_standard_verifier,
  run_standard_summarizer,
]