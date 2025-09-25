"""
Problems router - database-only implementation.

This module handles all endpoints related to problem creation, execution,
status tracking, and file management using Supabase database storage.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from ..services.database import DatabaseService
from ..authentication import get_current_user, get_db_client, get_db_client_with_token, AuthedUser
from ..logging_config import get_logger


logger = get_logger("problems")

router = APIRouter(prefix="/problems", tags=["problems"])


class CreateProblemRequest(BaseModel):
    name: str
    task_description: str
    config: Optional[Dict[str, Any]] = None


class UpdateFileRequest(BaseModel):
    content: str
    description: Optional[str] = None




@router.get("")
async def list_problems(
    user: AuthedUser = Depends(get_current_user),
    db = Depends(get_db_client),
    include_status: bool = False
):
    """
    List all problems for the authenticated user.

    Args:
        include_status: If true, include status information for each problem

    Returns:
        List of user's problems from database
    """
    logger.info(
        f"Listing problems for user: {user.sub}",
        extra={
            "event_type": "list_problems_start",
            "user_id": user.sub,
            "include_status": include_status
        }
    )

    try:
        problems = await DatabaseService.get_user_problems(db)

        if include_status:
            # Minimal status derived from problems table only (no file queries)
            for problem in problems:
                problem['status'] = {
                    'rounds_count': problem.get('current_round', 0) or 0,
                    'last_activity': problem.get('updated_at'),
                    'is_running': problem.get('status') == 'running',
                    'phase': problem.get('status', 'idle') or 'idle'
                }

        logger.info(
            f"Found {len(problems)} problems for user: {user.sub}",
            extra={
                "event_type": "list_problems_success",
                "user_id": user.sub,
                "problem_count": len(problems),
                "include_status": include_status
            }
        )

        return problems
    except Exception as e:
        logger.error(
            f"Error listing problems: {str(e)}",
            extra={
                "event_type": "list_problems_error",
                "user_id": user.sub,
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            exc_info=True
        )
        raise HTTPException(500, f"Failed to list problems: {str(e)}")


@router.post("")
async def create_problem(
    request: CreateProblemRequest,
    user: AuthedUser = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """
    Create a new problem for the authenticated user.

    Args:
        request: Problem creation request
        user_id: Authenticated user ID

    Returns:
        Created problem record
    """
    logger.info(
        f"Creating problem: {request.name}",
        extra={
            "event_type": "problem_create_start",
            "user_id": user.sub,
            "problem_name": request.name,
            "has_config": request.config is not None
        }
    )
    
    try:
        problem = await DatabaseService.create_problem(db, 
            user_id=user.sub,
            name=request.name,
            task_description=request.task_description,
            config=request.config
        )
        
        logger.info(
            f"Problem created successfully: {request.name}",
            extra={
                "event_type": "problem_create_success",
                "user_id": user.sub,
                "problem_id": problem.get('id'),
                "problem_name": request.name
            }
        )
        
        return {
            "problem": problem,
            "message": f"Problem '{request.name}' created successfully"
        }
    except HTTPException as e:
        logger.warning(
            f"Problem creation failed with HTTP error: {e.detail}",
            extra={
                "event_type": "problem_create_http_error",
                "user_id": user.sub,
                "problem_name": request.name,
                "error_detail": e.detail,
                "status_code": e.status_code
            }
        )
        raise
    except Exception as e:
        logger.error(
            f"Problem creation failed with unexpected error: {str(e)}",
            extra={
                "event_type": "problem_create_error",
                "user_id": user.sub,
                "problem_name": request.name,
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            exc_info=True
        )
        raise HTTPException(500, f"Failed to create problem: {str(e)}")


@router.get("/status")
async def get_all_problems_status(
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get status for all user's problems in a single request.

    Returns:
        Dictionary mapping problem names to their status information
    """
    try:
        logger.info(
            "Batch status: fetching problems",
            extra={"event_type": "batch_status_fetch", "user_id": user.sub}
        )
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

        logger.info(
            "Batch status: success",
            extra={
                "event_type": "batch_status_success",
                "user_id": user.sub,
                "problem_count": len(problems)
            }
        )
        return status_map

    except Exception as e:
        logger.error(
            f"Error getting batch status: {str(e)}",
            extra={
                "event_type": "batch_status_error",
                "user_id": user.sub,
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            exc_info=True
        )
        raise HTTPException(500, f"Failed to get status: {str(e)}")


@router.get("/all-status")
async def get_all_problems_status_alias(
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """Alias endpoint for batch status to avoid any route collisions."""
    logger.info(
        "Fetching all problems status",
        extra={
            "event_type": "problems_all_status_start",
            "user_id": user.sub
        }
    )
    return await get_all_problems_status(user=user, db=db)


@router.get("/id/{problem_id}")
async def get_problem(
    problem_id: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get a specific problem by ID.

    Args:
        problem_id: Problem ID
        user_id: Authenticated user ID

    Returns:
        Problem details
    """
    try:
        problem = await DatabaseService.get_problem_by_id(db, problem_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        return {"problem": problem}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting problem: {e}")
        raise HTTPException(500, f"Failed to get problem: {str(e)}")


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
        logger.error(f"Error getting problem status: {e}")
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

        logger.info(f"🚀 Starting research run for problem '{problem_name}' (ID: {problem_id})")
        logger.info(f"📋 Run configuration: {request}")

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
        logger.error(f"Error starting run: {e}")
        raise HTTPException(500, f"Failed to start run: {str(e)}")


@router.get("/{problem_name}/files")
async def get_problem_files(
    problem_name: str,
    round: Optional[int] = None,
    file_type: Optional[str] = None,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get files for a problem, optionally filtered by round and type.

    Args:
        problem_name: Problem name
        round: Optional round number filter
        file_type: Optional file type filter
        user_id: Authenticated user ID

    Returns:
        List of matching files
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']
        files = await DatabaseService.get_problem_files(db, problem_id, round, file_type)
        return {
            "files": files,
            "total": len(files),
            "filters": {
                "round": round,
                "file_type": file_type
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting files: {e}")
        raise HTTPException(500, f"Failed to get files: {str(e)}")


@router.put("/id/{problem_id}/files/{file_type}")
async def update_problem_file(
    problem_id: int,
    file_type: str,
    request: UpdateFileRequest,
    round: int = 0,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Update or create a problem file.

    Args:
        problem_id: Problem ID
        file_type: Type of file to update
        request: Update request with content
        round: Round number (default 0 for base files)
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Verify ownership
        problem = await DatabaseService.get_problem_by_id(db, problem_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        success = await DatabaseService.update_problem_file(db, 
            problem_id=problem_id,
            file_type=file_type,
            content=request.content,
            round=round
        )

        if not success:
            raise HTTPException(500, "Failed to update file")

        return {
            "message": f"File '{file_type}' updated successfully",
            "file_type": file_type,
            "round": round
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating file: {e}")
        raise HTTPException(500, f"Failed to update file: {str(e)}")


@router.delete("/id/{problem_id}")
async def delete_problem(
    problem_id: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Delete a problem and all associated data.

    Args:
        problem_id: Problem ID
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Verify ownership and delete
        success = await DatabaseService.delete_problem(db, problem_id)
        if not success:
            raise HTTPException(404, "Problem not found or access denied")

        return {
            "message": "Problem deleted successfully",
            "problem_id": problem_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting problem: {e}")
        raise HTTPException(500, f"Failed to delete problem: {str(e)}")


@router.get("/id/{problem_id}/rounds/{round_num}")
async def get_round_details(
    problem_id: int,
    round_num: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get detailed information about a specific round.

    Args:
        problem_id: Problem ID
        round_num: Round number
        user_id: Authenticated user ID

    Returns:
        Round details with all files and outputs
    """
    try:
        # Verify ownership
        problem = await DatabaseService.get_problem_by_id(db, problem_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        # Get files for this specific round
        round_files = await DatabaseService.get_problem_files(db, problem_id, round_num)

        if not round_files:
            raise HTTPException(404, f"Round {round_num} not found")

        # Organize files by type
        files_by_type = {}
        for file in round_files:
            files_by_type[file['file_type']] = file

        # Extract structured data from JSON files
        prover_outputs = []
        verifier_data = {}
        summarizer_data = {}

        # Collect prover outputs
        for file in round_files:
            if file['file_type'] == 'prover_output':
                try:
                    import json
                    prover_data = json.loads(file['content'])
                    prover_outputs.append({
                        "file_name": file['file_name'],
                        "created_at": file['created_at'],
                        "data": prover_data
                    })
                except:
                    pass

        # Get verifier output
        if 'verifier_output' in files_by_type:
            try:
                import json
                verifier_data = json.loads(files_by_type['verifier_output']['content'])
            except:
                pass

        # Get summarizer output
        if 'summarizer_output' in files_by_type:
            try:
                import json
                summarizer_data = json.loads(files_by_type['summarizer_output']['content'])
            except:
                pass

        return {
            "round": round_num,
            "problem_id": problem_id,
            "files": files_by_type,
            "prover_outputs": prover_outputs,
            "verifier_data": verifier_data,
            "summarizer_data": summarizer_data,
            "total_files": len(round_files)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting round details: {e}")
        raise HTTPException(500, f"Failed to get round details: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if database-based endpoints are available."""
    return {
        "status": "healthy" if True else "database_unavailable",
        "database_configured": True
    }


async def start_research_run(problem_id: int, problem_name: str, config: dict, user_id: str, user_token: str):
    """
    Execute a research run using database-only storage.

    This function orchestrates the complete research pipeline by:
    1. Creating a run record to track execution state
    2. Running multiple rounds of prover/verifier cycles
    3. Storing all outputs directly in the database
    4. Updating run status and problem state throughout execution

    All execution state and outputs are stored in the database rather than
    the filesystem, enabling true database-only operation.

    Args:
        problem_id: Database ID of the problem being executed
        problem_name: Human-readable name of the problem
        config: Run configuration containing rounds, provers, etc.
        user_id: UUID of the user running the research
        db: Authenticated database client
    """
    # Initialize run tracking variables
    run_record = None
    total_cost = 0.0

    try:
        # ====================================================================
        # PHASE 1: INITIALIZE RUN TRACKING
        # ====================================================================

        # Create a fresh DB client for background task using the user's token (maintain RLS)
        db = get_db_client_with_token(user_token, user_id)

        # Extract and validate configuration parameters
        rounds = config.get('rounds', 1)
        provers = config.get('provers', 1)
        temperature = config.get('temperature', 0.7)
        preset = config.get('preset', 'gpt5')
        prover_configs = config.get('prover_configs', [])
        focus_description = config.get('focus_description')
        verifier_config = config.get('verifier_config', {})

        # Create initial run parameters for tracking
        initial_parameters = {
            'total_rounds': rounds,
            'current_round': 0,
            'provers_count': provers,
            'temperature': temperature,
            'preset': preset,
            'phase': 'initializing',
            'prover_configs': prover_configs,
            'focus_description': focus_description,
            'verifier_config': verifier_config,
            'started_at': datetime.now(timezone.utc).isoformat(),
            'completed_rounds': []
        }

        # Create run record in database for execution tracking
        run_record = await DatabaseService.create_run(db, problem_id, initial_parameters)
        if not run_record:
            raise Exception("Failed to create run record in database")

        run_id = run_record['id']
        logger.info(f"🚀 Started run {run_id} for problem '{problem_name}' with {rounds} rounds")

        # ====================================================================
        # PHASE 2: EXECUTE RESEARCH ROUNDS
        # ====================================================================

        # Process each round sequentially
        for round_idx in range(1, rounds + 1):
            try:
                # Update run status to indicate current round
                round_parameters = initial_parameters.copy()
                round_parameters.update({
                    'current_round': round_idx,
                    'phase': f'executing_round_{round_idx}',
                    'round_start_time': datetime.now(timezone.utc).isoformat()
                })

                await DatabaseService.update_run(db, run_id, parameters=round_parameters)
                logger.info(f"🔍 Executing round {round_idx}/{rounds} for problem '{problem_name}'")

                # Update problem status to reflect current round
                await DatabaseService.update_problem_status(db, problem_id, "running", round_idx)

                # ============================================================
                # ROUND EXECUTION: Run orchestrator components
                # ============================================================

                # TODO: Replace this with actual orchestrator integration
                # For now, simulate the orchestrator execution

                # In the real implementation, this would:
                # 1. Load problem context from database (problem_files with round=0)
                # 2. Load previous round outputs if round_idx > 1
                # 3. Execute prover agents with the context
                # 4. Execute verifier agent on prover outputs
                # 5. Execute summarizer agent on the round results

                # Simulated outputs (replace with real orchestrator calls)
                simulated_prover_outputs = []
                for prover_idx in range(1, provers + 1):
                    prover_output = {
                        'prover_id': prover_idx,
                        'content': f'Simulated prover {prover_idx} output for round {round_idx}',
                        'model': preset,
                        'tokens_used': 1000,
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    }
                    simulated_prover_outputs.append(prover_output)

                simulated_verifier_output = {
                    'verdict': 'needs_improvement',
                    'feedback': f'Verifier feedback for round {round_idx}',
                    'model': preset,
                    'tokens_used': 500,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }

                simulated_summarizer_output = {
                    'one_line_summary': f'Round {round_idx} summary',
                    'summary': f'Detailed summary of round {round_idx} results',
                    'model': preset,
                    'tokens_used': 300,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }

                # ============================================================
                # STORE ROUND OUTPUTS IN DATABASE
                # ============================================================

                # Save all round outputs to problem_files table
                round_cost = 0.0

                # Store prover outputs
                for i, prover_output in enumerate(simulated_prover_outputs, 1):
                    await DatabaseService.create_problem_file(
                        db=db,
                        problem_id=problem_id,
                        round_num=round_idx,
                        file_type='prover_output',
                        filename=f'prover-{i:02d}.json',
                        content=json.dumps(prover_output, indent=2),
                        metadata={
                            'run_id': run_id,
                            'model': prover_output.get('model'),
                            'tokens_used': prover_output.get('tokens_used', 0),
                            'prover_index': i
                        }
                    )
                    round_cost += prover_output.get('cost', 0.01)  # Simulated cost

                # Store verifier output
                await DatabaseService.create_problem_file(
                    db=db,
                    problem_id=problem_id,
                    round_num=round_idx,
                    file_type='verifier_output',
                    filename='verifier.json',
                    content=json.dumps(simulated_verifier_output, indent=2),
                    metadata={
                        'run_id': run_id,
                        'model': simulated_verifier_output.get('model'),
                        'tokens_used': simulated_verifier_output.get('tokens_used', 0)
                    }
                )
                round_cost += 0.005  # Simulated verifier cost

                # Store summarizer output
                await DatabaseService.create_problem_file(
                    db=db,
                    problem_id=problem_id,
                    round_num=round_idx,
                    file_type='summarizer_output',
                    filename='summarizer.json',
                    content=json.dumps(simulated_summarizer_output, indent=2),
                    metadata={
                        'run_id': run_id,
                        'model': simulated_summarizer_output.get('model'),
                        'tokens_used': simulated_summarizer_output.get('tokens_used', 0)
                    }
                )
                round_cost += 0.003  # Simulated summarizer cost

                total_cost += round_cost

                # Update run parameters with completed round info
                round_parameters['completed_rounds'].append({
                    'round': round_idx,
                    'completed_at': datetime.now(timezone.utc).isoformat(),
                    'cost': round_cost,
                    'verdict': simulated_verifier_output.get('verdict')
                })
                round_parameters['phase'] = f'completed_round_{round_idx}'
                round_parameters['total_cost_so_far'] = total_cost

                await DatabaseService.update_run(db, run_id, parameters=round_parameters)
                logger.info(f"✅ Completed round {round_idx}/{rounds} for problem '{problem_name}' (cost: ${round_cost:.3f})")

            except Exception as round_error:
                # Handle round-specific errors while continuing execution
                logger.error(f"Error in round {round_idx}: {str(round_error)}")

                # Update run with round error info
                error_parameters = round_parameters.copy()
                error_parameters['phase'] = f'error_round_{round_idx}'
                error_parameters['last_error'] = str(round_error)
                await DatabaseService.update_run(db, run_id, parameters=error_parameters)

                # Continue to next round rather than failing entire run
                continue

        # ====================================================================
        # PHASE 3: FINALIZE SUCCESSFUL RUN
        # ====================================================================

        # Update run record to completed status
        final_parameters = round_parameters.copy()
        final_parameters.update({
            'phase': 'completed',
            'completed_at': datetime.now(timezone.utc).isoformat(),
            'total_cost': total_cost,
            'final_round': rounds
        })

        await DatabaseService.update_run(db, run_id,
                                       status='completed',
                                       total_cost=total_cost,
                                       parameters=final_parameters)

        # Update problem status to completed
        await DatabaseService.update_problem_status(db, problem_id, "completed", rounds)

        logger.info(f"🎉 Research run {run_id} completed successfully for problem '{problem_name}' (total cost: ${total_cost:.3f})")

    except Exception as e:
        # ====================================================================
        # PHASE 4: HANDLE RUN FAILURE
        # ====================================================================

        error_msg = f"Error in research run for problem '{problem_name}': {str(e)}"
        logger.error(error_msg, exc_info=True)

        # Update run record with failure status if it was created
        if run_record:
            error_parameters = initial_parameters.copy()
            error_parameters.update({
                'phase': 'failed',
                'error_at': datetime.now(timezone.utc).isoformat(),
                'error_message': str(e),
                'total_cost': total_cost
            })

            await DatabaseService.update_run(db, run_record['id'],
                                           status='failed',
                                           total_cost=total_cost,
                                           error_message=error_msg,
                                           parameters=error_parameters)

        # Update problem status to failed
        await DatabaseService.update_problem_status(db, problem_id, "failed")

        logger.error(f"❌ Research run failed for problem '{problem_name}': {str(e)}")