import { generateObject } from "ai"
import { z } from "zod"
import { eq, sql, and, inArray, lt } from "drizzle-orm"
import { problems, runs, problem_files, llms } from "../../drizzle/schema"
import { OpenRouterUsageAccounting } from "@openrouter/ai-sdk-provider"
import { AllowedModelsID, get_model_id } from "@shared/types/research"

import { define_job } from "./manager"
import { NewStandardResearch } from "@shared/types/research"
import { SmartModels, SummarizerModels, get_model_id } from "@shared/types/research"

// TODO/BUG: Will need refactoring, so far only working for summoning 1 round at a time.
export const run_standard_verifier = define_job("standard_verifier")
  .input(z.object({
    problem_id: z.uuid(),
    run_id: z.uuid(),
    user_id: z.uuid(),
    round: z.number(), // TODO better round type
    // TODO: abstraction like
    /**
     * rounds: {
     *  prover_output: ....?
     * }[]
     */
    prover_output: z.array(z.string()),
    // BUG: ALSO, TYPE THESE CORRECTLY
    verifier: z.object({
      advice: z.string(),
      model: SmartModels,
      prompt: z.string().min(20),
    }),
    summarizer: z.object({
      prompt: z.string().min(20),
      model: SummarizerModels,
    }),
    // =====
    // TODO: TYPE CORRECTLY
    files: z.object({
      main_files: z.any(),
      previous_verifier_output: z.any(),
      all_previous_summarizer_outputs: z.any(),
    })
    // =====
  }))
  .work(async (research, { db, openrouter }) => {
    console.log("STARTED VERIFIER!")

    // Updates run status
    await db.update(runs)
      .set({
        phase: "verifier_working",
        updated_at: sql`NOW()`,
      }).where(eq(runs.id, research.run_id))

    // Build prompt
    const verifier_prompt = create_verifier_prompt(
      research.verifier.prompt,
      research.files,
      research.prover_output,
      research.verifier.advice,
    )
    const model = get_model_id(research.verifier.model)

    // Store prompt in the DB
    const [verifier_prompt_file] = await db.insert(problem_files)
      .values({
        problem_id: research.problem_id,
        file_type: "verifier_prompt",
        file_name: "verifier.prompt",
        content: verifier_prompt,
        round: research.round,
      })
      .returning({ id: problem_files.id })

    // Call LLM ( try - catch if catch error, save to db, return)
    // & Time the LLM
    const llm_start_time = performance.now()
    let llm_response
    try {
      llm_response = await generateObject({
        model: openrouter(model, {
          reasoning: { effort: "high" },
          user: research.user_id,
          usage: { include: true },
        }),
        messages: [
          {
            role: "system",
            content: "You are a strict mathematical verifier & research manager." 
          },
          { role: "user", content: verifier_prompt },
          // TODO: separate the prompt into more messages? would that do anything?
        ],
        schema: z.object({
          feedback_md: z.string().describe("Detailed critique of prover outputs (≥200 words). Include concrete next-step suggestions. Use Markdown (GFM enabled) & KaTeX for better readability. All KaTeX code needs to be enclosed in single '$' from each side."),
          summary_md: z.string().describe("Concise summary of this round's work for summarizer. Use Markdown (GFM enabled) & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for better readability."),
          // TODO: is the describe necessary here?
          verdict: z.enum(["promising", "uncertain", "unlikely"]).describe("promising|uncertain|unlikely"),
          // TODO: correct? blocking issues?
          blocking_issues: z.array(z.string()).describe(`List of issues preventing progress.`),
          per_prover: z.array(z.object({
            prover_id: z.string().describe("ID of the evaluated prover."),
            brief_feedback: z.string().describe("Feedback for given prover."),
            score: z.enum(["promising", "uncertain", "unlikely"]),
          })).describe("List of prover-specific feedback."),
          notes_update: z.object({
            action: z.enum(["append", "replace"]).describe("Action to edit current file with new contents."),
            content: z.string().describe("Markdown & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for notes.md"),
          }).describe("How should the `notes.md` file be edited?"),
          proofs_update: z.object({
            action: z.enum(["append", "replace"]).describe("Action to edit current file with new contents."),
            content: z.string().describe("Markdown & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for proofs.md"),
          }).describe("How should the `proofs.md` file be edited?"),
          output_update: z.object({
            action: z.enum(["append", "replace"]).describe("Action to edit current file with new contents."),
            content: z.string().describe("Markdown & KaTeX (All KaTeX code needs to be enclosed in single '$' from each side.) for output.md"),
          }).describe("How should the `output.md` file be edited?"),
        }),
      })
    } catch (e) {
      // BUG: Should also update PROBLEM Status to fAILED
      await db.update(runs)
        .set({
          phase: "verifier_failed",
          status: "failed",
          error_message: JSON.stringify(e),
          updated_at: sql`NOW()`
        }).where(eq(runs.id, research.run_id))
      return
    }

    // TODO deal with this
    const verifier_time = performance.now() - llm_start_time

    const usage = llm_response.providerMetadata!.openrouter.usage as OpenRouterUsageAccounting
    const reasoning = llm_response.providerMetadata!.openrouter.reasoning_details

    // Store the response in the DB
    await db.transaction(async (tx) => {

      await tx.insert(problem_files)
        .values([
          {
            problem_id: research.problem_id,
            file_type: "verifier_output",
            file_name: "verifier.output",
            round: research.round,
            content: JSON.stringify(llm_response.object, null, 2),
            usage,
          },
          {
            problem_id: research.problem_id,
            file_type: "verifier_reasoning",
            file_name: "verifier.reasoning",
            round: research.round,
            content: JSON.stringify(reasoning, null, 2)
          }
        ])

        // TODO STORE TIME DATA IN THE DB


      await tx.insert(llms)
        .values({
          prompt_file_id: verifier_prompt_file.id,
          response: JSON.stringify(llm_response, null, 2),
          usage,
          model,
        })
    })

    // Update notes.md, proofs.md, output.md
    // TODO: REFACTOR
    // TODO: Consider whether the Verifier isn't doing too much
    // [ONE PROMPT, ONE PURPOSE MINDSET]
    // === NOTES ===
    // @ts-ignore
    const notes = research.files.main_files.filter(file => file.file_type === "notes")[0]
    const notes_update = llm_response.object.notes_update
    let new_notes
    if (notes_update.action === "append") {
      new_notes = notes.content + "\n\n" + notes_update.content
    } else {
      new_notes = notes_update.content
    }
    // === PROOFS ===
    // @ts-ignore
    const proofs = research.files.main_files.filter(file => file.file_type === "proofs")[0]
    const proofs_update = llm_response.object.proofs_update
    let new_proofs
    if (proofs_update.action === "append") {
      new_proofs = proofs.content + "\n\n" + proofs_update.content
    } else {
      new_proofs = proofs_update.content
    }
    // === OUTPUT ===
    // @ts-ignore
    const output = research.files.main_files.filter(file => file.file_type === "output")[0]
    const output_update = llm_response.object.output_update
    let new_output
    if (output_update.action === "append") {
      new_output = output.content + "\n\n" + output_update.content
    } else {
      new_output = output_update.content
    }

    // === STORE NOTES, PROOFS, OUTPUT IN DB ===
    await db.transaction(async (tx) => {
      await tx.update(problem_files)
        .set({ content: new_notes })
        .where(and(
          eq(problem_files.problem_id, research.problem_id),
          eq(problem_files.file_type, "notes")
        ))
      await tx.update(problem_files)
        .set({ content: new_proofs })
        .where(and(
          eq(problem_files.problem_id, research.problem_id),
          eq(problem_files.file_type, "proofs")
        ))
      await tx.update(problem_files)
        .set({ content: new_output })
        .where(and(
          eq(problem_files.problem_id, research.problem_id),
          eq(problem_files.file_type, "output")
        ))

      // Update run status
      await tx.update(runs)
        .set({
          phase: "verifier_finished",
          updated_at: sql`NOW()`,
        }).where(eq(runs.id, research.run_id))
    })

    // Pass data to summarizer
    run_standard_summarizer.emit({
      run_id: research.run_id,
      problem_id: research.problem_id,
      user_id: research.user_id,
      round: research.round,
      summarizer: research.summarizer,
      new_main_files: {
        notes: new_notes,
        proofs: new_proofs,
        output: new_output,
        task: research.files.main_files.filter(f => f.file_type === "task")[0].content
      },
      all_previous_summarizer_outputs: research.files.all_previous_summarizer_outputs,
      // TODO: make this prettier
      verifier_output: JSON.stringify(llm_response.object, null, 2)
    })
  })


export const run_standard_summarizer = define_job("standard_summarizer")
  .input(z.object({
    run_id: z.uuid(),
    problem_id: z.uuid(),
    user_id: z.uuid(),
    round: z.number(),
    // TODO: TYPE CORRECTLY
    verifier_output: z.string(),
    new_main_files: z.object({
      notes: z.string(),
      proofs: z.string(),
      output: z.string(),
      task: z.string(),
    }),
    all_previous_summarizer_outputs: z.array(z.object()),
    summarizer: z.object({
      prompt: z.string().min(20),
      model: SummarizerModels,
    }),
  }))
  .work(async (research, { db, openrouter }) => {

    // Update run status
    await db.update(runs)
      .set({ phase: "summarizer_working", updated_at: sql`NOW()` })
      .where(eq(runs.id, research.run_id))

    // build prompt
    let summarizer_prompt = research.summarizer.prompt
    summarizer_prompt += "\n\n=== VERIFIER OUTPUT ==="
    summarizer_prompt += research.verifier_output

    if (research.all_previous_summarizer_outputs.length > 0) {
      summarizer_prompt += "\n\n=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ==="
      for (let summarizer_output of research.all_previous_summarizer_outputs) {
        summarizer_prompt += `\n## Round ${summarizer_output.round}`
        summarizer_prompt += `\n${JSON.parse(summarizer_output.content).summary}`
      }
    }

    summarizer_prompt += "\n\n=== NOTES (notes.md) ==="
    summarizer_prompt += research.new_main_files.notes
    summarizer_prompt += "\n\n=== PROOFS (proofs.md) ==="
    summarizer_prompt += research.new_main_files.proofs
    summarizer_prompt += "\n\n=== OUTPUT (output.md) ==="
    summarizer_prompt += research.new_main_files.output
    summarizer_prompt += "\n\n=== TASK ==="
    summarizer_prompt += research.new_main_files.task

    // store prompt in the DB
    const [summarizer_prompt_file] = await db.insert(problem_files)
      .values({
        problem_id: research.problem_id,
        file_type: "summarizer_output",
        file_name: "summarizer.output",
        content: summarizer_prompt,
        round: research.round,
      })
      .returning({ id: problem_files.id })

    // get model id
    const model = get_model_id(research.summarizer.model)

    // call LLM & time LLM
    let llm_response
    const llm_start_time = performance.now()
    try {
      llm_response = await generateObject({
        model: openrouter(model, {
          reasoning: { effort: "high" },
          user: research.user_id,
          usage: { include: true },
        }),
        messages: [
          {
            role: "system",
            content: "You are a research summarizer." 
          },
          { role: "user", content: summarizer_prompt },
          // TODO: separate the prompt into more messages? would that do anything?
        ],
        schema: z.object({
          summary: z.string().describe("Readable summary of the round (≤200 words). Use Markdown (GFM enabled) & KaTeX for better readability. All KaTeX code needs to be enclosed in single '$' from each side."),
          one_line_summary: z.string().describe("Brief one-line summary for UI display (≤100 chars). Use Markdown (GFM enabled) & KaTeX for better readability. All KaTeX code needs to be enclosed in single '$' from each side."),
          // TODO
          /**
           * TODO: In the original prompt there we also fields
           * "highlights": [] & "next_questions": []
           * seems interesting
           */
        }),
      })
    } catch (e) {
      // BUG: Also update problems status to failed
      await db.update(runs)
        .set({
          phase: "summarizer_failed",
          status: "failed",
          error_message: JSON.stringify(e),
          updated_at: sql`NOW()`,
        }).where(eq(runs.id, research.run_id))
      return
    }
    // TODO: store this time in the db in upcoming rounds table
    const summarizer_llm_time = performance.now() - llm_start_time

    const usage = llm_response.providerMetadata!.openrouter.usage as OpenRouterUsageAccounting
    const reasoning = llm_response.providerMetadata!.openrouter.reasoning_details

    // store summaraizer ouptut & reaosning in teh DB && llm output
    // + update run status & problem status !
    await db.transaction(async (tx) => {
      await tx.insert(problem_files)
        .values([
          {
            problem_id: research.problem_id,
            file_type: "summarizer_output",
            file_name: "summarizer.output",
            round: research.round,
            content: JSON.stringify(llm_response.object, null, 2),
            usage,
          },
          {
            problem_id: research.problem_id,
            file_type: "summarizer_reasoning",
            file_name: "summarizer.reasoning",
            round: research.round,
            content: JSON.stringify(reasoning, null, 2)
          }
        ])

      await tx.insert(llms)
        .values({
          prompt_file_id: summarizer_prompt_file.id,
          response: JSON.stringify(llm_response, null, 2),
          usage,
          model,
        })
      
      await tx.update(runs)
        .set({
          phase: "ended",
          status: "completed",
          completed_at: sql`NOW()`,
          updated_at: sql`NOW()`,
        }).where(eq(runs.id, research.run_id))
      
      })

    // BUG: I left this out the transcation bcs i dontk now if the NULL thing is valid
    await db.update(problems)
      .set({
        status: "completed",
        updated_at: sql`NOW()`,
        // TODO: not sure if it wont crash the whole thing
        active_run_id: sql`NULL`
      }).where(eq(problems.id, research.problem_id))
  })











export const run_standard_research = define_job("standard_research")
  .input(z.object({
    new_research: NewStandardResearch,
    user_id: z.uuid(),
  }))
  .work(async ({ new_research, user_id }, { db, openrouter }) => {
    const problem_id = new_research.problem_id

    // the ideal order: we fetch (TODO) previous rounds data -> format, then create new files along with updating the state so that nothing can break

    // Firstly, we need to create the RUN, link Problem to ACTIVE_RUN, sets status to RUNNING
    // Also indicate phase inside RUN
    const [run_id, current_round, files] = await db.transaction(async (tx) => {
      const [new_run] = await tx.insert(runs)
        .values({ problem_id, phase: "prover_working" })
        .returning({ id: runs.id })

      const [{ current_round }] = await tx.update(problems)
        .set({
          status: "running",
          active_run_id: new_run.id,
          current_round: sql`${problems.current_round} + 1`,
          updated_at: sql`NOW()`,
        })
        .where(eq(problems.id, problem_id))
        .returning({ current_round: problems.current_round })


      // Retrieving importants files for prompt-building
      // (1) Main files
      const main_files = await tx.select({
        file_type: problem_files.file_type,
        content: problem_files.content,
        round: problem_files.round,
      }).from(problem_files)
        .where(
          and(
            inArray(problem_files.file_type, ["task", "notes", "proofs", "output"]),
            eq(problem_files.round, 0),
            eq(problem_files.problem_id, problem_id)
          )
        )
      // (2) Verifier from ONLY previous round
      // BUG: verifier doesnt need round & file_type
      const previous_verifier_output = await tx.select({
        file_type: problem_files.file_type,
        content: problem_files.content,
        round: problem_files.round,
      }).from(problem_files)
        .where(
          and(
            eq(problem_files.file_type, "verifier_output"),
            eq(problem_files.round, current_round - 1),
            eq(problem_files.problem_id, problem_id)
          )
        )
      // (3) Summarizer from ALL previous rounds
      const all_previous_summarizer_outputs = await tx.select({
        file_type: problem_files.file_type,
        content: problem_files.content,
        round: problem_files.round,
      }).from(problem_files)
        .where(
          and(
            eq(problem_files.file_type, "summarizer_output"),
            lt(problem_files.round, current_round),
            eq(problem_files.problem_id, problem_id)
          )
        )
      const files = {
        main_files,
        previous_verifier_output,
        all_previous_summarizer_outputs,
      }

      return [new_run.id, current_round, files]
    })

    // We create prover prompts and store them in the DATABASE
    // Before we do anything, we need to create the prompts, store them in the DB
    // We create prompts for all provers
    // then we'd like to think, we could create the verifier prompot straight away but no.
    // -> It requires output from the prover!
    // (of course we could just store it straight away and then edit it with the received
    // data but thats complicated, confuses user)
    let prover_prompts = []
    for (let prover of new_research.prover.provers) {
      prover_prompts.push(
        create_prover_prompt(
          new_research.prover.prompt,
          // @ts-expect-error
          files,
          new_research.prover.general_advice,
          prover.advice,
        )
      )
    }

    const prover_prompt_files = prover_prompts.map((prompt, i) => ({
      problem_id,
      file_type: "prover_prompt" as "prover_prompt",
      file_name: `prover-${i + 1}.prompt`,
      content: prompt,
      round: current_round,
    }))

    // We should create prompt files for provers
    const prover_prompt_files_ids = await db.insert(problem_files)
      .values(prover_prompt_files)
      .returning({ id: problem_files.id })

    // we then start with querying prover, we could send all prover requests at the same time
    // we await them
    // when we send out the request we should somehow store the request id for later retrieval if anything goes wrong –– CAN'T BE DONE, WE JUST HOPE FOR THE BEST I GUESS
    // or explore the background thingie
    // The LLM should get only role like "You are a research mathematician". (per https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts)
    // TODO: Gemini caching is a bit sketchy, needs to be explicitly configured

    // BUG: What happens if we receive empty response?
    // TODO: if we get an error, we should display the error on the problem overview
    let llm_responses
    try {
      let prover_promises = []
      for (let [i, prover_prompt] of prover_prompts.entries()) {
        let model_for_prover = get_model_id(new_research.prover.provers[i].model)
        prover_promises.push(generateObject({
          model: openrouter(model_for_prover, {
            reasoning: { effort: "high" },
            user: user_id,
            usage: { include: true },
          }),
          messages: [
            { role: "system", content: "You are a research mathematician." },
            { role: "user", content: prover_prompt },
            // TODO: separate the prompt into more messages? would that do anything?
          ],
          schema: z.object({
            content: z.string().describe("Your complete analysis in Markdown (KaTeX allowed, all KaTeX code needs to be enclosed in single '$' from each side). Include reasoning, examples, proofs, failed attempts, intuitions - everything for the verifier to review.")
          }),
        }))
      }
      // TODO Promise.all allows us not to lose all response
      // should revisit implementation
      const llm_start_time = performance.now()
      llm_responses = await Promise.all(prover_promises)
      const provers_total_time = performance.now() - llm_start_time
      await db.insert(problem_files)
        .values({
          problem_id,
          file_type: "round_meta",
          file_name: `round-${current_round}.meta`,
          round: current_round,
          content: JSON.stringify({
            provers: provers_total_time,
          })
        })
    } catch (e) {
      // BUG: Should also update PROBLEM Status to fAILED
      await db.update(runs)
        .set({
          phase: "prover_failed",
          status: "failed",
          error_message: JSON.stringify(e),
          updated_at: sql`NOW()`,
        })
        .where(eq(runs.id, run_id))
      console.error("[job]{standard_research} failed at prover's step because of", e)
      return
    }

    // TODO: Refactor:
    const prover_output = []
    // all updates from this for loop should be in one singular transcation
    for (let [i, llm_response] of llm_responses.entries()) {
      // I should create a prover-1.reasoning file with the reasoning contents
      const reasoning = llm_response.providerMetadata!.openrouter.reasoning_details
      const usage = llm_response.providerMetadata!.openrouter.usage as OpenRouterUsageAccounting

      // @ts-expect-error
      const model = llm_response.request.body.model as AllowedModelsID

      // TODO: GET TIMES IT TOOK FOR RESPONSE

      prover_output.push(llm_response.object.content)

      await db.transaction(async (tx) => {
        await tx.insert(problem_files)
          .values([
            {
              problem_id,
              file_type: "prover_output",
              file_name: `prover-${i + 1}.output`,
              round: current_round,
              content: llm_response.object.content,
              usage,
            },
            {
              problem_id,
              file_type: "prover_reasoning",
              file_name: `prover-${i + 1}.reasoning`,
              round: current_round,
              content: JSON.stringify(reasoning, null, 2),
            }
          ])
    
          
        await db.insert(llms)
          .values({
            prompt_file_id: prover_prompt_files_ids[i].id,
            response: JSON.stringify({ object: llm_response.object, full: llm_response }, null, 2),
            usage,
            model,
          })
      })

  
    }

    // update phase of run
    await db.update(runs)
      .set({
        phase: "prover_finished",
        updated_at: sql`NOW()`
      })
      .where(eq(runs.id, run_id))


    // send it to verifier
    run_standard_verifier.emit({
      problem_id,
      run_id,
      user_id,
      round: current_round,
      summarizer: new_research.summarizer,
      verifier: new_research.verifier,
      files,
      prover_output
    })
  })

// TODO: better type
type RetrievedBasicFile = {
  file_type: "prover_output" | "verifier_output" | "summarizer_output" | "task" | "notes" | "proofs" | "output",
  round: number,
  content: string,
}

// TODO: better type
type ProverPromptBuidingRequiredFiles = {
  main_files: RetrievedBasicFile[],
  previous_verifier_output: RetrievedBasicFile[],
  all_previous_summarizer_outputs: RetrievedBasicFile[],
}

// TODO: The ???? optional not really in zod we will always get
// at least empty string "" from the form
function create_prover_prompt(prompt: string, { main_files, previous_verifier_output, all_previous_summarizer_outputs }: ProverPromptBuidingRequiredFiles, general_advice?: string, advice?: string, ) {
  // TODO: actually this function is going to be more complicated than i anticipated
  // we need to fetch previous verifier, summarizer outputs from previous rounds... or do we?
  // TODO: fetch previous round files
  // BUG: for now just returning raw prompt without advice or anything
  if (general_advice || advice) prompt += "\n\n=== ADVICE ==="
  if (general_advice) prompt += "\n" + general_advice
  if (advice) prompt += "\n" + advice

  if (previous_verifier_output.length === 1) {
    prompt += "\n\n=== VERIFIER OUTPUT FROM PREVIOUS ROUND ==="
    // TODO: porbably need to extract both feedback_md & summary_md
    let parsed_verifier_output = JSON.parse(previous_verifier_output[0].content)
    prompt += "\n## Feedback"
    prompt += parsed_verifier_output.feedback_md
    prompt += "\n## Summary"
    prompt += parsed_verifier_output.summary_md
  }

  if (all_previous_summarizer_outputs.length > 0) {
    prompt += "\n\n=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ==="
    for (let summarizer_output of all_previous_summarizer_outputs) {
      prompt += `\n## Round ${summarizer_output.round}`
      // TODO: probably need to extract from json
      prompt += `\n${JSON.parse(summarizer_output.content).summary}`
    }
  }

  for (let file of main_files) {
    if (file.file_type === "notes") prompt += "\n\n=== NOTES (notes.md) ==="
    else if (file.file_type === "proofs") prompt += "\n\n=== PROOFS (proofs.md) ==="
    else if (file.file_type === "output") prompt += "\n\n=== OVERALL OUTPUTS (output.md) ==="
    else prompt += "\n\n=== TASK ==="
    prompt += "\n" + file.content
  }

  return prompt
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
  // TODO: papers
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
function create_verifier_prompt(prompt: string, files: ProverPromptBuidingRequiredFiles, prover_output: string[], advice?: string, ) {
  let prompt_1 = create_prover_prompt(prompt, files, undefined, advice)
  for (let [i, output] of prover_output.entries()) {
    prompt_1 += `\n\n=== PROVER-${i + 1} OUTPUT ===`
    prompt_1 += output
  }
  return prompt_1
}



export const research_jobs = [
  run_standard_research,
  run_standard_verifier,
  run_standard_summarizer,
]