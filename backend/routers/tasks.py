"""
API routes for task creation and paper management.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List

from ..models import NewTaskPayload, PaperUrlPayload
from ..services.tasks import TaskService, PaperService

router = APIRouter()

# Task creation endpoints
@router.post("/problems_public/create")
def create_problem(payload: NewTaskPayload):
    """Create a new problem/solving task"""
    task_name = TaskService.create_problem(payload.name, payload.task_description, payload.task_type)
    return {"message": f"Problem '{task_name}' created successfully", "name": task_name}

@router.post("/drafts_public/create")
def create_draft(payload: NewTaskPayload):
    """Create a new draft/writing task"""
    task_name = TaskService.create_draft(payload.name, payload.task_description)
    return {"message": f"Draft '{task_name}' created successfully", "name": task_name}

# Task deletion endpoints
@router.delete("/problems_public/{problem}")
def delete_problem(problem: str):
    """Delete a problem and all its associated data"""
    TaskService.delete_problem(problem)
    return {"message": f"Problem '{problem}' deleted successfully"}

@router.delete("/drafts_public/{draft}")
def delete_draft(draft: str):
    """Delete a draft and all its associated data"""
    TaskService.delete_draft(draft)
    return {"message": f"Draft '{draft}' deleted successfully"}

# Paper upload endpoints
@router.post("/problems_public/{problem}/papers/upload")
async def upload_problem_paper(problem: str, file: UploadFile = File(...), description: str = ""):
    """Upload a paper PDF to a problem"""
    filename = await PaperService.upload_problem_paper(problem, file, description)
    return {"message": f"Paper '{filename}' uploaded successfully"}

@router.post("/drafts_public/{draft}/papers/upload")
async def upload_draft_paper(draft: str, file: UploadFile = File(...), description: str = ""):
    """Upload a paper PDF to a draft"""
    filename = await PaperService.upload_draft_paper(draft, file, description)
    return {"message": f"Paper '{filename}' uploaded successfully"}

# Paper URL endpoints
@router.post("/problems_public/{problem}/papers/from-url")
def add_problem_paper_from_url(problem: str, payload: PaperUrlPayload):
    """Download and add a paper from URL to a problem"""
    filename = PaperService.add_problem_paper_from_url(problem, payload.url)
    return {"message": f"Paper downloaded as '{filename}'", "filename": filename}

@router.post("/drafts_public/{draft}/papers/from-url")  
def add_draft_paper_from_url(draft: str, payload: PaperUrlPayload):
    """Download and add a paper from URL to a draft"""
    filename = PaperService.add_draft_paper_from_url(draft, payload.url)
    return {"message": f"Paper downloaded as '{filename}'", "filename": filename}