"""
Task management router - database-only implementation.

This module handles task creation and management using Supabase database storage.
All filesystem references have been removed.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional

from ..services.tasks import TaskService
from ..db import get_current_user_id, is_database_configured

router = APIRouter(prefix="/tasks", tags=["tasks"])

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


class CreateTaskRequest(BaseModel):
    name: str
    task_description: str
    task_type: Optional[str] = "txt"


# Task creation endpoints
@router.post("/problems/create")
async def create_problem(
    request: CreateTaskRequest,
    authorization: str = Header(...),
    user_id: str = Depends(get_authenticated_user)
):
    """Create a new problem/solving task."""
    try:
        # Extract token from "Bearer <token>" format
        auth_token = None
        if authorization.startswith("Bearer "):
            auth_token = authorization[7:]

        problem_id = await TaskService.create_problem(
            name=request.name,
            task_description=request.task_description,
            user_id=user_id,
            task_type=request.task_type,
            auth_token=auth_token
        )
        return {
            "message": f"Problem '{request.name}' created successfully",
            "problem_id": problem_id
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating problem: {e}")
        raise HTTPException(500, f"Failed to create problem: {str(e)}")


@router.post("/drafts/create")
async def create_draft(
    request: CreateTaskRequest,
    user_id: str = Depends(get_authenticated_user)
):
    """Create a new draft/writing task."""
    try:
        draft_id = await TaskService.create_draft(
            name=request.name,
            task_description=request.task_description,
            user_id=user_id
        )
        return {
            "message": f"Draft '{request.name}' created successfully",
            "draft_id": draft_id
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating draft: {e}")
        raise HTTPException(500, f"Failed to create draft: {str(e)}")


# Task deletion endpoints
@router.delete("/problems/{problem_id}")
async def delete_problem(
    problem_id: str,
    user_id: str = Depends(get_authenticated_user)
):
    """Delete a problem and all its associated data."""
    try:
        success = await TaskService.delete_problem(problem_id, user_id)
        if not success:
            raise HTTPException(404, "Problem not found")
        return {"message": f"Problem '{problem_id}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting problem: {e}")
        raise HTTPException(500, f"Failed to delete problem: {str(e)}")


# Reset endpoint
@router.post("/problems/{problem_id}/reset")
async def reset_problem(
    problem_id: int,
    user_id: str = Depends(get_authenticated_user)
):
    """Reset a problem - keep task description, delete all round data."""
    try:
        success = await TaskService.reset_problem(problem_id, user_id)
        if not success:
            raise HTTPException(404, "Problem not found")
        return {"message": f"Problem '{problem_id}' reset successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resetting problem: {e}")
        raise HTTPException(500, f"Failed to reset problem: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if task management endpoints are available."""
    return {
        "status": "healthy" if is_database_configured() else "database_unavailable",
        "database_configured": is_database_configured()
    }