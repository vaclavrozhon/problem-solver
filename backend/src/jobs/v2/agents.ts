import { z } from "zod"

import type { DbOrTx } from "../research_utils"
import { choose_model } from "@shared/types/research"
import { generate_llm_response, LLMTextResponse, LLMTextSuccessResponse } from "../generate_llm_response"
import { get_main_problem_files } from "./utils"

import PROMPTS from "@shared/prompts/v2"
import { ResponseFormatJSONObject$outboundSchema } from "@openrouter/sdk/models"

/**
 * MANAGER AGENT
 */
export async function run_manager_agent(
  {
    db,
    problem_id,
    prover_count,
    instructions,
  }: {
    db: DbOrTx,
    problem_id: string,
    instructions: string,
    /** BUG: At least 1 prover required */
    prover_count: number,
  }
) {
  const { problem_task, todo_file, notes_file, proofs_file } = await get_main_problem_files(db, problem_id)

  const user_prompt = PROMPTS.MANAGER.USER
    .replace("{NUMBER_OF_PROVERS}", String(prover_count))
    .replace("{TODO_FILE_CONTENT}", todo_file)
    .replace("{NOTES_FILE_CONTENT}", notes_file)
    .replace("{PROOFS_FILE_CONTENT}", proofs_file)
    // `replaceAll` because these are included twice in the prompt
    .replaceAll("{PROBLEM_TASK}", problem_task)
    .replaceAll("{ADDITIONAL_INSTRUCTIONS}", instructions)
  console.log("MANAGER_USER_PROMPT", user_prompt)
  
  const manager_response = await generate_llm_response({
    db,
    context: "Manager",
    model: choose_model("google/gemini-3-pro-preview", {
      reasoning_effort: "high",
      web_search: false,
    }, "manager"),    
    messages: [
      {
        role: "system",
        content: PROMPTS.MANAGER.SYSTEM,
      },
      {
        role: "user",
        content: user_prompt,
      }
    ],
    schema: z.object({
      decision: z.union([
        z.literal("finalize")
          .describe("Choose this option if research is finished."),
        z.literal("assign_tasks")
          .describe("Choose this option if more work needs to be done."),
      ]).describe("Decision whether research is complete or requires more work."),
      task_assignments: z.array(
        z.object({
          prover_index: z.coerce.number().min(1).max(prover_count)
            .describe("Index of prover to keep track of which prover is assigned what task."),
          prover_task: z.string().trim().nonempty()
            .describe("A verbose description of a research task for this prover.")
        }).describe("List of reserach tasks for each prover.")
      ).describe("List of task assignments for each prover."),
      finalize_report: z.union([
        z.string().describe("Choose this option if research is finalized. Then it should explain why it is finished and a verbose summary of the final soution."),
        z.null().describe("Choose this option if the research still requires more work to be done.")
      ]).describe("Either a report summary of final reseach answer or `null` if research still requires work.")
    }),

    user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
    // TODO these 2 properties need to be changed before [PROD]
    save_to_db: false,
    prompt_file_id: "BUG-no-id",
  })
  if (!manager_response.success) throw manager_response.error
  const { output } = manager_response
  
  // TODO: Need to do check that the prover count (with index) is correct... maybe in the future if not required, we could drop the prover indexing and just let it generate the assignments
  // TODO: Also, let's do just simple checks that for the given decision, the structure is okay.
  if (output.decision === "finalize" && output.task_assignments.length === 0 && output.finalize_report) return output as unknown as {
    decision: "finalize",
    task_assignments: null,
    finalize_report: string,
  }
  if (output.decision === "assign_tasks" && output.task_assignments.length > 0 && output.finalize_report === null) return output as {
    decision: "assign_tasks",
    task_assignments: {
      prover_index: number,
      prover_task: string,
    }[],
    finalize_report: null,
  }
  throw new Error("TODO Schema failed!")
}

export async function run_prover_agents(
  {
    db,
    problem_id,
    manager_output,
  }: {
    db: DbOrTx,
    problem_id: string,
    manager_output: {
      decision: "assign_tasks",
      task_assignments: {
        prover_index: number,
        prover_task: string,
      }[],
      finalize_report: null,
    },
  }
) {
  const { problem_task, notes_file, proofs_file } = await get_main_problem_files(db, problem_id)
  function build_prover_prompt(task: string) {
    const initial_prompt = PROMPTS.PROVER.USER
    return initial_prompt
      .replace("{NOTES_FILE_CONTENT}", notes_file)
      .replace("{PROOFS_FILE_CONTENT}", proofs_file)
      .replaceAll("{PROBLEM_TASK}", problem_task)
      .replaceAll("{ASSIGNED_TASK}", task)
  }
  console.log("PROVER_PROMPT_0", build_prover_prompt(manager_output.task_assignments[0].prover_task))
  const prover_requests = manager_output.task_assignments
    .map((task, i) => generate_llm_response({
      db,
      context: `Prover ${i + 1}`,
      model: choose_model("openai/gpt-5.2", {
        reasoning_effort: "high",
        web_search: false,
      }, "prover"),
      messages: [
        {
          role: "system",
          content: PROMPTS.PROVER.SYSTEM,
        },
        {
          role: "user",
          content: build_prover_prompt(task.prover_task),
        }
      ],
      
      user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
      save_to_db: false,
      prompt_file_id: "BUG-no-id"
    }))
  const prover_responses = await Promise.all(prover_requests)
  
  // TODO/BUG: Filter out successful/failed LLM calls
  // report on the failed calls
  // TODO: rework this mess
  const successful_responses = prover_responses
    .map((response, i) => ({
      response,
      task: manager_output.task_assignments[i].prover_task
    }))
    .filter(
      (item): item is {
        response: Extract<LLMTextResponse, { success: true }>,
        task: string
      } => item.response.success === true)
    .map(item => ({
      draft_output: item.response.output,
      task: item.task,
    }))
  
  return successful_responses
}

export async function run_improver_agents(
  {
    db,
    problem_id,
    prover_outputs,
  } : {
    db: DbOrTx,
    problem_id: string,
    prover_outputs: {
      draft_output: string,
      task: string,
    }[],
  }
) {
  const { problem_task, notes_file, proofs_file } = await get_main_problem_files(db, problem_id)
  function build_improver_prompt(output: {
    draft_output: string,
    task: string,
  }) {
    return PROMPTS.IMPROVER.USER
      .replace("{NOTES_FILE_CONTENT}", notes_file)
      .replace("{PROOFS_FILE_CONTENT}", proofs_file)
      .replace("{DRAFT_FILE_CONTENT}", output.draft_output)
      .replaceAll("{PROBLEM_TASK}", problem_task)
      .replaceAll("{ASSIGNED_TASK}", output.task)
  }
  console.log("IMPROVER_PROMPT_0", build_improver_prompt(prover_outputs[0]))
  const improver_requests = prover_outputs.map((output, i) => generate_llm_response({
    db,
    context: `Improver ${i}`,
    model: choose_model("google/gemini-3-pro-preview", {
      reasoning_effort: "high",
      web_search: false,
    }, "prover"),
    messages: [
      {
        role: "system",
        content: PROMPTS.IMPROVER.SYSTEM,
      },
      {
        role: "user",
        content: build_improver_prompt(output),
      }
    ],
    
    user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
    save_to_db: false,
    prompt_file_id: "BUG-no-id"
  }))
  
  const improver_responses = await Promise.all(improver_requests)
  
  // TODO/BUG: Filter out successful/failed LLM calls
  // report on the failed calls
  // TODO: rework this mess
  const successful_responses = improver_responses
    .map((response, i) => ({
      response,
      task: prover_outputs[i].task,
    }))
    .filter(
      (item): item is {
        response: Extract<LLMTextResponse, { success: true }>,
        task: string
      } => item.response.success === true)
    .map(item => ({
      improver_output: item.response.output,
      task: item.task,
    }))
  
  return successful_responses
}

export async function run_verifier_agents(
  {
    db,
    problem_id,
    improved_outputs,
  }: {
    db: DbOrTx,
    problem_id: string,
    improved_outputs: {
      improver_output: string,
      task: string,
    }[],
  }
) {
  const { problem_task, notes_file, proofs_file } = await get_main_problem_files(db, problem_id)
  // (1) Build verifier prompt. All verifier agents
  // get the same prompt. (Subject to change
  // if we run out of context)
  const prover_i_output = `
  <input>
    <name>PROVER_I_OUTPUT</name>
    <description>Output of PROVER_I's attempt of solving the assigned task.</description>
    <assigned_task>{PROVER_I_ASSIGNED_TASK}</assigned_task>
    <value>{PROVER_I_OUTPUT}</value>
  </input>`
  const verifier_user_prompt = PROMPTS.VERIFIER.USER
    .replace("{PROBLEM_TASK}", problem_task)
    .replace("{NOTES_FILE_CONTENT}", notes_file)
    .replace("{PROOFS_FILE_CONTENT}", proofs_file)
    .replace(
      "{LIST_OF_PROVER_OUTPUTS}",
      improved_outputs.map((output, i) => prover_i_output
        // BUG: This could be done better
        .replaceAll("PROVER_I", `PROVER_${i+1}`)
        .replace(`{PROVER_${i+1}_ASSIGNED_TASK}`, output.task)
        .replace(`{PROVER_${i+1}_OUTPUT}`, output.improver_output)
      ).join("\n\n")
    )
  console.log("VERIFIER_USER_PROMPT", verifier_user_prompt)
  
  // QUESTION/TODO: How many verifier agents do we require?
  // Do we want to scale it depending on prover agents?
  // For now, let's go with 2 verifiers!
  const verifier_requests = [0, 1].map(i => generate_llm_response({
    db,
    context: `Verifier ${i + 1}`,
    model: choose_model("google/gemini-3-pro-preview", {
      reasoning_effort: "high",
      web_search: false,
    }, "verifier"),
    messages: [
      {
        role: "system",
        content: PROMPTS.VERIFIER.SYSTEM,
      },
      {
        role: "user",
        content: verifier_user_prompt
      }
    ],
    
    user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
    save_to_db: false,
    prompt_file_id: "BUG-no-id",
  }))

  const verifier_responses = await Promise.all(verifier_requests)
  
  // TODO/BUG: Filter out successful/failed LLM calls
  // report on the failed calls
  // TODO: rework this mess
  const successful_responses = verifier_responses
    .filter(
      (response): response is  Extract<LLMTextResponse, { success: true }> => response.success === true)
    .map(response => response.output)
  
  return successful_responses
  
}

export async function run_notetaker_agent(
  {
    db,
    problem_id,
    additional_instructions,
    verifier_outputs,
    improved_outputs,
  } : {
    db: DbOrTx,
    problem_id: string,
    additional_instructions: string,
    verifier_outputs: string[],
    improved_outputs: {
      improver_output: string,
      task: string,
    }[]
  }
) {
  const { problem_task, notes_file } = await get_main_problem_files(db, problem_id)
  const prover_i_output = `
  <input>
    <name>PROVER_I_OUTPUT</name>
    <description>Output of PROVER_I's attempt of solving the assigned task.</description>
    <assigned_task>{PROVER_I_ASSIGNED_TASK}</assigned_task>
    <value>{PROVER_I_OUTPUT}</value>
  </input>`
  // IMPORTANT NOTE: if we decide to split provers outputs among
  // verifiers, each verfieri could get something like
  // <list_of_analyzed_provers>1,2,...</...>
  const verifier_i_output = `
  <input>
    <name>VERIFIER_I_OUTPUT</name>
    <description>Output of VERIFIER_I's analysis/feedback of presented prover outputs</description>
    <value>{VERIFIER_I_OUTPUT}</value>
  </input>`
  const notetaker_user_prompt = PROMPTS.NOTETAKER.USER
    .replace("{PROBLEM_TASK}", problem_task)
    .replace("{ADDITIONAL_INSTRUCTIONS}", additional_instructions)
    .replace("{NOTES_FILE_CONTENT}", notes_file)
    .replace(
      "{LIST_OF_PROVER_OUTPUTS}",
      improved_outputs.map((output, i) => prover_i_output
        // BUG: This could be done better
        .replaceAll("PROVER_I", `PROVER_${i+1}`)
        .replace(`{PROVER_${i+1}_ASSIGNED_TASK}`, output.task)
        .replace(`{PROVER_${i+1}_OUTPUT}`, output.improver_output)
      ).join("\n\n")
    )
    .replace(
      "{LIST_OF_VERIFIER_OUTPUTS}",
      verifier_outputs.map((verifier_output, i) => verifier_i_output
        .replaceAll("VERIFIER_I", `VERIFIER_${i+1}`)
        .replace(`{VERIFIER_${i+1}_OUTPUT}`, verifier_output)
      ).join("\n\n")
    )
  console.log("NOTETAKER_USER_PROMPT", notetaker_user_prompt)

  const notetaker_response = await generate_llm_response({
    db,
    context: "Notetaker",
    model: choose_model("openai/gpt-5.2", {
      reasoning_effort: "high",
      web_search: false,
    }, "verifier"),
    messages: [
      {
        role: "system",
        content: PROMPTS.NOTETAKER.SYSTEM,
      },
      {
        role: "user",
        content: notetaker_user_prompt,
      },
    ],
    // NOTE: This must be an object, becuase eg OpenAI
    // dislieks JSON arrays as structured outputs
    schema: z.object({
      note_actions: z.array(
        z.object({
          type: z.enum(["replace", "append", "patch"])
            .describe("Action to edit the `NOTES.md` file with ne wcontents."),
          old_value: z.xor([
            z.null().describe("Choose `null` only if action is NOT  `type=patch`."),
            z.string().describe("Choose `string` with old value of the file to be later replaced only if action is of `type=patch`"),
          ]),
          content: z.string()
            .describe("Content of how the `NOTES.md` file should be edited."),
        }).describe("Action for editing `NOTES.md` file.")
      ).describe("List of actions for editing `NOTES.md` file with."),
    }).describe("Expected object containing note editing actions"),
    
    save_to_db: false,
    user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
    prompt_file_id: "BUG-no-id",
  })
  
  if (!notetaker_response.success) throw new Error("TODO/BUG FAILED")
  
  let new_notes = notes_file
  for (let action of notetaker_response.output.note_actions) {
    if (action.type === "replace") new_notes = action.content
    if (action.type === "append") new_notes += action.content
    if (action.type === "patch" && action.old_value) {
      new_notes = new_notes.replace(action.old_value, action.content)
    }
  }
  
  console.log("NOTETAKER_OUTPUT_ACTIONS", notetaker_response.output)
  
  return new_notes
}

export async function run_q_decider_agent(
  {
    db,
    problem_id,
  }: {
    db: DbOrTx,
    problem_id: string,
  }
) {
  const { problem_task, todo_file, notes_file, proofs_file } = await get_main_problem_files(db, problem_id)
  const q_decider_user_prompt = PROMPTS.Q_DECIDER.USER
    .replace("{TODO_FILE_CONTENT}", todo_file)
    .replace("{PROOFS_FILE_CONTENT}", proofs_file)
    .replace("{NOTES_FILE_CONTENT}", notes_file)
    .replaceAll("{PROBLEM_TASK}", problem_task)
  console.log("Q_DECIDER_USER_PROMPT", q_decider_user_prompt)

  const q_decider_response = await generate_llm_response({
    db,
    context: "Q_Decider",
    model: choose_model("google/gemini-3-pro-preview", {
      reasoning_effort: "high",
      web_search: false,
    }, "verifier"), // bug verifier incorrect
    messages: [
      {
        role: "system",
        content: PROMPTS.Q_DECIDER.SYSTEM,
      },
      {
        role: "user",
        content: q_decider_user_prompt
      },
    ],
    schema: z.object({
      todo_list: z.array(
        z.object({
          type: z.enum(["add", "remove"])
            .describe("Type of action to edit the `TODO.md` file."),
          value: z.string()
            .describe("Which item should this action be applied to? Needs to be perfect string match."),
        }).describe("Action for modifying `TODO.md` file")
      ).describe("List of actions modifying `TODO.md` file"),
      proofs: z.array(
        z.object({
          type: z.enum(["write", "update", "remove"])
            .describe("Action type of proposed changes"),
          proof: z.string()
            .describe("Which proof to add, update or remove?")
        }).describe("File update proposal change")
      ).describe("List of proposed improvements for `PROOFS.md` file. If you believe, that the file requires no updates, leave this array EMPTY.")
    }).describe("JSON object of actions grouped by file"),
    
    // BUGS
    save_to_db: false,
    user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
    prompt_file_id: "BUG-no-id",
  })
  
  if (!q_decider_response.success) throw new Error("TODO Error")
  
  // Create new TODO file
  let new_todo_file = todo_file
  for (let action of q_decider_response.output.todo_list) {
    if (action.type === "add") {
      new_todo_file += "\n\n - " + action.value
    }
    if (action.type === "remove") {
      new_todo_file = new_todo_file
        .replace("\n\n - " + action.value, "")
        .replace(action.value, "")
    }
  }
  
  console.log("Q_DECIDER_OUTPUT", q_decider_response.output)
  
  return {
    new_todo_file,
    proofs: q_decider_response.output.proofs,
  }
}

export async function run_q_agent(
  {
    db,
    problem_id,
    proof_proposals,
  }: {
    db: DbOrTx,
    problem_id: string,
    proof_proposals: {
      type: "write" | "update" | "remove",
      proof: string,
    }[]
  }
) {
  const { problem_task, notes_file, proofs_file } = await get_main_problem_files(db, problem_id)
  const proof_proposal = `
  <proposal>
    <action_type>{ACTION}</action_type>
    <value>{PROPOSAL}</value>
  </proposal>`
  const q_user_prompt = PROMPTS.Q.USER
    .replace("{NOTES_FILE_CONTENT}", notes_file)
    .replace("{PROOFS_FILE_CONTENT}", proofs_file)
    .replaceAll("{PROBLEM_TASK}", problem_task)
    .replace(
      "{PROOF_PROPOSALS}",
      proof_proposals.map(proposal => proof_proposal
        .replace("{ACTION}", proposal.type)
        .replace("{PROPOSAL}", proposal.proof)
      ).join("\n\n")
    )
  console.log("Q_USER_PROMPT", q_user_prompt)

  const q_response = await generate_llm_response({
    db,
    context: "Q",
    model: choose_model("openai/gpt-5.2", {
      reasoning_effort: "high",
      web_search: false,
    }, "verifier"),
    messages: [
      {
        role: "system",
        content: PROMPTS.Q.SYSTEM,
      },
      {
        role: "user",
        content: q_user_prompt
      },
    ],
    schema: z.object({
      proofs_actions: z.array(
        z.object({
          type: z.enum(["append", "patch"])
            .describe("Type of action to edit `PROOFS.md`"),
          old_value: z.xor([
            z.null().describe("Choose `null` if `type=append`."),
            z.string().describe("Choose `string` and set its value to the content you want patched if `type=patch`"),
          ]),
          value: z.string()
            .describe("Either new value for patching the file `PROOFS.md` if `type=patch` or what should be appended to `type=append`"),
        }).describe("Action to modify `PROOFS.md`")
      ).describe("List of actions modifying `PROOFS.md`"),
      blocking_issues: z.array(
        z.string().describe("What went wrong while trying to write down a proof?")
      ).describe("List of fitting and accurate descriptions of what failed, what's blocking writing down the proofs and why.")
    }),
    
    // BUGs
    save_to_db: false,
    user_id: "5437f822-f7b1-4e6a-ba56-ee0227592d4d",
    prompt_file_id: "BUG-no-id",
  })
  
  if (!q_response.success) throw new Error("TODO Error")
  
  let new_proofs_file = proofs_file
  for (let action of q_response.output.proofs_actions) {
    if (action.type === "append") new_proofs_file += action.value
    if (action.type === "patch" && action.old_value) {
      new_proofs_file = new_proofs_file
        .replace(action.old_value, action.value)
    }
  }
  
  console.log("Q_OUTPUT", q_response.output)
  
  return {
    new_proofs_file,
    blocking_issues: q_response.output.blocking_issues,
  }
}
