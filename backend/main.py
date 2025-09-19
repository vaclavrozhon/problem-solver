"""
Main FastAPI application entry point.

This module sets up the FastAPI application with CORS middleware and includes
all the modular routers for different functionality areas.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

# Import modular routers
try:
    from .routers.problems import router as problems_router
    from .routers.drafts import router as drafts_router
    from .routers.auth import router as auth_router
    from .routers.tasks import router as tasks_router
    from .config import is_database_configured
except ImportError:
    from backend.routers.problems import router as problems_router
    from backend.routers.drafts import router as drafts_router
    from backend.routers.auth import router as auth_router
    from backend.routers.tasks import router as tasks_router
    from backend.config import is_database_configured

app = FastAPI(title="Automatic Researcher Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routers
app.include_router(problems_router)
app.include_router(drafts_router)
app.include_router(auth_router)
app.include_router(tasks_router)


# Health check endpoints (must be before catch-all frontend route)
@app.get("/healthz")
def healthz():
    """Liveness probe."""
    return {"status": "ok"}

@app.get("/readyz")
def readyz():
    """Readiness probe (basic)."""
    return {"ready": True}

@app.get("/")
def root():
    """API information and storage mode."""
    db_configured = is_database_configured()
    return {
        "service": "Automatic Researcher Backend",
        "storage_mode": "database" if db_configured else "database_not_configured",
        "endpoints": {
            "problems": "/problems (auth required)" if db_configured else "unavailable (database not configured)",
            "drafts": "/drafts (auth required)" if db_configured else "unavailable (database not configured)",
            "docs": "/docs",
            "health": "/healthz"
        },
        "database_configured": db_configured,
        "note": "All operations require database configuration and authentication"
    }

# Serve React frontend static files
FRONTEND_BUILD_DIR = Path("frontend/dist")
if FRONTEND_BUILD_DIR.exists():
    print("✅ Frontend build found, serving static files")
    # Mount static files
    app.mount("/assets", StaticFiles(directory=FRONTEND_BUILD_DIR / "assets"), name="assets")

    # Serve index.html for all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't serve frontend for API routes
        if full_path.startswith(("api/", "problems/", "drafts/", "auth/", "tasks/", "docs", "redoc", "openapi.json", "healthz")):
            raise HTTPException(404, "Not found")

        index_file = FRONTEND_BUILD_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        else:
            raise HTTPException(404, "Frontend not built")
else:
    print("⚠️  Frontend build directory not found, serving API only")
