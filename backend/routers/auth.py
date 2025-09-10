"""
Authentication router for the backend API.

This module handles all authentication-related endpoints including
user management, API keys, and authenticated problem operations.
"""

import os
import json
import subprocess
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List
from pydantic import BaseModel

from ..models import RunParams
from ..config import DATA_ROOT, user_dir

router = APIRouter(tags=["auth"])


def require_user(token: str) -> str:
    """Require valid user token and return user ID."""
    if not token:
        raise HTTPException(400, "token required")
    
    # Simple implementation - treat token as user_id directly
    uid = token
    if not (user_dir(uid) / "_user.json").exists():
        raise HTTPException(403, "invalid token")
    
    return uid


class CreateProblemPayload(BaseModel):
    name: str
    task_text: str
    task_ext: str = "md"  # md|txt|tex


@router.post("/problems")
def create_problem(p: CreateProblemPayload, token: str):
    """Create a new problem for authenticated user."""
    uid = require_user(token)
    pdir = user_dir(uid) / "problems" / p.name
    pdir.mkdir(parents=True, exist_ok=True)
    task_name = f"task.{p.task_ext.strip().lower()}"
    (pdir / task_name).write_text(p.task_text, encoding="utf-8")
    return {"ok": True}


@router.post("/problems/{problem}/run-round")
def run_round(problem: str, params: RunParams, token: str):
    """Run research rounds for authenticated user's problem."""
    uid = require_user(token)
    root = user_dir(uid)
    problems_dir = root / "problems"
    problem_dir = problems_dir / problem
    if not problem_dir.exists():
        raise HTTPException(404, "problem not found")

    key_path = root / "_key.txt"
    if not key_path.exists():
        raise HTTPException(400, "no API key uploaded for this user")
    api_key = key_path.read_text(encoding="utf-8").strip()

    env = os.environ.copy()
    env["OPENAI_API_KEY"] = api_key
    env["AR_NUM_PROVERS"] = str(params.provers)
    env["AR_PROVER_TEMPERATURE"] = str(params.temperature)

    cmd = [
        "python3", "orchestrator.py", str(problem_dir.resolve()),
        "--rounds", str(params.rounds)
    ]
    proc = subprocess.Popen(cmd, cwd=str(Path(__file__).resolve().parent.parent.parent), env=env)
    return {"ok": True, "pid": proc.pid}


@router.get("/problems/{problem}/runs")
def list_runs(problem: str, token: str):
    """List runs for authenticated user's problem."""
    uid = require_user(token)
    rd = user_dir(uid) / "problems" / problem / "runs"
    if not rd.exists():
        return []
    return sorted([x.name for x in rd.iterdir() if x.is_dir()])


@router.get("/problems/{problem}/status")
def problem_status(problem: str, token: str):
    """Get status for authenticated user's problem."""
    uid = require_user(token)
    status_path = user_dir(uid) / "problems" / problem / "runs" / "live_status.json"
    if not status_path.exists():
        return {"phase": "idle"}
    try:
        return json.loads(status_path.read_text(encoding="utf-8"))
    except Exception:
        return {"phase": "idle"}


@router.get("/files")
def get_file(path: str, token: str):
    """Get file content for authenticated user."""
    uid = require_user(token)
    full = (user_dir(uid) / path).resolve()
    if not str(full).startswith(str(user_dir(uid).resolve())):
        raise HTTPException(403, "invalid path")
    if not full.exists():
        raise HTTPException(404, "not found")
    return {"path": path, "content": full.read_text(encoding="utf-8")}


@router.get("/ls")
def list_dir(path: str, token: str):
    """List directory contents for authenticated user."""
    uid = require_user(token)
    full = (user_dir(uid) / path).resolve()
    if not str(full).startswith(str(user_dir(uid).resolve())):
        raise HTTPException(403, "invalid path")
    if not full.exists() or not full.is_dir():
        raise HTTPException(404, "not found")
    items = []
    for it in sorted(full.iterdir()):
        items.append({
            "name": it.name,
            "is_dir": it.is_dir(),
        })
    return {"path": path, "items": items}


@router.get("/download")
def download(path: str, token: str):
    """Download file for authenticated user."""
    uid = require_user(token)
    full = (user_dir(uid) / path).resolve()
    if not str(full).startswith(str(user_dir(uid).resolve())):
        raise HTTPException(403, "invalid path")
    if not full.exists():
        raise HTTPException(404, "not found")
    return FileResponse(str(full))