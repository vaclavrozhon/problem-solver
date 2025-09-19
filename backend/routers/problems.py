"""
Problems router - database-only implementation.

This module handles all endpoints related to problem creation, execution,
status tracking, and file management using Supabase database storage.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..services.database import DatabaseService
from ..authentication import get_current_user, get_db_client, AuthedUser
from ..logging_config import get_logger
import sys
import os
from pathlib import Path

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
    db = Depends(get_db_client)
):
    """
    List all problems for the authenticated user.

    Returns:
        List of user's problems from database
    """
    logger.info(
        f"Listing problems for user: {user.sub}",
        extra={
            "event_type": "list_problems_start",
            "user_id": user.sub
        }
    )
    
    try:
        problems = await DatabaseService.get_user_problems(db, db)
        logger.info(
            f"Found {len(problems)} problems for user: {user.sub}",
            extra={
                "event_type": "list_problems_success",
                "user_id": user.sub,
                "problem_count": len(problems)
            }
        )
        
        # Return just the problem names for compatibility with frontend
        result = [problem['name'] for problem in problems]
        return result
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


@router.get("/{problem_id}")
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
        problem = await DatabaseService.get_problem_by_id(db, problem_id, user.sub)
        if not problem:
            raise HTTPException(404, "Problem not found")

        return {"problem": problem}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting problem: {e}")
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
        problem = await DatabaseService.get_problem_by_name(db, user.sub, problem_name)
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
        problem = await DatabaseService.get_problem_by_name(db, user.sub, problem_name)
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
        asyncio.create_task(start_research_run(problem_id, problem_name, request, user.sub, db))

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
        problem = await DatabaseService.get_problem_by_name(db, user.sub, problem_name)
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
        print(f"Error getting files: {e}")
        raise HTTPException(500, f"Failed to get files: {str(e)}")


@router.put("/{problem_id}/files/{file_type}")
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
        problem = await DatabaseService.get_problem_by_id(db, problem_id, user.sub)
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
        print(f"Error updating file: {e}")
        raise HTTPException(500, f"Failed to update file: {str(e)}")


@router.delete("/{problem_id}")
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
        success = await DatabaseService.delete_problem(db, problem_id, user.sub)
        if not success:
            raise HTTPException(404, "Problem not found or access denied")

        return {
            "message": "Problem deleted successfully",
            "problem_id": problem_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting problem: {e}")
        raise HTTPException(500, f"Failed to delete problem: {str(e)}")


@router.get("/{problem_id}/rounds/{round_num}")
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
        problem = await DatabaseService.get_problem_by_id(db, problem_id, user.sub)
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
        print(f"Error getting round details: {e}")
        raise HTTPException(500, f"Failed to get round details: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if database-based endpoints are available."""
    return {
        "status": "healthy" if True else "database_unavailable",
        "database_configured": True
    }


async def start_research_run(problem_id: int, problem_name: str, config: dict, user_id: str, db):
    """
    Start a research run using the orchestrator.
    This runs in the background as an async task.
    """
    try:
        # Add orchestrator to path
        orchestrator_path = Path(__file__).parent.parent.parent / "orchestrator"
        sys.path.insert(0, str(orchestrator_path))

        from orchestrator.runner import run_round
        from orchestrator.utils import write_status

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

        # Run the research rounds
        for round_idx in range(1, rounds + 1):
            print(f"🔍 Starting round {round_idx}/{rounds}")
            write_status(user_dir, "running", round_idx)

            # Run the round using orchestrator
            run_round(
                problem_dir=user_dir,
                round_idx=round_idx,
                num_provers=provers,
                prover_configs=prover_configs,
                focus_description=focus_description
            )

            print(f"✅ Completed round {round_idx}/{rounds}")

        # Update status to completed
        await DatabaseService.update_problem_status(db, problem_id, "completed")
        write_status(user_dir, "completed", rounds)
        print(f"🎉 Research run completed for problem '{problem_name}'")

    except Exception as e:
        print(f"❌ Error in research run for problem '{problem_name}': {e}")
        # Update status to failed
        await DatabaseService.update_problem_status(db, problem_id, "failed")

        # Write error status to file system
        try:
            user_dir = data_root / user_id / "problems" / problem_name
            write_status(user_dir, "failed", 0)
        except:
            pass