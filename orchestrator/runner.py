"""
Round execution logic for the orchestrator system.

This module contains the main functions for running research and paper writing rounds.
"""

import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from .models import ProverOutput, VerifierCombinedOutput, PaperSuggesterOutput
from .problem_agents import (
    call_prover_one, call_verifier_combined, call_summarizer
)
from .paper_agents import (
    call_paper_suggester, call_paper_fixer
)
from .utils import write_status, auto_commit_round, gather_context_files
from .agents import ensure_three_tier_files


def run_round(problem_dir: Path, round_idx: int, num_provers: int = 1, prover_configs: list = None, focus_description: str = None):
    """Run a single research round with specified number of provers."""
    import time
    round_start_time = time.time()
    
    print(f"\n=== Round {round_idx} ===")
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    
    # Ensure 3-tier file system exists
    ensure_three_tier_files(problem_dir)
    
    # Save context files list
    context_files = gather_context_files(problem_dir, round_idx)
    context_file = round_dir / "context.files.json"
    import json
    context_file.write_text(json.dumps(context_files, indent=2), encoding="utf-8")
    
    # Vector store removed; papers are appended as plain text in the prompt

    # Phase 1: Run provers (potentially in parallel)
    write_status(problem_dir, "prover", round_idx)
    
    # Default empty configs if not provided
    prover_configs = prover_configs or [{} for _ in range(num_provers)]
    
    if num_provers == 1:
        # Single prover
        config = prover_configs[0] if prover_configs else {}
        prover_output, success = call_prover_one(problem_dir, round_idx, 1, 1, config, focus_description)
        
        if not success:
            error_context = f"Single prover failed in round {round_idx}"
            detailed_error = f"{error_context}: {prover_output}"
            print(f"  [prover] Error: Single prover failed")
            write_status(problem_dir, "idle", round_idx, {
                "error": detailed_error,
                "error_component": "prover",
                "error_phase": "single_execution_failure"
            })
            raise Exception(f"Single prover failed: {prover_output}")
    else:
        # Multiple provers in parallel
        print(f"  Running {num_provers} provers in parallel...")
        with ThreadPoolExecutor(max_workers=min(num_provers, 10)) as executor:
            futures = []
            for prover_idx in range(1, num_provers + 1):
                config = prover_configs[prover_idx-1] if prover_idx-1 < len(prover_configs) else {}
                future = executor.submit(
                    call_prover_one, problem_dir, round_idx, prover_idx, num_provers, config, focus_description
                )
                futures.append(future)
            
            # Wait for all to complete and track success/failure
            successful_provers = 0
            failed_provers = 0
            
            for future in as_completed(futures):
                output, success = future.result()
                if success:
                    successful_provers += 1
                else:
                    failed_provers += 1
                    print(f"  [prover] One prover failed, but continuing with others...")
            
            # Check if all provers failed
            if successful_provers == 0:
                error_context = f"All {num_provers} provers failed in round {round_idx}"
                detailed_error = f"{error_context}: No successful prover outputs to work with"
                print(f"  [prover] Error: All provers failed")
                write_status(problem_dir, "idle", round_idx, {
                    "error": detailed_error,
                    "error_component": "prover",
                    "error_phase": "all_provers_failed"
                })
                raise Exception(f"All {num_provers} provers failed")
            
            print(f"  [prover] Results: {successful_provers} successful, {failed_provers} failed")
    
    # Phase 2: Run verifier
    try:
        verifier_output = call_verifier_combined(problem_dir, round_idx, num_provers, focus_description)
    except Exception as e:
        import traceback
        error_context = f"Verifier execution failed in round {round_idx}"
        detailed_error = f"{error_context}: {str(e)}\n\nFull traceback:\n{traceback.format_exc()}"
        print(f"  [verifier] Error: {e}")
        write_status(problem_dir, "idle", round_idx, {
            "error": detailed_error,
            "error_component": "verifier",
            "error_phase": "execution"
        })
        raise
    
    # Phase 3: Run summarizer
    try:
        summarizer_output = call_summarizer(problem_dir, round_idx)
    except Exception as e:
        import traceback
        error_context = f"Summarizer execution failed in round {round_idx}"
        detailed_error = f"{error_context}: {str(e)}\n\nFull traceback:\n{traceback.format_exc()}"
        print(f"  [summarizer] Error: {e}")
        write_status(problem_dir, "idle", round_idx, {
            "error": detailed_error,
            "error_component": "summarizer",
            "error_phase": "execution"
        })
        raise
    
    # Progress tracking removed - information available in Conversations tab
    
    # Auto-commit if configured
    auto_commit_round(problem_dir, round_idx, verifier_output.verdict)
    
    # Calculate total elapsed time and add to timings
    total_elapsed = time.time() - round_start_time
    timings_file = round_dir / "timings.json"
    if timings_file.exists():
        import json
        timings = json.loads(timings_file.read_text(encoding="utf-8"))
        timings["total_elapsed"] = {
            "duration_s": total_elapsed
        }
        timings_file.write_text(json.dumps(timings, indent=2), encoding="utf-8")
    
    # Mark as idle
    write_status(problem_dir, "idle", round_idx, {"last_round": round_idx})
    
    print(f"Round {round_idx} complete: {verifier_output.verdict}")
    return verifier_output.verdict


def run_paper_round(problem_dir: Path, round_idx: int):
    """Run a single paper writing round."""
    print(f"\n=== Paper Writing Round {round_idx} ===")
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    
    # Ensure 3-tier file system exists
    ensure_three_tier_files(problem_dir)
    
    # Save context files list
    context_files = gather_context_files(problem_dir, round_idx)
    context_file = round_dir / "context.files.json"
    import json
    context_file.write_text(json.dumps(context_files, indent=2), encoding="utf-8")
    
    # Phase 1: Paper suggester
    suggester_output = call_paper_suggester(problem_dir, round_idx)
    
    # Save suggester summary
    (round_dir / "paper_suggester.summary.md").write_text(
        f"## Advice\n{suggester_output.advice_md}\n\n"
        f"## Priority Items\n" + "\n".join(f"- {item}" for item in suggester_output.priority_items),
        encoding="utf-8"
    )
    
    # Phase 2: Paper fixer/writer
    fixer_output, compile_success, compile_log = call_paper_fixer(
        problem_dir, round_idx, suggester_output
    )
    
    # Save fixer summary and unfixable issues
    (round_dir / "paper_fixer.summary.md").write_text(
        f"## Status: {fixer_output.status}\n\n"
        f"## Changes Summary\n{fixer_output.changes_summary_md}\n\n"
        f"## Compilation: {'Success' if compile_success else 'Failed'}",
        encoding="utf-8"
    )
    
    if fixer_output.unfixable_issues_md:
        (round_dir / "paper_fixer.unfixable.md").write_text(
            fixer_output.unfixable_issues_md, encoding="utf-8"
        )
    
    # Progress tracking removed - information available in paper mode outputs
    
    # Update timings with compilation status
    timings_file = round_dir / "timings.json"
    if timings_file.exists():
        timings = json.loads(timings_file.read_text(encoding="utf-8"))
        if "paper_fixer" in timings:
            timings["paper_fixer"]["compiled"] = compile_success
        timings_file.write_text(json.dumps(timings, indent=2), encoding="utf-8")
    
    # Auto-commit if configured
    auto_commit_round(problem_dir, round_idx, fixer_output.status)
    
    # Mark as idle
    write_status(problem_dir, "idle", round_idx, {
        "last_round": round_idx,
        "paper_suggester": timings.get("paper_suggester", {}) if timings_file.exists() else {},
        "paper_fixer": timings.get("paper_fixer", {}) if timings_file.exists() else {}
    })
    
    print(f"Paper round {round_idx} complete: {fixer_output.status}")
    return fixer_output.status