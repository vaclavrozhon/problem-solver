"""
Public problem endpoints for unauthenticated access.
This provides backward compatibility with the existing frontend API.
"""

import os
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import List

# Get the problems root directory
REPO_PROBLEMS_ROOT = Path(os.environ.get("AR_DATA_ROOT", "./data"))

router = APIRouter(prefix="/problems_public", tags=["public-problems"])

@router.get("", response_model=List[str])
def list_problems_public():
    """List all problems (public endpoint for backward compatibility)."""
    try:
        if not REPO_PROBLEMS_ROOT.exists():
            return []

        problems = []
        for problem_dir in REPO_PROBLEMS_ROOT.iterdir():
            if problem_dir.is_dir() and not problem_dir.name.startswith('.'):
                problems.append(problem_dir.name)

        return sorted(problems, reverse=True)
    except Exception as e:
        raise HTTPException(500, f"Failed to list problems: {str(e)}")

@router.get("/{problem}/status")
def get_problem_status_public(problem: str):
    """Get problem status (public endpoint)."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")

    try:
        # Return a minimal status for public access
        return {
            "overall": {
                "phase": "idle",
                "current_round": 0,
                "is_running": False,
                "last_round_completed": True,
                "remaining_rounds": 0,
                "timestamp": 0
            },
            "rounds": [],
            "models": {}
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to get problem status: {str(e)}")

@router.get("/{problem}/rounds")
def get_problem_rounds_public(problem: str):
    """Get rounds data for a problem (public endpoint)."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")

    return []

@router.get("/{problem}/files")
def get_problem_files_public(problem: str):
    """Get files for a problem (public endpoint)."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")

    return []