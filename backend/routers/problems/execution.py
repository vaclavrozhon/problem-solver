"""
Problem execution router.

Handles running and stopping problems:
- Get problem status
- Start research runs
- Stop running problems
- Background execution management
"""

import sys
import os
import time
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends

from ...services.database import DatabaseService
from ...logging_config import get_logger
from ...authentication import get_current_user, get_db_client, AuthedUser

logger = get_logger("automatic_researcher.routers.problems.execution")
router = APIRouter()


@router.get("/all-status")
async def get_all_problems_status(
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get status for all user's problems in a single request.

    Returns:
        Dictionary mapping problem names to their status information
    """
    try:
        # Get all user problems
        problems = await DatabaseService.get_user_problems(db)

        # Build lightweight status map from problems table only
        status_map = {}
        for problem in problems:
            problem_name = problem['name']
            is_running = problem.get('status') == 'running'
            status_map[problem_name] = {
                "problem": problem,
                "overall": {
                    "phase": problem.get('status', 'idle'),
                    "current_round": problem.get('current_round', 0) or 0,
                    "is_running": is_running,
                    "total_rounds": problem.get('current_round', 0) or 0,
                    "last_updated": problem.get('updated_at')
                },
                "rounds": [],
                "base_files": {}
            }

        return status_map

    except Exception as e:
        logger.error("Batch status failed", extra={"event_type": "batch_status_error", "error_type": type(e).__name__, "error_details": str(e)})
        raise HTTPException(500, f"Failed to get status: {str(e)}")

@router.get("/{problem_name}/status")
async def get_problem_status(
    problem_name: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get detailed status for a problem including rounds and files.

    Args:
        problem_name: Problem name
        user_id: Authenticated user ID

    Returns:
        Problem status with rounds and recent activity
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Get all files to analyze rounds
        files = await DatabaseService.get_problem_files(db, problem_id)

        # Group files by round
        rounds_data = {}
        base_files = {}

        for file in files:
            if file['round'] == 0:
                base_files[file['file_type']] = file
            else:
                round_num = file['round']
                if round_num not in rounds_data:
                    rounds_data[round_num] = {
                        "number": round_num,
                        "files": {},
                        "status": "completed",
                        "created_at": None
                    }

                rounds_data[round_num]['files'][file['file_type']] = file
                if not rounds_data[round_num]['created_at'] or file['created_at'] > rounds_data[round_num]['created_at']:
                    rounds_data[round_num]['created_at'] = file['created_at']

        # Sort rounds by number
        rounds = [rounds_data[num] for num in sorted(rounds_data.keys())]

        # Add round summaries and verdicts from files
        for round_info in rounds:
            round_files = round_info['files']

            # Extract verdict from verifier output
            if 'verifier_output' in round_files:
                try:
                    import json
                    verifier_data = json.loads(round_files['verifier_output']['content'])
                    round_info['verdict'] = verifier_data.get('verdict')
                except:
                    pass

            # Extract one-line summary from summarizer output
            if 'summarizer_output' in round_files:
                try:
                    import json
                    summarizer_data = json.loads(round_files['summarizer_output']['content'])
                    round_info['one_line_summary'] = summarizer_data.get('one_line_summary')
                    round_info['summary'] = summarizer_data.get('summary', '')
                except:
                    pass

        # Determine if currently running
        is_running = problem['status'] == 'running'

        return {
            "problem": problem,
            "overall": {
                "phase": problem['status'],
                "current_round": problem['current_round'],
                "is_running": is_running,
                "total_rounds": len(rounds),
                "last_updated": problem['updated_at']
            },
            "rounds": rounds,
            "base_files": base_files
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Problem status failed", extra={"event_type": "problem_status_error", "problem_name": problem_name, "error_type": type(e).__name__, "error_details": str(e)})
        raise HTTPException(500, f"Failed to get problem status: {str(e)}")


@router.post("/{problem_name}/run")
async def run_problem(
    problem_name: str,
    request: dict,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Start a research run for a problem.

    Args:
        problem_name: Problem name
        request: Run configuration (rounds, provers, etc.)
        user_id: Authenticated user ID

    Returns:
        Run start confirmation
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Create run row and set active_run_id
        # Capture user selection fields for focus
        user_specification = request.get('focus_description') or request.get('user_specification')
        # Per-prover directives can be named 'prover_configs' or 'focus_instructions'
        prover_directives = request.get('prover_configs') or request.get('focus_instructions')

        run_record = await DatabaseService.create_run(db, problem_id, {
            'phase': 'initializing',
            'total_rounds': request.get('rounds', 1),
            'provers_count': request.get('provers', 1),
            # New fields for prompt assembly
            'user_specification': user_specification,
            'prover_directives': prover_directives,
        })
        if not run_record:
            raise HTTPException(500, "Failed to create run record")

        # Update problem status to "running"
        status_updated = await DatabaseService.update_problem_status(db, problem_id, "running")
        if not status_updated:
            raise HTTPException(500, "Failed to update problem status")

        logger.info("Research run start", extra={"event_type": "run_start", "problem_name": problem_name, "problem_id": problem_id})

        # Start the research run using the orchestrator
        import asyncio
        asyncio.create_task(start_research_run(problem_id, problem_name, request, user.sub, user.token))

        return {
            "message": f"Research run started for problem '{problem_name}'",
            "problem_id": problem_id,
            "status": "running",
            "config": request
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Run start failed", extra={"event_type": "run_start_error", "problem_name": problem_name, "error_type": type(e).__name__, "error_details": str(e)})
        raise HTTPException(500, f"Failed to start run: {str(e)}")


@router.post("/{problem_name}/stop")
async def stop_problem(
    problem_name: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Stop a running problem.

    Args:
        problem_name: Problem name
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']
        active_run_id = problem.get('active_run_id')

        # Emit a stop signal file so any background loop can halt gracefully
        # Signal stop via DB (set run status to 'stopping' if active)
        try:
            if active_run_id:
                await DatabaseService.update_run(db, int(active_run_id), status='stopping')
        except Exception:
            pass

        # If there's an active run, mark it stopped (terminal)
        if active_run_id:
            try:
                await DatabaseService.update_run(db, int(active_run_id), status='stopped')
            except Exception:
                # Continue to set problem idle even if run update fails
                pass

        # Update problem status to "idle" and clear active_run_id via service logic
        success = await DatabaseService.update_problem_status(db, problem_id, "idle")
        if not success:
            raise HTTPException(500, "Failed to stop problem")

        return {
            "message": f"Problem '{problem_name}' stopped successfully",
            "problem_id": problem_id,
            "status": "idle",
            "run_id": active_run_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Stop problem failed", extra={"event_type": "stop_error", "problem_name": problem_name, "error_type": type(e).__name__, "error_details": str(e)})
        raise HTTPException(500, f"Failed to stop problem: {str(e)}")


async def start_research_run(problem_id: int, problem_name: str, config: dict, user_id: str, user_token: str):
    """
    Start a research run using the orchestrator.
    This runs in the background as an async task with progress updates.
    """
    from ...authentication import get_db_client_with_token

    db = None
    try:
        # Get database client for updates using user's JWT token
        db = get_db_client_with_token(user_token, user_id)

        # Add orchestrator to path
        orchestrator_path = Path(__file__).parent.parent.parent.parent / "orchestrator"
        sys.path.insert(0, str(orchestrator_path))

        from orchestrator.utils import check_stop_signal, StopSignalException
        from orchestrator.database_integration import initialize_database_integration, set_current_run_id
        from orchestrator.problem_agents import call_prover_one, call_verifier_combined, call_summarizer

        # Filesystem structure removed in DB-only mode

        # Extract configuration
        rounds = config.get('rounds', 1)
        provers = config.get('provers', 1)
        # Temperature is not used for GPT-5
        preset = config.get('preset', 'gpt5')
        # Harmonize naming: keep both for backward compatibility
        prover_configs = config.get('prover_configs') or config.get('prover_directives') or []
        focus_description = config.get('focus_description') or config.get('user_specification')

        logger.info("Orchestration start", extra={"event_type": "orchestrator_start", "problem_id": problem_id, "rounds": rounds, "provers": provers})

        # Initialize database integration for orchestrator
        logger.info("DB integration init", extra={"event_type": "dbi_init", "problem_id": problem_id})
        initialize_database_integration(problem_id, user_token, user_id)
        try:
            # Set current run id in orchestrator context so provers can fetch parameters
            from ...services.database import DatabaseService as _DS
            # Best-effort: problem may have active_run_id set
            problem_row = await _DS.get_problem_by_id(db, problem_id)  # type: ignore
            set_current_run_id(problem_row.get('active_run_id') if problem_row else None)
        except Exception:
            set_current_run_id(None)
        logger.info("DB integration ready", extra={"event_type": "dbi_ready", "problem_id": problem_id})

        # FULL ORCHESTRATION: Multi-round, sequential stages with stop checks
        for round_idx in range(1, int(rounds) + 1):
            round_meta: dict = {
                "round": round_idx,
                "started_at": time.time(),
                "stages": {
                    "provers": {},
                    "verifier": {},
                    "summarizer": {}
                }
            }
            # Mark progress
            await DatabaseService.update_problem_status(db, problem_id, "running", round_idx)

            # Provers
            for prover_idx in range(1, int(provers) + 1):
                if check_stop_signal(Path(".")):
                    logger.info("Stop signal before prover", extra={"event_type": "stop_before_prover", "round": round_idx})
                    raise StopSignalException("Stop requested")
                try:
                    start_ts = time.time()
                    _content, _ok = call_prover_one(
                        Path("."),
                        round_idx,
                        prover_idx,
                        int(provers),
                        prover_configs[prover_idx-1] if prover_configs and prover_idx-1 < len(prover_configs) else {},
                        focus_description,
                        prompt_only=False,
                    )
                    end_ts = time.time()
                    round_meta["stages"]["provers"][f"prover-{prover_idx:02d}"] = {
                        "start_ts": start_ts,
                        "end_ts": end_ts,
                        "duration_s": end_ts - start_ts,
                        "ok": _ok,
                    }
                    logger.info("Prover finished", extra={"event_type": "prover_done", "round": round_idx, "prover_index": prover_idx, "ok": _ok})
                except Exception as e:
                    logger.warning("Prover error", extra={"event_type": "prover_error", "round": round_idx, "prover_index": prover_idx, "error_type": type(e).__name__, "error_details": str(e)})

            # Verifier
            if check_stop_signal(Path(".")):
                logger.info("Stop signal before verifier", extra={"event_type": "stop_before_verifier", "round": round_idx})
                raise StopSignalException("Stop requested")
            try:
                v_start = time.time()
                _verifier = call_verifier_combined(Path("."), round_idx, int(provers), focus_description)
                v_end = time.time()
                round_meta["stages"]["verifier"] = {
                    "start_ts": v_start,
                    "end_ts": v_end,
                    "duration_s": v_end - v_start,
                }
                logger.info("Verifier finished", extra={"event_type": "verifier_done", "round": round_idx})
            except Exception as e:
                logger.error("Verifier error", extra={"event_type": "verifier_error", "round": round_idx, "error_type": type(e).__name__, "error_details": str(e)})
                raise

            # Summarizer
            if check_stop_signal(Path(".")):
                logger.info("Stop signal before summarizer", extra={"event_type": "stop_before_summarizer", "round": round_idx})
                raise StopSignalException("Stop requested")
            try:
                s_start = time.time()
                _summ = call_summarizer(Path("."), round_idx)
                s_end = time.time()
                round_meta["stages"]["summarizer"] = {
                    "start_ts": s_start,
                    "end_ts": s_end,
                    "duration_s": s_end - s_start,
                }
                try:
                    ols = getattr(_summ, 'one_line_summary', None)
                    if ols:
                        round_meta["one_line_summary"] = ols
                except Exception:
                    pass
                logger.info("Summarizer finished", extra={"event_type": "summarizer_done", "round": round_idx})
            except Exception as e:
                logger.error("Summarizer error", extra={"event_type": "summarizer_error", "round": round_idx, "error_type": type(e).__name__, "error_details": str(e)})
                raise

            # Persist round metadata for debugging (Files/metadata)
            try:
                round_meta["ended_at"] = time.time()
                await DatabaseService.create_problem_file(  # type: ignore
                    db=db,
                    problem_id=problem_id,
                    round_num=round_idx,
                    file_type="round_meta",
                    filename=f"round-{round_idx:04d}.metadata.json",
                    content=json.dumps(round_meta, indent=2),
                    metadata={"phase": "complete"}
                )
            except Exception as meta_err:
                logger.warning("Round metadata save failed", extra={"event_type": "round_meta_error", "round": round_idx, "error_type": type(meta_err).__name__, "error_details": str(meta_err)})

            # Continue loop for next round

        # Finished all rounds: mark idle and complete the run
        await DatabaseService.update_problem_status(db, problem_id, "idle", int(rounds))
        try:
            # Mark run completed if still active
            run_row = await DatabaseService.get_problem_by_id(db, problem_id)  # reuse to fetch active_run_id
            run_id = (run_row or {}).get('active_run_id') if run_row else None
            if run_id:
                await DatabaseService.update_run(db, int(run_id), status='completed')
        except Exception:
            pass
        logger.info("Orchestration finished", extra={"event_type": "orchestrator_finished", "problem_id": problem_id})

    except StopSignalException:
        # Mark idle and stop run
        if db:
            try:
                await DatabaseService.update_problem_status(db, problem_id, "idle")
                row = await DatabaseService.get_problem_by_id(db, problem_id)  # type: ignore
                rid = (row or {}).get('active_run_id') if row else None
                if rid:
                    await DatabaseService.update_run(db, int(rid), status='stopped')
            except Exception:
                pass
        logger.info("Orchestration stopped by signal", extra={"event_type": "orchestrator_stopped", "problem_id": problem_id})
    except Exception as e:
        logger.error("Run error", extra={"event_type": "run_error", "problem_name": problem_name, "error_type": type(e).__name__, "error_details": str(e)})
        # Update status to failed
        if db:
            try:
                await DatabaseService.update_problem_status(db, problem_id, "failed")
            except:
                pass

        # Filesystem error status writes removed in DB-only mode