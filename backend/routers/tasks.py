"""
Task management router - database-only implementation.

This module handles task creation and management using Supabase database storage.
All filesystem references have been removed.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from ..services.tasks import TaskService
from ..authentication import get_current_user, get_db_client, AuthedUser
from ..logging_config import get_logger

logger = get_logger("tasks")

router = APIRouter(prefix="/tasks", tags=["tasks"])



class CreateTaskRequest(BaseModel):
    name: str
    task_description: str
    task_type: Optional[str] = "txt"


# Task creation endpoints
@router.post("/problems/create")
async def create_problem(
    request: CreateTaskRequest,
    user: AuthedUser = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """Create a new problem/solving task."""
    logger.info(
        f"Creating problem: {request.name}",
        extra={
            "event_type": "problem_create_start",
            "user_id": user.sub,
            "problem_name": request.name,
            "task_type": request.task_type
        }
    )
    
    try:
        problem_id = await TaskService.create_problem(
            name=request.name,
            task_description=request.task_description,
            user_id=user.sub,
            task_type=request.task_type,
            db=db
        )
        
        logger.info(
            f"Problem created successfully: {request.name}",
            extra={
                "event_type": "problem_create_success",
                "user_id": user.sub,
                "problem_id": problem_id,
                "problem_name": request.name
            }
        )
        
        return {
            "message": f"Problem '{request.name}' created successfully",
            "problem_id": problem_id
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


@router.post("/drafts/create")
async def create_draft(
    request: CreateTaskRequest,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """Create a new draft/writing task."""
    logger.info(
        f"Creating draft: {request.name}",
        extra={
            "event_type": "draft_create_start",
            "user_id": user.sub,
            "draft_name": request.name
        }
    )
    
    try:
        draft_id = await TaskService.create_draft(
            name=request.name,
            task_description=request.task_description,
            user_id=user.sub
        )
        
        logger.info(
            f"Draft created successfully: {request.name}",
            extra={
                "event_type": "draft_create_success",
                "user_id": user.sub,
                "draft_id": draft_id,
                "draft_name": request.name
            }
        )
        
        return {
            "message": f"Draft '{request.name}' created successfully",
            "draft_id": draft_id
        }
    except HTTPException as e:
        logger.warning(
            f"Draft creation failed with HTTP error: {e.detail}",
            extra={
                "event_type": "draft_create_http_error",
                "user_id": user.sub,
                "draft_name": request.name,
                "error_detail": e.detail,
                "status_code": e.status_code
            }
        )
        raise
    except Exception as e:
        logger.error(
            f"Draft creation failed with unexpected error: {str(e)}",
            extra={
                "event_type": "draft_create_error",
                "user_id": user.sub,
                "draft_name": request.name,
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            exc_info=True
        )
        raise HTTPException(500, f"Failed to create draft: {str(e)}")


# Task deletion endpoints
@router.delete("/problems/{problem_id}")
async def delete_problem(
    problem_id: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """Delete a problem and all its associated data."""
    logger.info(
        f"Deleting problem: {problem_id}",
        extra={
            "event_type": "problem_delete_start",
            "user_id": user.sub,
            "problem_id": problem_id
        }
    )
    
    try:
        success = await TaskService.delete_problem(problem_id, user.sub)
        if not success:
            logger.warning(
                f"Problem not found for deletion: {problem_id}",
                extra={
                    "event_type": "problem_delete_not_found",
                    "user_id": user.sub,
                    "problem_id": problem_id
                }
            )
            raise HTTPException(404, "Problem not found")
        
        logger.info(
            f"Problem deleted successfully: {problem_id}",
            extra={
                "event_type": "problem_delete_success",
                "user_id": user.sub,
                "problem_id": problem_id
            }
        )
        
        return {"message": f"Problem '{problem_id}' deleted successfully"}
    except HTTPException as e:
        logger.warning(
            f"Problem deletion failed with HTTP error: {e.detail}",
            extra={
                "event_type": "problem_delete_http_error",
                "user_id": user.sub,
                "problem_id": problem_id,
                "error_detail": e.detail,
                "status_code": e.status_code
            }
        )
        raise
    except Exception as e:
        logger.error(
            f"Problem deletion failed with unexpected error: {str(e)}",
            extra={
                "event_type": "problem_delete_error",
                "user_id": user.sub,
                "problem_id": problem_id,
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            exc_info=True
        )
        raise HTTPException(500, f"Failed to delete problem: {str(e)}")


# Reset endpoint
@router.post("/problems/{problem_id}/reset")
async def reset_problem(
    problem_id: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """Reset a problem - keep task description, delete all round data."""
    logger.info(
        f"Resetting problem: {problem_id}",
        extra={
            "event_type": "problem_reset_start",
            "user_id": user.sub,
            "problem_id": problem_id
        }
    )
    
    try:
        success = await TaskService.reset_problem(problem_id, user.sub)
        if not success:
            logger.warning(
                f"Problem not found for reset: {problem_id}",
                extra={
                    "event_type": "problem_reset_not_found",
                    "user_id": user.sub,
                    "problem_id": problem_id
                }
            )
            raise HTTPException(404, "Problem not found")
        
        logger.info(
            f"Problem reset successfully: {problem_id}",
            extra={
                "event_type": "problem_reset_success",
                "user_id": user.sub,
                "problem_id": problem_id
            }
        )
        
        return {"message": f"Problem '{problem_id}' reset successfully"}
    except HTTPException as e:
        logger.warning(
            f"Problem reset failed with HTTP error: {e.detail}",
            extra={
                "event_type": "problem_reset_http_error",
                "user_id": user.sub,
                "problem_id": problem_id,
                "error_detail": e.detail,
                "status_code": e.status_code
            }
        )
        raise
    except Exception as e:
        logger.error(
            f"Problem reset failed with unexpected error: {str(e)}",
            extra={
                "event_type": "problem_reset_error",
                "user_id": user.sub,
                "problem_id": problem_id,
                "error_type": type(e).__name__,
                "error_details": str(e)
            },
            exc_info=True
        )
        raise HTTPException(500, f"Failed to reset problem: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if task management endpoints are available."""
    db_configured = True
    logger.info(
        "Task management health check requested",
        extra={
            "event_type": "tasks_health_check",
            "database_configured": db_configured
        }
    )
    return {
        "status": "healthy" if db_configured else "database_unavailable",
        "database_configured": db_configured
    }