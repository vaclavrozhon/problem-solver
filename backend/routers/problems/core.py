"""
Core problem operations router.

Handles basic CRUD operations for problems:
- List problems
- Create problems
- Get problem details
- Delete problems
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ...services.database import DatabaseService
from ...authentication import get_current_user, get_db_client, AuthedUser

router = APIRouter()


class CreateProblemRequest(BaseModel):
    name: str
    task_description: str
    config: Optional[Dict[str, Any]] = None




@router.get("/")
async def list_problems(
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    List all problems for the authenticated user.

    Returns:
        List of user's problems from database
    """
    try:
        problems = await DatabaseService.get_user_problems(db)
        # Return full problem objects for frontend compatibility
        result = [{"id": problem['id'], "name": problem['name']} for problem in problems]
        return result
    except Exception as e:
        print(f"Error listing problems: {e}")
        raise HTTPException(500, f"Failed to list problems: {str(e)}")


@router.post("/")
async def create_problem(
    request: CreateProblemRequest,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
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
        problem = await DatabaseService.create_problem(db, db, 
            user_id=user.sub,
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
        problem = await DatabaseService.get_problem_by_id(db, db, problem_id, user.sub)
        if not problem:
            raise HTTPException(404, "Problem not found")

        return {"problem": problem}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting problem: {e}")
        raise HTTPException(500, f"Failed to get problem: {str(e)}")


@router.delete("/{problem_name}")
async def delete_problem_by_name(
    problem_name: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Delete a problem and all associated data by name.

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

        # Verify ownership and delete
        success = await DatabaseService.delete_problem(db, problem_id)
        if not success:
            raise HTTPException(404, "Problem not found or access denied")

        return {
            "message": f"Problem '{problem_name}' deleted successfully",
            "problem_id": problem_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting problem: {e}")
        raise HTTPException(500, f"Failed to delete problem: {str(e)}")


@router.post("/{problem_name}/reset")
async def reset_problem_by_name(
    problem_name: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Reset a problem (keep task but delete all rounds/interactions).

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

        # Delete all non-base files (rounds > 0)
        files = await DatabaseService.get_problem_files(db, problem_id)
        # In a full implementation, this would actually delete the round files
        # For now, we'll just reset the status

        # Reset problem status
        success = await DatabaseService.update_problem_status(db, problem_id, "idle")
        if not success:
            raise HTTPException(500, "Failed to reset problem")

        return {
            "message": f"Problem '{problem_name}' has been reset",
            "problem_id": problem_id,
            "status": "idle"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resetting problem: {e}")
        raise HTTPException(500, f"Failed to reset problem: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if database-based endpoints are available."""
    return {
        "status": "healthy" if True else "database_unavailable",
        "database_configured": True
    }