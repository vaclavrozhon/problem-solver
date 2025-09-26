"""
Problem file management router.

Handles file operations for problems:
- List files
- Get file content
- Get file versions
- Update files
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ...services.database import DatabaseService
from ...authentication import get_current_user, get_db_client, AuthedUser

router = APIRouter()


class UpdateFileRequest(BaseModel):
    content: str
    description: Optional[str] = None


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
        print(f"Error getting files: {e}")
        raise HTTPException(500, f"Failed to get files: {str(e)}")


@router.get("/{problem_name}/file")
async def get_problem_file_content(
    problem_name: str,
    file_path: str,
    version: Optional[str] = None,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get content of a specific file from a problem.

    Args:
        problem_name: Problem name
        file_path: Path/name of the file
        version: Optional version identifier
        user_id: Authenticated user ID

    Returns:
        File content
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # For now, we'll treat file_path as file_type and return the most recent version
        # In a full implementation, this would handle actual file paths and versions
        files = await DatabaseService.get_problem_files(db, problem_id, file_type=file_path)

        if not files:
            raise HTTPException(404, f"File '{file_path}' not found")

        # Return the most recent file (highest round number)
        latest_file = max(files, key=lambda f: f['round'])

        return {
            "content": latest_file['content'],
            "file_name": latest_file['file_name'],
            "file_type": latest_file['file_type'],
            "round": latest_file['round'],
            "created_at": latest_file['created_at']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting file content: {e}")
        raise HTTPException(500, f"Failed to get file content: {str(e)}")


@router.get("/{problem_name}/file-versions")
async def get_problem_file_versions(
    problem_name: str,
    file_path: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get all versions of a specific file from a problem.

    Args:
        problem_name: Problem name
        file_path: Path/name of the file
        user_id: Authenticated user ID

    Returns:
        List of file versions
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Get all versions of this file (different rounds)
        files = await DatabaseService.get_problem_files(db, problem_id, file_type=file_path)

        if not files:
            raise HTTPException(404, f"File '{file_path}' not found")

        # Return metadata for all versions, sorted by round
        versions = sorted([{
            "version": f"round-{f['round']}" if f['round'] > 0 else "base",
            "round": f['round'],
            "created_at": f['created_at'],
            "file_name": f['file_name'],
            "size": len(f['content']) if f['content'] else 0
        } for f in files], key=lambda v: v['round'])

        return {
            "file_path": file_path,
            "versions": versions,
            "total_versions": len(versions)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting file versions: {e}")
        raise HTTPException(500, f"Failed to get file versions: {str(e)}")


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
        # Verify ownership (RLS enforces ownership on select)
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
        print(f"Error updating file: {e}")
        raise HTTPException(500, f"Failed to update file: {str(e)}")