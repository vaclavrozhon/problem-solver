"""
Core problem operations router.

Handles basic CRUD operations for problems:
- List problems
- Create problems
- Get problem details
- Delete problems
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel

from ...services.database import DatabaseService
from ...db import get_current_user_id, is_database_configured

router = APIRouter()


class CreateProblemRequest(BaseModel):
    name: str
    task_description: str
    config: Optional[Dict[str, Any]] = None


async def get_authenticated_user(authorization: str = Header(..., alias="Authorization")) -> str:
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


@router.get("/")
async def list_problems(
    authorization: str = Header(..., alias="Authorization"),
    user_id: str = Depends(get_authenticated_user)
):
    """
    List all problems for the authenticated user.

    Returns:
        List of user's problems from database
    """
    try:
        # Extract token for authenticated database queries
        token = None
        if authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix

        problems = await DatabaseService.get_user_problems(user_id, token)
        # Return full problem objects for frontend compatibility
        result = [{"id": problem['id'], "name": problem['name']} for problem in problems]
        return result
    except Exception as e:
        print(f"Error listing problems: {e}")
        raise HTTPException(500, f"Failed to list problems: {str(e)}")


@router.post("/")
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


@router.delete("/{problem_name}")
async def delete_problem_by_name(
    problem_name: str,
    authorization: str = Header(..., alias="Authorization"),
    user_id: str = Depends(get_authenticated_user)
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
        # Extract token for authenticated database queries
        token = None
        if authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix

        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(user_id, problem_name, token)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Verify ownership and delete
        success = await DatabaseService.delete_problem(problem_id, user_id)
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
    authorization: str = Header(..., alias="Authorization"),
    user_id: str = Depends(get_authenticated_user)
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
        # Extract token for authenticated database queries
        token = None
        if authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix

        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(user_id, problem_name, token)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Delete all non-base files (rounds > 0)
        files = await DatabaseService.get_problem_files(problem_id)
        # In a full implementation, this would actually delete the round files
        # For now, we'll just reset the status

        # Reset problem status
        success = await DatabaseService.update_problem_status(problem_id, "idle", token)
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
        "status": "healthy" if is_database_configured() else "database_unavailable",
        "database_configured": is_database_configured()
    }