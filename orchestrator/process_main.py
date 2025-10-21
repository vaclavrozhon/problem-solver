"""
Orchestrator child-process entrypoint.

This module is executed in a separate process to run orchestration without
blocking the API server. It uses the same orchestration function as the
in-process mode and relies on DB for inputs/outputs.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Automatic Researcher Orchestrator (child process)")
    p.add_argument("--problem-id", type=int, required=True)
    p.add_argument("--problem-name", type=str, required=True)
    p.add_argument("--run-id", type=int, required=True)
    p.add_argument("--user-id", type=str, required=True)
    p.add_argument("--rounds", type=int, required=False)
    p.add_argument("--provers", type=int, required=False)
    p.add_argument("--preset", type=str, required=False)
    p.add_argument("--user-specification", type=str, required=False)
    p.add_argument("--prover-directives", type=str, required=False)
    # Backward-compat: accept deprecated flags but ignore (parameters are read from DB)
    p.add_argument("--verifier-config", type=str, required=False, help="Deprecated; use DB run parameters")
    p.add_argument("--summarizer-model", type=str, required=False, help="Deprecated; use DB run parameters")
    return p.parse_args()


def main() -> int:
    # Configure logging similar to backend
    try:
        from backend.logging_config import setup_logging, get_logger
        setup_logging()
        logger = get_logger("orchestrator")
    except Exception:
        import logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        logger = logging.getLogger("automatic_researcher.orchestrator")

    args = _parse_args()
    problem_id = int(args.problem_id)
    problem_name = args.problem_name
    run_id = int(args.run_id)
    user_id = args.user_id

    user_token = os.getenv("RUN_USER_TOKEN")
    if not user_token:
        logger.error("RUN_USER_TOKEN missing", extra={"event_type": "orchestrator_start_error", "problem_id": problem_id, "run_id": run_id})
        return 2

    # Build config payload compatible with start_research_run
    config: dict = {}
    if args.rounds is not None:
        config["rounds"] = int(args.rounds)
    if args.provers is not None:
        config["provers"] = int(args.provers)
    if args.preset is not None:
        config["preset"] = args.preset
    if args.user_specification:
        config["user_specification"] = args.user_specification
    if args.prover_directives:
        import json
        try:
            config["prover_directives"] = json.loads(args.prover_directives)
        except Exception:
            config["prover_directives"] = args.prover_directives

    logger.info("Child orchestrator starting", extra={"event_type": "orchestrator_child_start", "problem_id": problem_id, "run_id": run_id})

    try:
        # Run the existing async orchestration function
        from backend.routers.problems.execution import start_research_run
        asyncio.run(start_research_run(problem_id, problem_name, config, user_id, user_token, run_id))
        logger.info("Child orchestrator finished", extra={"event_type": "orchestrator_child_finished", "problem_id": problem_id, "run_id": run_id})
        return 0
    except Exception as e:
        logger.exception("Child orchestrator failed", extra={"event_type": "orchestrator_child_failed", "problem_id": problem_id, "run_id": run_id, "error_type": type(e).__name__, "error_details": str(e)})
        return 1


if __name__ == "__main__":
    sys.exit(main())


