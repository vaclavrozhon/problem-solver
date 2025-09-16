#!/usr/bin/env python3
"""
Orchestrator - Main entry point for the Automatic Researcher system.

This script coordinates research and paper writing rounds by delegating
to specialized modules in the orchestrator package.
"""

import os
import sys
import argparse
from pathlib import Path

# Load environment variables from .openai.env if it exists
openai_env_file = Path.home() / ".openai.env"
if openai_env_file.exists():
    with open(openai_env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
    print(f"Loaded environment from {openai_env_file}")

# Add orchestrator package to path
sys.path.insert(0, str(Path(__file__).parent))

from orchestrator.runner import run_round, run_paper_round
from orchestrator.utils import write_status, check_stop_signal, StopSignalException


def main():
    """Main entry point for the orchestrator."""
    parser = argparse.ArgumentParser(description='Run research or paper writing rounds')
    parser.add_argument('problem_dir', type=str, help='Path to problem directory')
    parser.add_argument('--rounds', type=int, default=1, help='Number of rounds to run')
    parser.add_argument('--mode', choices=['research', 'paper'], default='research',
                        help='Mode: research (problem solving) or paper (writing)')
    args = parser.parse_args()
    
    problem_dir = Path(args.problem_dir)
    if not problem_dir.exists():
        print(f"Error: Problem directory not found: {problem_dir}")
        sys.exit(1)
    
    # Check for AR_MODE environment variable (overrides command line)
    mode = os.environ.get("AR_MODE", "").lower()
    if mode == "writing":
        args.mode = "paper"
    elif mode == "research":
        args.mode = "research"
    
    # Get number of provers from environment
    num_provers = int(os.environ.get("AR_NUM_PROVERS", "1"))
    
    # Load prover configurations if available
    prover_configs = None
    config_file = problem_dir / "runs" / "prover_configs.json"
    if config_file.exists():
        try:
            import json
            prover_configs = json.loads(config_file.read_text(encoding="utf-8"))
            print(f"Loaded prover configurations: {len(prover_configs)} configs")
        except Exception as e:
            print(f"Warning: Could not load prover configurations: {e}")
            prover_configs = None
    
    # Load focus description from run metadata if available
    focus_description = None
    metadata_file = problem_dir / "runs" / "run_metadata.json"
    if metadata_file.exists():
        try:
            import json
            metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
            focus_description = metadata.get("focus_description")
            if focus_description:
                print(f"Loaded focus description: {focus_description[:50]}..." if len(focus_description) > 50 else f"Loaded focus description: {focus_description}")
        except Exception as e:
            print(f"Warning: Could not load run metadata: {e}")
    
    print(f"Starting orchestrator in {args.mode} mode")
    print(f"Problem directory: {problem_dir}")
    print(f"Rounds to run: {args.rounds}")
    
    if args.mode == "research":
        print(f"Number of provers per round: {num_provers}")
    
    # Create runs directory if it doesn't exist
    runs_dir = problem_dir / "runs"
    runs_dir.mkdir(exist_ok=True)

    # Determine starting round number
    existing_rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
    start_round = len(existing_rounds) + 1

    # Write batch status file for this run
    # This file tracks the current batch of rounds being executed, allowing the UI
    # to correctly display "Round X of Y" even when previous rounds exist
    import json
    import time
    batch_status = {
        "batch_start_round": start_round,      # First round number in this batch
        "batch_total_rounds": args.rounds,     # Total rounds requested for this batch
        "batch_current_round": 0,              # Current position within batch (1-indexed when running)
        "started_at": time.time(),             # Timestamp when batch started
        "mode": args.mode                      # Research or paper mode
    }
    batch_status_file = runs_dir / "batch_status.json"
    batch_status_file.write_text(json.dumps(batch_status, indent=2))

    # Run the requested number of rounds
    for round_offset in range(args.rounds):
        round_idx = start_round + round_offset

        # Update batch status with current round position (1-indexed for display)
        batch_status["batch_current_round"] = round_offset + 1
        batch_status_file.write_text(json.dumps(batch_status, indent=2))

        # Check for stop signal before starting each round
        if check_stop_signal(problem_dir):
            print(f"\n⏹️  Stop signal detected. Stopping orchestrator.")
            write_status(problem_dir, "idle", round_idx, {"stopped_by_signal": True})
            break

        try:
            if args.mode == "paper":
                verdict = run_paper_round(problem_dir, round_idx)
            else:
                verdict = run_round(problem_dir, round_idx, num_provers, prover_configs, focus_description)
            
            # Check for early stopping conditions
            if args.mode == "research" and verdict == "complete":
                print(f"\n✅ Problem appears to be solved! Stopping early.")
                break
            
        except StopSignalException:
            print(f"\n⏹️  Stop signal detected during round {round_idx}. Stopping orchestrator.")
            write_status(problem_dir, "idle", round_idx, {"stopped_by_signal": True})
            break
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
            write_status(problem_dir, "idle", round_idx, {"interrupted": True})
            sys.exit(0)
        except Exception as e:
            print(f"\n❌ Error in round {round_idx}: {e}")
            # Check if detailed error info already exists, preserve it
            status_file = problem_dir / "runs" / "live_status.json"
            existing_error_info = {}
            if status_file.exists():
                try:
                    import json
                    existing_status = json.loads(status_file.read_text(encoding="utf-8"))
                    # Preserve existing error component and phase info if present
                    if "error_component" in existing_status:
                        existing_error_info["error_component"] = existing_status["error_component"]
                    if "error_phase" in existing_status:
                        existing_error_info["error_phase"] = existing_status["error_phase"]
                except:
                    pass
            
            error_info = {"error": str(e)}
            error_info.update(existing_error_info)  # Keep existing component/phase info
            write_status(problem_dir, "idle", round_idx, error_info)
            raise
    
    # Final summary
    print(f"\n{'='*50}")
    print(f"Completed {args.rounds} round(s) in {args.mode} mode")
    
    # Summary and progress files removed - information available in Conversations tab
    
    print(f"Results saved in: {problem_dir}")
    print("Done!")


if __name__ == "__main__":
    main()