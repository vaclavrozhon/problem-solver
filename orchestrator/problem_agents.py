"""
Problem-solving agent functions for the orchestrator system.

This module contains functions for calling AI agents used in problem-solving mode:
- Prover agents that generate mathematical proofs and reasoning
- Verifier agents that check and validate proofs
- Summarizer agents that create round summaries
"""

import os
from pathlib import Path
from typing import Optional

from .models import (
    ProverOutput, VerifierCombinedOutput, SummarizerOutput
)
from .utils import (
    load_prompt, write_status, dump_io, normalize_schema_strict,
    pre_dump_io, dump_failure, enhanced_write_status
)
from .database_integration import get_database_integration, get_current_problem_id
from .papers import read_problem_context, get_paper_text_from_database
from .agents import (
    complete_text, load_previous_response_id, save_response_id, 
    load_prover_focus_prompts, apply_notes_update, apply_proofs_update, 
    apply_output_update, parse_structured_output
)

# Get model configuration from environment
MODEL_PROVER = os.environ.get("OPENAI_MODEL_PROVER", "gpt-5")
MODEL_VERIFIER = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-5")
MODEL_SUMMARIZER = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-5-mini")
TEMPERATURE_PROVER = float(os.environ.get("AR_PROVER_TEMPERATURE", "0.8"))


def call_prover_one(problem_dir: Path, round_idx: int, prover_idx: int, total: int, 
                   prover_config: dict = None, focus_description: str = None,
                   prompt_only: bool = False) -> tuple[str, bool]:
    """Call a single prover agent and return free text."""
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    agent = f"prover-{prover_idx:02d}"
    print(f"  [{agent}] Running (model: {MODEL_PROVER})...")
    
    # Load prompts and context
    system_prompt = load_prompt("prover")
    
    # Apply per-prover configuration
    prover_config = prover_config or {}
    has_calculator = prover_config.get("calculator", False)
    focus_type = prover_config.get("focus", "default")
    
    # Add focus instructions to system prompt
    focus_prompts = load_prover_focus_prompts()
    if focus_type in focus_prompts and focus_prompts[focus_type]["prompt"]:
        system_prompt += "\n\n### Focus Instructions\n" + focus_prompts[focus_type]["prompt"].strip() + "\n"
    
    # Add round-specific focus description if provided
    if focus_description:
        system_prompt += "\n\n### User's Request\n" + focus_description.strip() + "\n"
    
    # Append all papers (description first, then text) at end of prompt
    problem_id = get_current_problem_id()
    papers_block = get_paper_text_from_database(problem_id)
    
    # Prepare tools if calculator access is enabled or retrieval is available
    tools = []
    if has_calculator:
        tools.append({"type": "code_interpreter"})
    if not tools:
        tools = None
            
    problem_context = read_problem_context(problem_dir, include_pdfs=False, file_descriptions="")
    
    # Build user message
    user_parts = [problem_context]
    
    # Add previous rounds' summaries
    for prev_idx in range(1, round_idx):
        summary_file = problem_dir / "runs" / f"round-{prev_idx:04d}" / "summarizer.summary.md"
        if summary_file.exists():
            user_parts.append(f"\n\n=== Round {prev_idx} Summary ===\n")
            user_parts.append(summary_file.read_text(encoding="utf-8"))
    
    # Add verifier feedback from previous round
    if round_idx > 1:
        prev_feedback = problem_dir / "runs" / f"round-{round_idx-1:04d}" / "verifier.feedback.md"
        if prev_feedback.exists():
            user_parts.append(f"\n\n=== Previous Round Feedback ===\n")
            user_parts.append(prev_feedback.read_text(encoding="utf-8"))
    
    user_message = "\n".join(user_parts + (["\n\n=== Papers (text) ===\n", papers_block] if papers_block else []))
    
    # Prover: structured JSON output
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "prover_output",
            "strict": True,
            "schema": normalize_schema_strict(ProverOutput.model_json_schema())
        }
    }
    
    # Load previous response ID for reasoning state preservation
    agent = f"prover-{prover_idx:02d}"
    previous_response_id = load_previous_response_id(problem_dir, round_idx, agent, MODEL_PROVER)
    
    # Pre-dump inputs for debugging failures
    pre_dump_io(round_dir, agent, system_prompt, user_message, MODEL_PROVER)

    # Save prompt to database (prover_prompt) if integration available
    try:
        db_integration = get_database_integration()
        print(f"[PROVER] DB integration present: {bool(db_integration)}")
        if db_integration:
            combined_prompt = f"=== SYSTEM ===\n{system_prompt}\n\n=== USER ===\n{user_message}"
            print(f"[PROVER] Persisting prompt for prover {prover_idx}, round {round_idx} (len={len(combined_prompt)})")
            saved = db_integration.save_prover_prompt(
                round_num=round_idx,
                prover_idx=prover_idx,
                prompt_text=combined_prompt,
                model=MODEL_PROVER
            )
            print(f"📥 PROVER: Prompt persisted to DB: {saved}")
    except Exception as e:
        print(f"⚠️  PROVER: Failed to persist prompt to DB: {e}")

    # If only prompts should be saved, stop here
    if prompt_only:
        return "", True
    
    try:
        # Call the model (free-text)
        response_text, duration, response_id, usage, raw_response = complete_text(
            MODEL_PROVER, system_prompt, user_message,
            response_format=response_format,
            temperature=TEMPERATURE_PROVER,
            previous_response_id=previous_response_id,
            tools=tools
        )
        
        # Save response ID for future rounds
        save_response_id(problem_dir, round_idx, agent, response_id, MODEL_PROVER)
        
        # Parse response with retry logic  
        response_obj = parse_structured_output(
            ProverOutput, response_text, MODEL_PROVER,
            system_prompt, user_message, response_format
        )
        
        # Save outputs
        dump_io(round_dir, agent, system_prompt, user_message,
                response_text, response_obj, duration, MODEL_PROVER, usage=usage, raw_response=raw_response)
        
    except Exception as e:
        # Dump failure state with enhanced error context
        dump_failure(round_dir, agent, system_prompt, user_message, str(e), MODEL_PROVER)
        
        print(f"  [{agent}] FAILED: {e}")
        print(f"  [{agent}] Creating dummy response to allow process to continue...")
        
        # Create a dummy ProverOutput with error information
        error_message = f"ERROR: {agent} failed with: {str(e)}\n\nThis prover timed out or encountered an error. The verifier should note this failure and work with other available prover outputs."
        response_obj = ProverOutput(content=error_message)
        
        # Log the dummy response
        try:
            (round_dir / f"{agent}.text.txt").write_text(error_message, encoding="utf-8")
            
            # Create a basic dump for the failed prover
            dump_io(round_dir, agent, system_prompt, user_message,
                    error_message, response_obj, 0.0, MODEL_PROVER, 
                    usage={"input_tokens": 0, "output_tokens": 0}, 
                    raw_response={"error": str(e)})
        except Exception as dump_error:
            print(f"  [{agent}] Warning: Could not save dummy response: {dump_error}")
        
        # Return dummy content so the process can continue (content, success_flag)
        return error_message, False
    
    # Save prover output as text for verifier/UI (from JSON content) and return it
    (round_dir / f"{agent}.text.txt").write_text(response_obj.content or "", encoding="utf-8")

    # Save to database if integration is available
    print(f"🔍 PROVER: Checking database integration...")
    db_integration = get_database_integration()
    if db_integration:
        print(f"✅ PROVER: Database integration found, saving prover {prover_idx} output...")
        success = db_integration.save_prover_output(
            round_num=round_idx,
            prover_idx=prover_idx,
            content=response_obj.content or "",
            model=MODEL_PROVER,
            tokens_in=getattr(response_obj, 'usage', {}).get('prompt_tokens'),
            tokens_out=getattr(response_obj, 'usage', {}).get('completion_tokens')
        )
        print(f"📊 PROVER: Database save result: {success}")
    else:
        print(f"❌ PROVER: No database integration available!")

    return response_obj.content or "", True


def call_verifier_combined(problem_dir: Path, round_idx: int, num_provers: int, focus_description: str = None) -> VerifierCombinedOutput:
    """Call verifier for multiple provers."""
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    
    write_status(problem_dir, "verifier", round_idx)
    print(f"  [verifier] Running (model: {MODEL_VERIFIER})...")
    
    # Load prompts and context
    system_prompt = load_prompt("verifier")
    
    # Add round-specific focus description if provided
    if focus_description:
        system_prompt += "\n\n### User's Request\n" + focus_description.strip() + "\n"
    
    problem_context = read_problem_context(problem_dir, include_pdfs=False)
    
    # Build user message
    user_parts = [problem_context]
    
    # Add all provers' outputs
    for prover_idx in range(1, num_provers + 1):
        prover_file = round_dir / f"prover-{prover_idx:02d}.text.txt"
        if prover_file.exists():
            user_parts.append(f"\n\n=== Prover {prover_idx} Output ===\n")
            user_parts.append(prover_file.read_text(encoding="utf-8"))
    
    # Append all papers (text + descriptions)
    problem_id = get_current_problem_id()
    papers_block = get_paper_text_from_database(problem_id)
    user_message = "\n".join(user_parts + (["\n\n=== Papers (text) ===\n", papers_block] if papers_block else []))
    
    # Prepare response format
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "verifier_combined_output",
            "strict": True,
            "schema": normalize_schema_strict(VerifierCombinedOutput.model_json_schema())
        }
    }
    
    # Load previous response ID for reasoning state preservation
    previous_response_id = load_previous_response_id(problem_dir, round_idx, "verifier", MODEL_VERIFIER)
    
    # Pre-dump inputs for debugging failures
    pre_dump_io(round_dir, "verifier", system_prompt, user_message, MODEL_VERIFIER)
    
    try:
        # Call the model
        response_text, duration, response_id, usage, raw_response = complete_text(
            MODEL_VERIFIER, system_prompt, user_message,
            response_format=response_format,
            previous_response_id=previous_response_id
        )
        
        # Save response ID for future rounds
        save_response_id(problem_dir, round_idx, "verifier", response_id, MODEL_VERIFIER)
        
        # Parse response with retry logic  
        response_obj = parse_structured_output(
            VerifierCombinedOutput, response_text, MODEL_VERIFIER,
            system_prompt, user_message, response_format
        )
        
        # Save outputs
        dump_io(round_dir, "verifier", system_prompt, user_message,
                response_text, response_obj, duration, MODEL_VERIFIER, usage=usage, raw_response=raw_response)
                
    except Exception as e:
        # Dump failure state with enhanced error context
        dump_failure(round_dir, "verifier", system_prompt, user_message, str(e), MODEL_VERIFIER)
        
        # Update status with enhanced error information
        enhanced_write_status(
            problem_dir, "idle", round_idx,
            error_component="verifier",
            error_phase="verifier_execution", 
            error=str(e)
        )
        
        print(f"  [verifier] FAILED: {e}")
        raise
    
    # Save individual outputs
    (round_dir / "verifier.feedback.md").write_text(
        response_obj.feedback_md, encoding="utf-8"
    )
    (round_dir / "verifier.summary.md").write_text(
        response_obj.summary_md, encoding="utf-8"
    )

    # Save to database if integration is available
    print(f"🔍 VERIFIER: Checking database integration...")
    db_integration = get_database_integration()
    if db_integration:
        print(f"✅ VERIFIER: Database integration found, saving verifier output...")
        verdict_data = {
            'verdict': response_obj.verdict,
            'feedback_md': response_obj.feedback_md,
            'summary_md': response_obj.summary_md
        }
        success = db_integration.save_verifier_output(
            round_num=round_idx,
            feedback=response_obj.feedback_md,
            summary=response_obj.summary_md,
            verdict_data=verdict_data,
            model=MODEL_VERIFIER
        )
        print(f"📊 VERIFIER: Database save result: {success}")
    else:
        print(f"❌ VERIFIER: No database integration available!")
    
    # Apply file updates from verifier
    if response_obj.notes_update:
        apply_notes_update(problem_dir, response_obj.notes_update, round_idx)
        print(f"  [verifier] Updated notes.md ({response_obj.notes_update.action})")
    
    if response_obj.proofs_update:
        apply_proofs_update(problem_dir, response_obj.proofs_update, round_idx)
        print(f"  [verifier] Updated proofs.md ({response_obj.proofs_update.action})")
    
    if response_obj.output_update:
        apply_output_update(problem_dir, response_obj.output_update, round_idx)
        print(f"  [verifier] Updated output.md ({response_obj.output_update.action})")
    
    print(f"  [verifier] Complete ({duration:.1f}s)")
    return response_obj


def call_summarizer(problem_dir: Path, round_idx: int) -> SummarizerOutput:
    """Call summarizer agent."""
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    
    write_status(problem_dir, "summarizer", round_idx)
    print(f"  [summarizer] Running (model: {MODEL_SUMMARIZER})...")
    
    # Load prompts and context
    system_prompt = load_prompt("summarizer")
    problem_context = read_problem_context(problem_dir, include_pdfs=False)
    
    # Build user message
    user_parts = [problem_context]
    
    # Add verifier summary
    verifier_summary = round_dir / "verifier.summary.md"
    if verifier_summary.exists():
        user_parts.append("\n\n=== Verifier Summary ===\n")
        user_parts.append(verifier_summary.read_text(encoding="utf-8"))
    
    # Add current state of 3-tier files for context
    notes_file = problem_dir / "notes.md"
    if notes_file.exists():
        user_parts.append("\n\n=== Current Notes ===\n")
        user_parts.append(notes_file.read_text(encoding="utf-8"))
        
    proofs_file = problem_dir / "proofs.md" 
    if proofs_file.exists():
        user_parts.append("\n\n=== Current Proofs ===\n")
        user_parts.append(proofs_file.read_text(encoding="utf-8"))
        
    output_file = problem_dir / "output.md"
    if output_file.exists():
        user_parts.append("\n\n=== Current Output ===\n")
        user_parts.append(output_file.read_text(encoding="utf-8"))
    
    problem_id = get_current_problem_id()
    papers_block = get_paper_text_from_database(problem_id)
    user_message = "\n".join(user_parts + (["\n\n=== Papers (text) ===\n", papers_block] if papers_block else []))
    
    # Prepare response format
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "summarizer_output",
            "strict": True,
            "schema": normalize_schema_strict(SummarizerOutput.model_json_schema())
        }
    }
    
    # Load previous response ID for reasoning state preservation
    previous_response_id = load_previous_response_id(problem_dir, round_idx, "summarizer", MODEL_SUMMARIZER)
    
    # Pre-dump inputs for debugging failures
    pre_dump_io(round_dir, "summarizer", system_prompt, user_message, MODEL_SUMMARIZER)
    
    try:
        # Call the model
        response_text, duration, response_id, usage, raw_response = complete_text(
            MODEL_SUMMARIZER, system_prompt, user_message,
            response_format=response_format,
            previous_response_id=previous_response_id
        )
        
        # Save response ID for future rounds
        save_response_id(problem_dir, round_idx, "summarizer", response_id, MODEL_SUMMARIZER)
        
        # Parse response with retry logic
        response_obj = parse_structured_output(
            SummarizerOutput, response_text, MODEL_SUMMARIZER,
            system_prompt, user_message, response_format
        )
        
    except Exception as e:
        # Dump failure state with enhanced error context
        dump_failure(round_dir, "summarizer", system_prompt, user_message, str(e), MODEL_SUMMARIZER)
        
        # Update status with enhanced error information
        enhanced_write_status(
            problem_dir, "idle", round_idx,
            error_component="summarizer",
            error_phase="summarizer_execution", 
            error=str(e)
        )
        
        print(f"  [summarizer] FAILED: {e}")
        raise
    
    # Save outputs
    dump_io(round_dir, "summarizer", system_prompt, user_message,
            response_text, response_obj, duration, MODEL_SUMMARIZER, usage=usage, raw_response=raw_response)
    
    # Save summary as text
    (round_dir / "summarizer.summary.md").write_text(
        response_obj.summary_md, encoding="utf-8"
    )

    # Save to database if integration is available
    print(f"🔍 SUMMARIZER: Checking database integration...")
    db_integration = get_database_integration()
    if db_integration:
        print(f"✅ SUMMARIZER: Database integration found, saving summarizer output...")
        success = db_integration.save_summarizer_output(
            round_num=round_idx,
            summary=response_obj.summary_md,
            one_line_summary=response_obj.one_line_summary,
            model=MODEL_SUMMARIZER
        )
        print(f"📊 SUMMARIZER: Database save result: {success}")
    else:
        print(f"❌ SUMMARIZER: No database integration available!")

    print(f"  [summarizer] Complete ({duration:.1f}s)")
    return response_obj