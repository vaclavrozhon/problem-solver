"""
Problems router - database-only implementation.

This module handles all endpoints related to problem creation, execution,
status tracking, and file management using Supabase database storage.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel

from ..services.database import DatabaseService
from ..db import get_current_user_id, is_database_configured

router = APIRouter(prefix="/problems", tags=["problems"])


class CreateProblemRequest(BaseModel):
    name: str
    task_description: str
    config: Optional[Dict[str, Any]] = None


class UpdateFileRequest(BaseModel):
    content: str
    description: Optional[str] = None


async def get_authenticated_user(authorization: str = Header(...)) -> str:
    """
    Dependency to get authenticated user ID from Authorization header.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        User ID

    Raises:
        HTTPException: If not authenticated or database not configured
    """
    if not is_database_configured():
        raise HTTPException(503, "Database not configured")

    # Extract token from "Bearer <token>" format
    token = None
    if authorization.startswith("Bearer "):
        token = authorization[7:]  # Remove "Bearer " prefix

    user_id = await get_current_user_id(token)
    if not user_id:
        raise HTTPException(401, "Authentication required")

    return user_id


@router.get("")
async def list_problems(user_id: str = Depends(get_authenticated_user)):
    """
    List all problems for the authenticated user.

    Returns:
        List of user's problems from database
    """
    try:
        problems = await DatabaseService.get_user_problems(user_id)
        return {
            "problems": problems,
            "total": len(problems)
        }
    except Exception as e:
        print(f"Error listing problems: {e}")
        raise HTTPException(500, f"Failed to list problems: {str(e)}")


@router.post("")
async def create_problem(
    request: CreateProblemRequest,
    user_id: str = Depends(get_authenticated_user)
):
    """
    Create a new problem for the authenticated user.

    Args:
        request: Problem creation request
        user_id: Authenticated user ID

    Returns:
        Created problem record
    """
    try:
        problem = await DatabaseService.create_problem(
            user_id=user_id,
            name=request.name,
            task_description=request.task_description,
            config=request.config
        )
        return {
            "problem": problem,
            "message": f"Problem '{request.name}' created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating problem: {e}")
        raise HTTPException(500, f"Failed to create problem: {str(e)}")


@router.get("/{problem_id}")
async def get_problem(
    problem_id: int,
    user_id: str = Depends(get_authenticated_user)
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
        problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        return {"problem": problem}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting problem: {e}")
        raise HTTPException(500, f"Failed to get problem: {str(e)}")


@router.get("/{problem_id}/status")
async def get_problem_status(
    problem_id: int,
    user_id: str = Depends(get_authenticated_user)
):
    """
    Get detailed status for a problem including rounds and files.

    Args:
        problem_id: Problem ID
        user_id: Authenticated user ID

    Returns:
        Problem status with rounds and recent activity
    """
    try:
        # Verify ownership
        problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        # Get all files to analyze rounds
        files = await DatabaseService.get_problem_files(problem_id)

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


@router.get("/{problem_id}/files")
async def get_problem_files(
    problem_id: int,
    round: Optional[int] = None,
    file_type: Optional[str] = None,
    user_id: str = Depends(get_authenticated_user)
):
    """
    Get files for a problem, optionally filtered by round and type.

    Args:
        problem_id: Problem ID
        round: Optional round number filter
        file_type: Optional file type filter
        user_id: Authenticated user ID

    Returns:
        List of matching files
    """
    try:
        # Verify ownership
        problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        files = await DatabaseService.get_problem_files(problem_id, round, file_type)
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
    user_id: str = Depends(get_authenticated_user)
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
        problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        success = await DatabaseService.update_problem_file(
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
    user_id: str = Depends(get_authenticated_user)
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
        success = await DatabaseService.delete_problem(problem_id, user_id)
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
    user_id: str = Depends(get_authenticated_user)
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
        problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        # Get files for this specific round
        round_files = await DatabaseService.get_problem_files(problem_id, round_num)

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
        "status": "healthy" if is_database_configured() else "database_unavailable",
        "database_configured": is_database_configured()
    }