"""
Main FastAPI application entry point.

This module sets up the FastAPI application with CORS middleware and includes
all the modular routers for different functionality areas.
"""

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Import logging configuration
from .logging_config import setup_logging
from .middleware import RequestLoggingMiddleware
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logger = setup_logging()

# Import modular routers
try:
    from .authentication import is_database_configured
    from .routers.problems import router as problems_router
    from .routers.profile import router as profile_router
    from .routers.tasks import router as tasks_router
except ImportError:
    from backend.authentication import is_database_configured
    from backend.routers.problems import router as problems_router
    from backend.routers.profile import router as profile_router
    from backend.routers.tasks import router as tasks_router

app = FastAPI(title="Automatic Researcher Jara Cimrman Backend")

# Add custom middleware (order matters - first added is outermost)
app.add_middleware(RequestLoggingMiddleware)

# CORS middleware
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routers
app.include_router(problems_router)
app.include_router(profile_router)
app.include_router(tasks_router)


# Health check endpoints (must be before catch-all frontend route)
@app.get("/healthz")
def healthz():
    """Liveness probe."""
    logger.info("Health check requested", extra={"event_type": "health_check"})
    return {"status": "ok"}


@app.get("/readyz")
def readyz():
    """Readiness probe (basic)."""
    db_configured = is_database_configured()
    logger.info(
        "Readiness check requested",
        extra={"event_type": "readiness_check", "database_configured": db_configured},
    )
    return {"ready": True, "database_configured": db_configured}


@app.get("/api/info")
def api_info():
    """API information and storage mode."""
    db_configured = is_database_configured()
    logger.info(
        "API info endpoint accessed",
        extra={"event_type": "api_info_access", "database_configured": db_configured},
    )
    return {
        "service": "Automatic Researcher Backend",
        "storage_mode": "database" if db_configured else "database_not_configured",
        "endpoints": {
            "problems": "/problems (auth required)"
            if db_configured
            else "unavailable (database not configured)",
            "drafts": "/drafts (auth required)"
            if db_configured
            else "unavailable (database not configured)",
            "docs": "/docs",
            "health": "/healthz",
        },
        "database_configured": db_configured,
        "note": "All operations require database configuration and authentication",
    }


# Serve React frontend static files
FRONTEND_BUILD_DIR = Path("frontend/dist")
if FRONTEND_BUILD_DIR.exists():
    logger.info(
        "Frontend build found, serving static files",
        extra={"event_type": "frontend_mount"},
    )
    # Mount static files
    app.mount(
        "/assets", StaticFiles(directory=FRONTEND_BUILD_DIR / "assets"), name="assets"
    )

    # Serve index.html for all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't serve frontend for API routes
        if full_path.startswith(
            (
                "api/",
                "problems/",
                "drafts/",
                "auth/",
                "tasks/",
                "docs",
                "redoc",
                "openapi.json",
                "healthz",
            )
        ):
            raise HTTPException(404, "Not found")

        index_file = FRONTEND_BUILD_DIR / "index.html"
        if index_file.exists():
            logger.info(
                f"Serving frontend for path: {full_path}",
                extra={"event_type": "frontend_serve", "path": full_path},
            )
            return FileResponse(index_file)
        else:
            raise HTTPException(404, "Frontend not built")
else:
    logger.warning(
        "Frontend build directory not found, serving API only",
        extra={"event_type": "frontend_missing"},
    )
