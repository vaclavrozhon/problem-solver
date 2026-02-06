import { z } from "zod"

import { define_job } from "../job_factory"
import { MaxProversPerRound, ModelConfigSchema, ProversPerRound, RoundsPerResearch } from "@shared/types/research"
import { run_manager_agent, run_prover_agents, run_improver_agents, run_verifier_agents, run_notetaker_agent, run_q_agent, run_q_decider_agent } from "./agents"
import { create_new_round, finish_active_round, save_file } from "./utils"

export const run_experimental_research = define_job("start")
  .queue("v2")
  .input(z.object({
    problem_id: z.uuid(),
    rounds: RoundsPerResearch,
    current_round_index: RoundsPerResearch,
    // These should be included only in 1st round of this research
    instructions: z.string().trim(),
    provers: z.array(
      ModelConfigSchema("prover")
    ).min(1).max(MaxProversPerRound),
    verifiers: z.array(
      ModelConfigSchema("verifier")
    ).min(1).max(3),
  }))
  .work(async (data, { db }) => {
    // TODO
    // - save round instructiosn to db
    // - check the problem belongs to the user
    console.log("v2 research started!")
    
    // (0) Create new research round!
    await create_new_round(db, data.problem_id)

    
    // (1) Based on the problem task, generate assignments for provers
    const manager_output = await run_manager_agent({
      db,
      problem_id: data.problem_id,
      instructions: data.instructions,
      // BUG Hardcored VALUE RIGHT NOW
      // prover_count: data.provers.length,
      prover_count: 4,
    })
    
    // (1b) Check for decision – whether to end research or continue
    if (manager_output.decision === "finalize") {
      console.log("RESEARCH WAS COMPLETED!!")
      return
    }
    
    // TODO: Check that we receive as many assigned tasks as there are designated provers! 
    // Should be insdie the manager output because we explicitly give the return type
    // Should just error out instead if mismatched
    
    // (2) Let provers do their magic
    const prover_outputs = await run_prover_agents({
      db,
      problem_id: data.problem_id,
      // We can just send manager output because it will correspond to prover count
      manager_output,
    })
    
    // (3) Let the provers remake their outputs
    const improved_outputs = await run_improver_agents({
      db,
      problem_id: data.problem_id,
      prover_outputs,
    })
    
    // (4) Now let's run verifiers
    const verifier_outputs = await run_verifier_agents({
      db,
      problem_id: data.problem_id,
      improved_outputs,
    })
    // TODO Check that we get enough responses... at least one
    
    // (5) Let's make Notetaker write notes for us
    let new_notes = await run_notetaker_agent({
      db,
      problem_id: data.problem_id,
      additional_instructions: data.instructions,
      improved_outputs,
      verifier_outputs,
    })
    await save_file(db, data.problem_id, "notes", new_notes)
    
    // (6) Let's run Q_Decider and decide whether we write proofs or not
    // TODO/IMPORTANT: Q_Decide will WRITE TODO.md!
    const q_decision = await run_q_decider_agent({
      db,
      problem_id: data.problem_id,
    })
    
    // (6a) update TODO file
    await save_file(db, data.problem_id, "todo", q_decision.new_todo_file)
    
    // (6b) create Proofs update actions
    let blocking_issues = null
    if (q_decision.proofs.length > 0) {
      const q_response = await run_q_agent({
        db,
        problem_id: data.problem_id,
        proof_proposals: q_decision.proofs,
      })
      await save_file(db, data.problem_id, "proofs", q_response.new_proofs_file)
      blocking_issues = q_response.blocking_issues
    }
    console.log("BLOCKING ISSUES", blocking_issues)

    //IMPORTANT:
    //If the architecture changes, be aware, that proofs are NOT stored each round. They are stored only when the get update which by design doesn't have to happen each round.
    
    await finish_active_round(db, data.problem_id)

    if (data.current_round_index !== data.rounds) {
      console.log("Gonna start new round...")
      run_experimental_research.emit({
        ...data,
        current_round_index: data.current_round_index + 1
      })
    } else {
      console.log("bazinga, this was the final round!")
    }
  
    
    console.log("v2 reserach ended")
    
  })

export const experimental_research_jobs = [
  run_experimental_research
]
