"""
Problem-solving agent functions for the orchestrator system.

This module coordinates prompt construction, optional model invocation,
and persistence for all three roles: prover, verifier, and summarizer.

Design principles
- Single-source prompt construction: Build system/user prompts once and reuse
  the same strings for persistence and model calls to avoid drift.
- Database-first persistence: Persist prompts and outputs to the database so
  the UI reflects the exact inputs/outputs used by the system.
- Clear stage flow in each function:
  1) Prompt construction
  2) Prompt persistence (DB)
  3) Optional model call
  4) Output persistence (DB)
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
from .database_integration import get_database_integration, get_current_problem_id, get_current_run_id, get_run_parameters
from .prompt_builder import (
    build_common_base_context,
    build_prompt_prover,
    build_prompt_verifier,
    build_prompt_summarizer,
)
from .agents import (
    complete_text, load_previous_response_id, save_response_id, 
    load_prover_focus_prompts, apply_notes_update, apply_proofs_update, 
    apply_output_update, parse_structured_output
)

# Default model configuration from environment (can be overridden per run)
MODEL_PROVER = os.environ.get("OPENAI_MODEL_PROVER", "gpt-5")
MODEL_VERIFIER = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-5")
MODEL_SUMMARIZER = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-5-mini")


def call_prover_one(problem_dir: Path, round_idx: int, prover_idx: int, total: int, 
                   prover_config: dict | None = None, focus_description: str | None = None,
                   prompt_only: bool = False, prebuilt_context: str | None = None) -> tuple[str, bool]:
    """
    Prover stage
    1) Build prompt (system + user) from DB-backed context and config
    2) Persist prompt to DB so the UI can display it immediately
    3) Optionally call the model and persist outputs
    """
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    
    agent = f"prover-{prover_idx:02d}"
    # Determine model for this prover: per-run directive model fallback to env default
    params = get_run_parameters()
    run_prover_directives = params.get('prover_directives') or params.get('prover_configs') or []
    model_override = None
    if isinstance(run_prover_directives, list) and 1 <= prover_idx <= len(run_prover_directives):
        directive = run_prover_directives[prover_idx - 1]
        if isinstance(directive, dict):
            model_override = directive.get('model')
    effective_prover_model = model_override or MODEL_PROVER
    print(f"  [{agent}] Running (model: {effective_prover_model})...")
    
    # 1) PROMPT CONSTRUCTION (single-source)
    base_system = load_prompt("prover")
    prover_config = prover_config or {}
    has_calculator = prover_config.get("calculator", False)
    # Backward-compatible key names: 'focus' or 'directive'
    focus_type = prover_config.get("focus", prover_config.get("directive", "default"))
    focus_prompts = load_prover_focus_prompts()
    system_prompt = base_system
    if focus_type in focus_prompts and focus_prompts[focus_type]["prompt"]:
        system_prompt = system_prompt + "\n\n" + focus_prompts[focus_type]["prompt"].strip()
    problem_id = get_current_problem_id()
    print(f"  [{agent}] Debug: problem_id={problem_id}, focus_type={focus_type}, has_calculator={has_calculator}")
    
    # Prepare tools if calculator access is enabled or retrieval is available
    tools = []
    if has_calculator:
        tools.append({"type": "code_interpreter"})
    if not tools:
        tools = None
            
    # Build DB context, supporting both sync and async environments
    if prebuilt_context is not None:
        db_context = prebuilt_context
    else:
        if isinstance(problem_id, int):
            try:
                import asyncio
                loop = asyncio.get_event_loop()
                db_context = build_common_base_context(problem_id, round_idx)
            except RuntimeError:
                db_context = build_common_base_context(problem_id, round_idx)
        else:
            raise RuntimeError("No problem_id available for DB context")
    user_parts: list[str] = []

    # Load run parameters for user specification and per-prover directives
    params = get_run_parameters()
    run_user_spec = params.get('user_specification') or params.get('focus_description')
    run_prover_directives = params.get('prover_directives') or params.get('prover_configs') or []

    # User specification section (may be empty)
    user_parts.append("=== USER SPECIFICATION ===")
    effective_user_spec = (focus_description or run_user_spec or "").strip() if (focus_description or run_user_spec) else ""
    if effective_user_spec:
        user_parts.append(effective_user_spec)
    else:
        user_parts.append("not applicable")

    # Special instructions section (from config)
    user_parts.append("")
    user_parts.append("=== SPECIAL INSTRUCTIONS ===")
    try:
        special_bits = []
        # Per-prover directive from run parameters, if provided
        if isinstance(run_prover_directives, list) and 1 <= prover_idx <= len(run_prover_directives):
            directive = run_prover_directives[prover_idx - 1]
            if isinstance(directive, dict):
                # Accept either 'focus' or 'directive' text
                directive_text = directive.get('directive') or directive.get('focus') or ""
                if directive_text:
                    special_bits.append(f"directive: {directive_text}")
                # Merge calculator/tool flags from directive if present
                if directive.get('calculator'):
                    special_bits.append("tools: code_interpreter enabled")
            elif isinstance(directive, str) and directive.strip():
                special_bits.append(f"directive: {directive.strip()}")

        # Include current focus type name
        special_bits.append(f"prover_focus: {focus_type}")
        if has_calculator:
            special_bits.append("tools: code_interpreter enabled")
        if effective_user_spec:
            special_bits.append("user_focus: provided")

        user_parts.append("\n".join(special_bits) if special_bits else "not applicable")
    except Exception:
        user_parts.append("not applicable")

    # Append DB context which includes verifier/summarizer/notes/proofs/output/papers/task
    if db_context:
        user_parts.append("")
        user_parts.append(db_context)

    user_message = "\n".join(user_parts).strip()
    
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
    prev_response_id = load_previous_response_id(problem_dir, round_idx, agent, MODEL_PROVER)
    
    # Pre-dump inputs for debugging failures
    pre_dump_io(round_dir, agent, system_prompt, user_message, MODEL_PROVER)
    print(f"  [{agent}] Debug: user_message_len={len(user_message)}, system_len={len(system_prompt)}")

    # 2) PROMPT PERSISTENCE (DB)
    try:
        db_integration = get_database_integration()
        print(f"[PROVER] DB integration present: {bool(db_integration)}")
        if db_integration:
            combined_prompt = f"=== SYSTEM ===\n{system_prompt}\n\n{user_message}"
            print(f"[PROVER] Persisting prompt for prover {prover_idx}, round {round_idx} (len={len(combined_prompt)})")
            saved = db_integration.save_prover_prompt(
                round_num=round_idx,
                prover_idx=prover_idx,
                prompt_text=combined_prompt,
                model=effective_prover_model
            )
            print(f"📥 PROVER: Prompt persisted to DB: {saved}")
    except Exception as e:
        print(f"⚠️  PROVER: Failed to persist prompt to DB: {e}")

    # If prompt-only, end after persistence
    if prompt_only:
        return "", True
    
    try:
        # Call the model (free-text)
        response_text, duration, response_id, usage, raw_response = complete_text(
            effective_prover_model, system_prompt, user_message,
            response_format=response_format,
            previous_response_id=prev_response_id,
            tools=tools
        )
        # Raw response will be saved via db_integration.save_prover_output below
        
        # Save response ID for future rounds (DB-backed)
        if response_id:
            save_response_id(problem_dir, round_idx, agent, response_id, effective_prover_model)
        
        # Parse response with retry logic  
        response_obj = parse_structured_output(
            ProverOutput, response_text, effective_prover_model,
            system_prompt, user_message, response_format
        )
        
        # Log only; DB persistence handled below
        dump_io(round_dir, agent, system_prompt, user_message,
                response_text, response_obj, duration, effective_prover_model, usage=usage, raw_response=raw_response)
        
    except Exception as e:
        # Dump failure state with enhanced error context
        dump_failure(round_dir, agent, system_prompt, user_message, str(e), MODEL_PROVER)
        
        print(f"  [{agent}] FAILED: {e}")
        print(f"  [{agent}] Creating dummy response to allow process to continue...")
        
        # Create a dummy ProverOutput with error information
        error_message = f"ERROR: {agent} failed with: {str(e)}\n\nThis prover timed out or encountered an error. The verifier should note this failure and work with other available prover outputs."
        response_obj = ProverOutput(content=error_message)
        
        # Log the dummy response
        dump_io(round_dir, agent, system_prompt, user_message,
                error_message, response_obj, 0.0, effective_prover_model, 
                usage={"input_tokens": 0, "output_tokens": 0}, 
                raw_response={"error": str(e)})
        
        # Return dummy content so the process can continue (content, success_flag)
        return error_message, False
    
    # No local writes; output is saved to DB below

    # Save to database if integration is available
    print(f"🔍 PROVER: Checking database integration...")
    db_integration = get_database_integration()
    if db_integration:
        print(f"✅ PROVER: Database integration found, saving prover {prover_idx} output...")
        success = db_integration.save_prover_output(
            round_num=round_idx,
            prover_idx=prover_idx,
            content=response_obj.content or "",
            model=effective_prover_model,
            tokens_in=getattr(response_obj, 'usage', {}).get('prompt_tokens'),
            tokens_out=getattr(response_obj, 'usage', {}).get('completion_tokens'),
            raw_response=raw_response
        )
        print(f"📊 PROVER: Database save result: {success}")
    else:
        print(f"❌ PROVER: No database integration available!")

    return response_obj.content or "", True


def call_verifier_combined(problem_dir: Path, round_idx: int, num_provers: int, focus_description: str | None = None) -> VerifierCombinedOutput:
    """
    Verifier stage
    1) Build prompt (system + user) with current round context and all prover outputs
    2) Call the verifier model and parse the structured output
    3) Persist feedback/summary to DB and update local files for traceability
    """
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    
    write_status(problem_dir, "verifier", round_idx)
    print(f"  [verifier] Running (model: {MODEL_VERIFIER})...")
    
    # 1) PROMPT CONSTRUCTION (use centralized builder to avoid drift)
    problem_id = get_current_problem_id()
    if not isinstance(problem_id, int):
        raise RuntimeError("No problem_id available for DB context")
    system_prompt, user_message = build_prompt_verifier(problem_id, round_idx, focus_description)
    
    # 2) MODEL INVOCATION
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
    
    # Determine verifier model from run parameters override (do this early so we can persist prompt with model)
    params = get_run_parameters()
    verifier_conf = params.get('verifier_config') or {}
    verifier_model = (verifier_conf.get('model') if isinstance(verifier_conf, dict) else None) or MODEL_VERIFIER

    # Persist prompt to DB for visibility
    try:
        db_integration = get_database_integration()
        if db_integration:
            combined_prompt = f"=== SYSTEM ===\n{system_prompt}\n\n{user_message}"
            db_integration.save_verifier_prompt(
                round_num=round_idx,
                prompt_text=combined_prompt,
                model=verifier_model,
            )
    except Exception:
        pass

    # Pre-dump inputs for debugging failures
    pre_dump_io(round_dir, "verifier", system_prompt, user_message, MODEL_VERIFIER)
    
    try:
        # Call the model
        response_text, duration, response_id, usage, raw_response = complete_text(
                verifier_model, system_prompt, user_message,
                response_format=response_format,
                previous_response_id=previous_response_id
            )
        # Raw response saved via db_integration.save_verifier_output below
        
        # Save response ID for future rounds
        if response_id:
            save_response_id(problem_dir, round_idx, "verifier", response_id, verifier_model)
        
        # Parse response with retry logic  
        response_obj = parse_structured_output(
            VerifierCombinedOutput, response_text, verifier_model,
            system_prompt, user_message, response_format
        )
        
        # 3) LOCAL PERSISTENCE OF INTERMEDIATE OUTPUTS
        dump_io(round_dir, "verifier", system_prompt, user_message,
                response_text, response_obj, duration, verifier_model, usage=usage, raw_response=raw_response)
                
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
    
    # No local writes; all persistence via DB below

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
            model=MODEL_VERIFIER,
            raw_response=raw_response
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
    """
    Summarizer stage
    1) Build prompt (system + user) including current state of 3-tier files and verifier summary
    2) Call the summarizer model and parse structured output
    3) Persist summary to DB
    """
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    
    write_status(problem_dir, "summarizer", round_idx)
    print(f"  [summarizer] Running (model: {MODEL_SUMMARIZER})...")
    
    # 1) PROMPT CONSTRUCTION (use centralized builder)
    problem_id = get_current_problem_id()
    if not isinstance(problem_id, int):
        raise RuntimeError("No problem_id available for DB context")
    system_prompt, user_message = build_prompt_summarizer(problem_id, round_idx)
    
    # Persist prompt to DB for visibility
    try:
        db_integration = get_database_integration()
        if db_integration:
            # Choose model for prompt metadata
            params = get_run_parameters()
            summarizer_model_for_prompt = params.get('summarizer_model') or MODEL_SUMMARIZER
            combined_prompt = f"=== SYSTEM ===\n{system_prompt}\n\n{user_message}"
            db_integration.save_summarizer_prompt(
                round_num=round_idx,
                prompt_text=combined_prompt,
                model=summarizer_model_for_prompt,
            )
    except Exception:
        pass

    # 2) MODEL INVOCATION
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
        # Select summarizer model from run params override
        params = get_run_parameters()
        summarizer_model = params.get('summarizer_model') or MODEL_SUMMARIZER
        response_text, duration, response_id, usage, raw_response = complete_text(
                summarizer_model, system_prompt, user_message,
                response_format=response_format,
                previous_response_id=previous_response_id
            )
        # Immediately persist RAW summarizer response
        try:
            dbi = get_database_integration()
            if dbi and dbi.db_client and isinstance(problem_id, int) and raw_response is not None:
                import asyncio, json
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                from .database_integration import DatabaseService as _DS  # type: ignore
                loop.run_until_complete(_DS.create_problem_file(  # type: ignore
                    db=dbi.db_client,
                    problem_id=problem_id,
                    round_num=round_idx,
                    file_type="summarizer_raw",
                    filename="summarizer.response.full.json",
                    content=json.dumps(raw_response, indent=2),
                    metadata={"model": summarizer_model}
                ))
                try:
                    loop.close()
                except Exception:
                    pass
        except Exception:
            pass
        
        # Save response ID for future rounds
        if response_id:
            save_response_id(problem_dir, round_idx, "summarizer", response_id, summarizer_model)
        
        # Parse response with retry logic
        response_obj = parse_structured_output(
            SummarizerOutput, response_text, summarizer_model,
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
    
    # 3) LOCAL PERSISTENCE OF INTERMEDIATE OUTPUTS
    dump_io(round_dir, "summarizer", system_prompt, user_message,
            response_text, response_obj, duration, summarizer_model, usage=usage, raw_response=raw_response)
    
    # No local summary writes; saved to DB below

    # Save to database if integration is available
    print(f"🔍 SUMMARIZER: Checking database integration...")
    db_integration = get_database_integration()
    if db_integration:
        print(f"✅ SUMMARIZER: Database integration found, saving summarizer output...")
        success = db_integration.save_summarizer_output(
            round_num=round_idx,
            summary=response_obj.summary_md,
            one_line_summary=response_obj.one_line_summary,
            model=summarizer_model,
            raw_response=raw_response
        )
        print(f"📊 SUMMARIZER: Database save result: {success}")
    else:
        print(f"❌ SUMMARIZER: No database integration available!")

    print(f"  [summarizer] Complete ({duration:.1f}s)")
    return response_obj