"""
Problems router package.

Modular router for problem management, split into focused sub-modules:
- core: Basic CRUD operations (list, create, get, delete)
- execution: Running and stopping problems, status management
- files: File management and content operations
- rounds: Round-specific operations and management
"""

from fastapi import APIRouter
from . import core, execution, files, rounds, papers

# Create the main problems router
router = APIRouter(prefix="/problems", tags=["problems"])

# Include all sub-routers
router.include_router(core.router)
router.include_router(execution.router)
router.include_router(files.router)
router.include_router(rounds.router)
router.include_router(papers.router)

# Export the combined router
__all__ = ["router"]