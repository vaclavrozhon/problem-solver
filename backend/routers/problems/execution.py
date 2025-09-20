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
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends

from ...services.database import DatabaseService
from ...authentication import get_current_user, get_db_client, AuthedUser

router = APIRouter()


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
        print(f"Error getting problem status: {e}")
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

        # Update problem status to "running"
        status_updated = await DatabaseService.update_problem_status(db, problem_id, "running")
        if not status_updated:
            raise HTTPException(500, "Failed to update problem status")

        print(f"🚀 Starting research run for problem '{problem_name}' (ID: {problem_id})")
        print(f"📋 Run configuration: {request}")

        # Start the research run using the orchestrator
        import asyncio
        asyncio.create_task(start_research_run(problem_id, problem_name, request, user.sub))

        return {
            "message": f"Research run started for problem '{problem_name}'",
            "problem_id": problem_id,
            "status": "running",
            "config": request
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting run: {e}")
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

        # Update problem status to "idle"
        success = await DatabaseService.update_problem_status(db, problem_id, "idle")
        if not success:
            raise HTTPException(500, "Failed to stop problem")

        return {
            "message": f"Problem '{problem_name}' stopped successfully",
            "problem_id": problem_id,
            "status": "idle"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error stopping problem: {e}")
        raise HTTPException(500, f"Failed to stop problem: {str(e)}")


async def start_research_run(problem_id: int, problem_name: str, config: dict, user_id: str):
    """
    Start a research run using the orchestrator.
    This runs in the background as an async task with progress updates.
    """
    from ...authentication import get_db_client_sync

    db = None
    try:
        # Get database client for updates
        db = get_db_client_sync(user_id)

        # Add orchestrator to path
        orchestrator_path = Path(__file__).parent.parent.parent.parent / "orchestrator"
        sys.path.insert(0, str(orchestrator_path))

        from orchestrator.runner import run_round
        from orchestrator.utils import write_status, check_stop_signal, StopSignalException

        # Create problem directory structure
        data_root = Path(os.environ.get("AR_DATA_ROOT", "./data"))
        user_dir = data_root / user_id / "problems" / problem_name
        user_dir.mkdir(parents=True, exist_ok=True)

        # Extract configuration
        rounds = config.get('rounds', 1)
        provers = config.get('provers', 1)
        temperature = config.get('temperature', 0.7)
        preset = config.get('preset', 'gpt5')
        prover_configs = config.get('prover_configs', [])
        focus_description = config.get('focus_description')

        print(f"🔄 Running {rounds} rounds with {provers} provers for problem '{problem_name}'")

        # Run the research rounds asynchronously
        for round_idx in range(1, rounds + 1):
            # Check for stop signal before each round
            if check_stop_signal(user_dir):
                print(f"🛑 Stop signal detected, halting research for '{problem_name}'")
                await DatabaseService.update_problem_status(db, problem_id, "idle", round_idx - 1)
                write_status(user_dir, "idle", round_idx - 1)
                return

            print(f"🔍 Starting round {round_idx}/{rounds}")

            # Update database with current round progress
            await DatabaseService.update_problem_status(db, problem_id, "running", round_idx)
            write_status(user_dir, "running", round_idx)

            try:
                # Run the round in an executor to avoid blocking the event loop
                import asyncio
                loop = asyncio.get_event_loop()

                # Run the synchronous orchestrator function in a thread pool
                await loop.run_in_executor(
                    None,
                    run_round,
                    user_dir,
                    round_idx,
                    provers,
                    prover_configs,
                    focus_description
                )

                print(f"✅ Completed round {round_idx}/{rounds}")

            except StopSignalException:
                print(f"🛑 Stop signal detected during round {round_idx}, halting research")
                await DatabaseService.update_problem_status(db, problem_id, "idle", round_idx - 1)
                write_status(user_dir, "idle", round_idx - 1)
                return
            except Exception as e:
                print(f"❌ Error in round {round_idx} for problem '{problem_name}': {e}")
                await DatabaseService.update_problem_status(db, problem_id, "failed", round_idx)
                write_status(user_dir, "failed", round_idx)
                raise

        # Update status to completed
        await DatabaseService.update_problem_status(db, problem_id, "completed", rounds)
        write_status(user_dir, "completed", rounds)
        print(f"🎉 Research run completed for problem '{problem_name}'")

    except Exception as e:
        print(f"❌ Error in research run for problem '{problem_name}': {e}")
        # Update status to failed
        if db:
            try:
                await DatabaseService.update_problem_status(db, problem_id, "failed")
            except:
                pass

        # Write error status to file system
        try:
            data_root = Path(os.environ.get("AR_DATA_ROOT", "./data"))
            user_dir = data_root / user_id / "problems" / problem_name
            write_status(user_dir, "failed", 0)
        except:
            pass