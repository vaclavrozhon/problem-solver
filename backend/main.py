"""
Main FastAPI application entry point.

This module sets up the FastAPI application with CORS middleware and includes
all the modular routers for different functionality areas.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from pathlib import Path
import os
import json

# Import modular routers
try:
    from .routers.problems import router as problems_router
    from .routers.drafts import router as drafts_router  
    from .routers.auth import router as auth_router
    from .routers.tasks import router as tasks_router
except ImportError:
    from backend.routers.problems import router as problems_router
    from backend.routers.drafts import router as drafts_router
    from backend.routers.auth import router as auth_router
    from backend.routers.tasks import router as tasks_router

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

# Data directory setup
DATA_ROOT = Path(os.environ.get("AR_DATA_ROOT", "./data")).resolve()
DATA_ROOT.mkdir(parents=True, exist_ok=True)


# Basic authentication models and endpoints
class SignupPayload(BaseModel):
    email: str
    password: str


class KeyPayload(BaseModel):
    openai_api_key: str


def user_dir(user_id: str) -> Path:
    """Get user directory path."""
    d = DATA_ROOT / user_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def require_user(token: str) -> str:
    """Require valid user token and return user ID."""
    if not token:
        raise HTTPException(401, "missing token")
    uid = token
    if not (user_dir(uid) / "_user.json").exists():
        raise HTTPException(401, "invalid token")
    return uid


@app.post("/auth/signup")
def signup(p: SignupPayload):
    """User signup endpoint (minimal implementation)."""
    uid = p.email.replace("@", "_")
    (user_dir(uid) / "_user.json").write_text(
        json.dumps({"email": p.email}), encoding="utf-8"
    )
    return {"user_id": uid, "token": uid}


@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    """User login endpoint (minimal implementation)."""
    uid = form.username.replace("@", "_")
    if not (user_dir(uid) / "_user.json").exists():
        raise HTTPException(400, "unknown user")
    return {"user_id": uid, "token": uid}


@app.post("/user/key")
def set_key(p: KeyPayload, token: str):
    """Set OpenAI API key for authenticated user."""
    uid = require_user(token)
    # Store plaintext for MVP; replace with encryption later
    (user_dir(uid) / "_key.txt").write_text(p.openai_api_key.strip(), encoding="utf-8")
    return {"ok": True}


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Automatic Researcher Backend API"}


@app.get("/healthz")
def healthz():
    """Liveness probe."""
    return {"status": "ok"}


@app.get("/readyz")
def readyz():
    """Readiness probe (basic)."""
    return {"ready": DATA_ROOT.exists()}


@app.get("/problems")
def list_problems(token: str):
    """List problems for authenticated user."""
    uid = require_user(token)
    problems_dir = user_dir(uid) / "problems"
    problems_dir.mkdir(exist_ok=True)
    # Sort by creation time, newest first
    problem_dirs = [x for x in problems_dir.iterdir() if x.is_dir()]
    return [x.name for x in sorted(problem_dirs, key=lambda x: x.stat().st_ctime, reverse=True)]