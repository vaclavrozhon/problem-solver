from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from pathlib import Path
import os, json, time, subprocess

app = FastAPI(title="Automatic Researcher Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_ROOT = Path(os.environ.get("AR_DATA_ROOT", "./data")).resolve()
DATA_ROOT.mkdir(parents=True, exist_ok=True)

class SignupPayload(BaseModel):
    email: str
    password: str

class KeyPayload(BaseModel):
    openai_api_key: str

def user_dir(user_id: str) -> Path:
    d = DATA_ROOT / user_id
    d.mkdir(parents=True, exist_ok=True)
    return d

@app.post("/auth/signup")
def signup(p: SignupPayload):
    # Minimal placeholder; integrate real auth later
    uid = p.email.replace("@", "_")
    (user_dir(uid) / "_user.json").write_text(json.dumps({"email": p.email}), encoding="utf-8")
    return {"user_id": uid, "token": uid}

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    uid = form.username.replace("@", "_")
    if not (user_dir(uid) / "_user.json").exists():
        raise HTTPException(400, "unknown user")
    return {"user_id": uid, "token": uid}

def require_user(token: str) -> str:
    if not token:
        raise HTTPException(401, "missing token")
    uid = token
    if not (user_dir(uid) / "_user.json").exists():
        raise HTTPException(401, "invalid token")
    return uid

@app.post("/user/key")
def set_key(p: KeyPayload, token: str):
    uid = require_user(token)
    # Store plaintext for MVP; replace with encryption later
    (user_dir(uid) / "_key.txt").write_text(p.openai_api_key.strip(), encoding="utf-8")
    return {"ok": True}

@app.get("/problems")
def list_problems(token: str):
    uid = require_user(token)
    problems_dir = user_dir(uid) / "problems"
    problems_dir.mkdir(exist_ok=True)
    return sorted([x.name for x in problems_dir.iterdir() if x.is_dir()])

class RunParams(BaseModel):
    rounds: int = 1
    provers: int = 2
    temperature: float = 0.4
    preset: str = "gpt5"

@app.post("/problems/{problem}/run-round")
def run_round(problem: str, params: RunParams, token: str):
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
    proc = subprocess.Popen(cmd, cwd=str(Path(__file__).resolve().parent.parent), env=env)
    return {"ok": True, "pid": proc.pid}

@app.get("/problems/{problem}/runs")
def list_runs(problem: str, token: str):
    uid = require_user(token)
    rd = user_dir(uid) / "problems" / problem / "runs"
    if not rd.exists():
        return []
    return sorted([x.name for x in rd.iterdir() if x.is_dir()])

@app.get("/files")
def get_file(path: str, token: str):
    uid = require_user(token)
    full = (user_dir(uid) / path).resolve()
    if not str(full).startswith(str(user_dir(uid).resolve())):
        raise HTTPException(403, "invalid path")
    if not full.exists():
        raise HTTPException(404, "not found")
    return {"path": path, "content": full.read_text(encoding="utf-8")}

@app.get("/ls")
def list_dir(path: str, token: str):
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

class CreateProblemPayload(BaseModel):
    name: str
    task_text: str
    task_ext: str = "md"  # md|txt|tex

@app.post("/problems")
def create_problem(p: CreateProblemPayload, token: str):
    uid = require_user(token)
    pdir = user_dir(uid) / "problems" / p.name
    pdir.mkdir(parents=True, exist_ok=True)
    task_name = f"task.{p.task_ext.strip().lower()}"
    (pdir / task_name).write_text(p.task_text, encoding="utf-8")
    return {"ok": True}

@app.get("/problems/{problem}/status")
def problem_status(problem: str, token: str):
    uid = require_user(token)
    status_path = user_dir(uid) / "problems" / problem / "runs" / "live_status.json"
    if not status_path.exists():
        return {"phase": "idle"}
    try:
        return json.loads(status_path.read_text(encoding="utf-8"))
    except Exception:
        return {"phase": "idle"}

@app.get("/download")
def download(path: str, token: str):
    uid = require_user(token)
    full = (user_dir(uid) / path).resolve()
    if not str(full).startswith(str(user_dir(uid).resolve())):
        raise HTTPException(403, "invalid path")
    if not full.exists():
        raise HTTPException(404, "not found")
    return FileResponse(str(full))

