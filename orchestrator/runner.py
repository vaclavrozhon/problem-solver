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
from .papers import ensure_papers_parsed
from .vectorstore_manager import ensure_vector_store
from .file_manager import FileManager


def run_round(problem_dir: Path, round_idx: int, num_provers: int = 1, prover_configs: list = None):
    """Run a single research round with specified number of provers."""
    import time
    round_start_time = time.time()
    
    print(f"\n=== Round {round_idx} ===")
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    # Ensure papers are parsed
    ensure_papers_parsed(problem_dir)
    
    # Ensure 3-tier file system exists
    ensure_three_tier_files(problem_dir)
    
    # Save context files list
    context_files = gather_context_files(problem_dir, round_idx)
    context_file = round_dir / "context.files.json"
    import json
    context_file.write_text(json.dumps(context_files, indent=2), encoding="utf-8")
    
    # Build/ensure vector store for this problem's papers (once per round)
    fm = FileManager(problem_dir)
    paper_paths = fm.get_available_paper_files()
    
    # Log vector store creation/usage
    vector_store_status = None
    if paper_paths:
        print(f"  [vector_store] Setting up vector store for {len(paper_paths)} papers...")
        try:
            import time
            vs_start = time.perf_counter()
            vector_store_id = ensure_vector_store(problem_dir, paper_paths)
            vs_duration = time.perf_counter() - vs_start
            print(f"  [vector_store] Ready ({vs_duration:.1f}s) - ID: {vector_store_id}")
            vector_store_status = {
                "status": "success",
                "duration_s": vs_duration,
                "vector_store_id": vector_store_id,
                "num_papers": len(paper_paths)
            }
        except Exception as e:
            print(f"  [vector_store] Failed: {e}")
            vector_store_id = None
            vector_store_status = {
                "status": "failed", 
                "error": str(e),
                "num_papers": len(paper_paths)
            }
    else:
        print(f"  [vector_store] No papers available, skipping vector store creation")
        vector_store_id = None
        vector_store_status = {
            "status": "skipped",
            "reason": "no_papers"
        }

    # Save vector store status to timings
    timings_file = round_dir / "timings.json"
    timings = {}
    if timings_file.exists():
        timings = json.loads(timings_file.read_text(encoding="utf-8"))
    
    timings["vector_store"] = vector_store_status
    timings_file.write_text(json.dumps(timings, indent=2), encoding="utf-8")

    # Phase 1: Run provers (potentially in parallel)
    write_status(problem_dir, "prover", round_idx)
    
    # Default empty configs if not provided
    prover_configs = prover_configs or [{} for _ in range(num_provers)]
    
    if num_provers == 1:
        # Single prover
        try:
            config = prover_configs[0] if prover_configs else {}
            if vector_store_id:
                config = {**config, "vector_store_id": vector_store_id}
            prover_output = call_prover_one(problem_dir, round_idx, 1, 1, config)
        except Exception as e:
            import traceback
            error_context = f"Single prover execution failed in round {round_idx}"
            detailed_error = f"{error_context}: {str(e)}\n\nFull traceback:\n{traceback.format_exc()}"
            print(f"  [prover] Error: {e}")
            write_status(problem_dir, "idle", round_idx, {
                "error": detailed_error,
                "error_component": "prover",
                "error_phase": "single_execution"
            })
            raise
    else:
        # Multiple provers in parallel
        print(f"  Running {num_provers} provers in parallel...")
        with ThreadPoolExecutor(max_workers=min(num_provers, 10)) as executor:
            futures = []
            for prover_idx in range(1, num_provers + 1):
                config = prover_configs[prover_idx-1] if prover_idx-1 < len(prover_configs) else {}
                if vector_store_id:
                    config = {**config, "vector_store_id": vector_store_id}
                future = executor.submit(
                    call_prover_one, problem_dir, round_idx, prover_idx, num_provers, config
                )
                futures.append(future)
            
            # Wait for all to complete
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    import traceback
                    error_context = f"Prover execution failed in round {round_idx}"
                    detailed_error = f"{error_context}: {str(e)}\n\nFull traceback:\n{traceback.format_exc()}"
                    print(f"  [prover] Error: {e}")
                    print(f"  [prover] Detailed error logged to status")
                    # Save detailed error to status
                    write_status(problem_dir, "idle", round_idx, {
                        "error": detailed_error,
                        "error_component": "prover",
                        "error_phase": "parallel_execution"
                    })
                    raise
    
    # Phase 2: Run verifier
    try:
        verifier_output = call_verifier_combined(problem_dir, round_idx, num_provers)
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
    
    # Ensure papers are parsed
    ensure_papers_parsed(problem_dir)
    
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