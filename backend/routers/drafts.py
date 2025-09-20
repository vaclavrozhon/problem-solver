"""
Drafts router - database-only implementation.

This module handles all endpoints related to paper writing, draft management,
status tracking, and file operations using Supabase database storage.

Drafts are stored as problems with type='draft' in the config.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..services.database import DatabaseService
from ..services.tasks import TaskService
from ..authentication import get_current_user, get_db_client, AuthedUser, is_database_configured

router = APIRouter(prefix="/drafts", tags=["drafts"])


class CreateDraftRequest(BaseModel):
    name: str
    task_description: str
    initial_draft: Optional[str] = None


class UpdateDraftRequest(BaseModel):
    content: str
    description: Optional[str] = None




@router.get("")
async def list_drafts(user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)):
    """
    List all drafts for the authenticated user.

    Returns:
        List of user's drafts from database
    """
    try:
        # Get all problems and filter for drafts
        all_problems = await DatabaseService.get_user_problems(db)
        drafts = [
            problem for problem in all_problems
            if problem.get('config', {}).get('type') == 'draft'
        ]

        return {
            "drafts": drafts,
            "total": len(drafts)
        }
    except Exception as e:
        print(f"Error listing drafts: {e}")
        raise HTTPException(500, f"Failed to list drafts: {str(e)}")


@router.post("")
async def create_draft(
    request: CreateDraftRequest,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Create a new draft for the authenticated user.

    Args:
        request: Draft creation request
        user_id: Authenticated user ID

    Returns:
        Created draft record
    """
    try:
        draft_id = await TaskService.create_draft(
            name=request.name,
            task_description=request.task_description,
            user_id=user.sub
        )

        # If initial draft content provided, update the tex file
        if request.initial_draft:
            await DatabaseService.update_problem_file(db, 
                problem_id=int(draft_id),
                file_type='draft_tex',
                content=request.initial_draft,
                round=0
            )

        # Get the created draft
        draft = await DatabaseService.get_problem_by_id(db, int(draft_id), user.sub)

        return {
            "draft": draft,
            "message": f"Draft '{request.name}' created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating draft: {e}")
        raise HTTPException(500, f"Failed to create draft: {str(e)}")


@router.get("/{draft_id}")
async def get_draft(
    draft_id: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get a specific draft by ID.

    Args:
        draft_id: Draft ID
        user_id: Authenticated user ID

    Returns:
        Draft details with files
    """
    try:
        draft = await DatabaseService.get_problem_by_id(db, draft_id, user.sub)
        if not draft:
            raise HTTPException(404, "Draft not found")

        # Verify it's actually a draft
        if draft.get('config', {}).get('type') != 'draft':
            raise HTTPException(404, "Not a draft")

        # Get all files for this draft
        files = await DatabaseService.get_problem_files(db, draft_id)

        return {
            "draft": draft,
            "files": files
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting draft: {e}")
        raise HTTPException(500, f"Failed to get draft: {str(e)}")


@router.get("/{draft_id}/status")
async def get_draft_status(
    draft_id: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get detailed status for a draft including writing rounds.

    Args:
        draft_id: Draft ID
        user_id: Authenticated user ID

    Returns:
        Draft status with rounds and recent activity
    """
    try:
        # Verify ownership and that it's a draft
        draft = await DatabaseService.get_problem_by_id(db, draft_id, user.sub)
        if not draft:
            raise HTTPException(404, "Draft not found")

        if draft.get('config', {}).get('type') != 'draft':
            raise HTTPException(404, "Not a draft")

        # Get all files to analyze writing rounds
        files = await DatabaseService.get_problem_files(db, draft_id)

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

        # Determine if currently running
        is_running = draft['status'] == 'running'

        return {
            "draft": draft,
            "overall": {
                "phase": draft['status'],
                "current_round": draft['current_round'],
                "is_running": is_running,
                "total_rounds": len(rounds),
                "last_updated": draft['updated_at']
            },
            "rounds": rounds,
            "base_files": base_files
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting draft status: {e}")
        raise HTTPException(500, f"Failed to get draft status: {str(e)}")


@router.put("/{draft_id}/content")
async def update_draft_content(
    draft_id: int,
    request: UpdateDraftRequest,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Update the main draft content (LaTeX).

    Args:
        draft_id: Draft ID
        request: Update request with content
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Verify ownership and that it's a draft
        draft = await DatabaseService.get_problem_by_id(db, draft_id, user.sub)
        if not draft:
            raise HTTPException(404, "Draft not found")

        if draft.get('config', {}).get('type') != 'draft':
            raise HTTPException(404, "Not a draft")

        success = await DatabaseService.update_problem_file(db, 
            problem_id=draft_id,
            file_type='draft_tex',
            content=request.content,
            round=0
        )

        if not success:
            raise HTTPException(500, "Failed to update draft content")

        return {
            "message": "Draft content updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating draft content: {e}")
        raise HTTPException(500, f"Failed to update draft content: {str(e)}")


@router.delete("/{draft_id}")
async def delete_draft(
    draft_id: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Delete a draft and all associated data.

    Args:
        draft_id: Draft ID
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Verify it's a draft before deleting
        draft = await DatabaseService.get_problem_by_id(db, draft_id, user.sub)
        if not draft:
            raise HTTPException(404, "Draft not found")

        if draft.get('config', {}).get('type') != 'draft':
            raise HTTPException(404, "Not a draft")

        success = await DatabaseService.delete_problem(db, draft_id, user.sub)
        if not success:
            raise HTTPException(404, "Draft not found or access denied")

        return {
            "message": "Draft deleted successfully",
            "draft_id": draft_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting draft: {e}")
        raise HTTPException(500, f"Failed to delete draft: {str(e)}")


@router.get("/{draft_id}/files/{file_type}")
async def get_draft_file(
    draft_id: int,
    file_type: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get a specific file from a draft.

    Args:
        draft_id: Draft ID
        file_type: Type of file to retrieve
        user_id: Authenticated user ID

    Returns:
        File content
    """
    try:
        # Verify ownership and that it's a draft
        draft = await DatabaseService.get_problem_by_id(db, draft_id, user.sub)
        if not draft:
            raise HTTPException(404, "Draft not found")

        if draft.get('config', {}).get('type') != 'draft':
            raise HTTPException(404, "Not a draft")

        files = await DatabaseService.get_problem_files(db, draft_id, round=0, file_type=file_type)

        if not files:
            raise HTTPException(404, f"File '{file_type}' not found")

        return {
            "file": files[0],
            "content": files[0]['content']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting draft file: {e}")
        raise HTTPException(500, f"Failed to get draft file: {str(e)}")


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if database-based endpoints are available."""
    return {
        "status": "healthy" if is_database_configured() else "database_unavailable",
        "database_configured": is_database_configured()
    }