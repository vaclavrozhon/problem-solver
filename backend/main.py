from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from pathlib import Path
import os, json, time, subprocess, uuid

# Import new modular components
try:
    from .routers.tasks import router as tasks_router
except ImportError:
    from backend.routers.tasks import router as tasks_router

app = FastAPI(title="Automatic Researcher Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routers
app.include_router(tasks_router)

DATA_ROOT = Path(os.environ.get("AR_DATA_ROOT", "./data")).resolve()
DATA_ROOT.mkdir(parents=True, exist_ok=True)

# Public problems root (repo problems/), used for simple dev UI without auth
REPO_PROBLEMS_ROOT = Path(__file__).resolve().parent.parent / "problems"
REPO_DRAFTS_ROOT = Path(__file__).resolve().parent.parent / "drafts"

class SignupPayload(BaseModel):
    email: str
    password: str

class KeyPayload(BaseModel):
    openai_api_key: str

class RunParams(BaseModel):
    rounds: int = 1
    provers: int = 2
    temperature: float = 0.4
    preset: str = "gpt5"

class WritingParams(BaseModel):
    rounds: int = 3
    preset: str = "gpt5"

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

@app.get("/problems_public")
def list_problems_public():
    """List problems directly from repo's problems/ without auth (dev convenience)."""
    pdir = REPO_PROBLEMS_ROOT
    if not pdir.exists():
        return []
    try:
        return sorted([x.name for x in pdir.iterdir() if x.is_dir()])
    except Exception:
        return []

@app.get("/drafts_public")
def list_drafts_public():
    """List drafts directly from repo's drafts/ without auth (dev convenience)."""
    ddir = REPO_DRAFTS_ROOT
    if not ddir.exists():
        return []
    try:
        return sorted([x.name for x in ddir.iterdir() if x.is_dir()])
    except Exception:
        return []

@app.get("/problems_public/{problem}/status")
def problem_status_public(problem: str):
    """Get detailed problem status with round-by-round information."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    runs_dir = problem_dir / "runs"
    status_path = runs_dir / "live_status.json"
    
    # Basic status
    base_status = {"phase": "idle", "round": 0, "ts": 0}
    if status_path.exists():
        try:
            base_status = json.loads(status_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    
    # Get detailed round information
    round_details = []
    if runs_dir.exists():
        rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
        
        for round_dir in rounds:
            round_info = {
                "name": round_dir.name,
                "number": int(round_dir.name.split('-')[1]) if '-' in round_dir.name else 0,
                "status": "completed",
                "verdict": None,
                "models": {},
                "timings": {},
                "completed_at": None
            }
            
            # Check if round is completed by looking for key files
            key_files = ["prover-01.out.json", "verifier.out.json", "summarizer.summary.md"]
            completed_files = sum(1 for f in key_files if (round_dir / f).exists())
            
            if completed_files < len(key_files):
                round_info["status"] = "in_progress"
            
            # Get verdict
            verifier_out = round_dir / "verifier.out.json"
            if verifier_out.exists():
                try:
                    verifier_data = json.loads(verifier_out.read_text(encoding="utf-8"))
                    round_info["verdict"] = verifier_data.get("verdict")
                except:
                    pass
            
            # Get models and timings
            timings_file = round_dir / "timings.json"
            if timings_file.exists():
                try:
                    timings_data = json.loads(timings_file.read_text(encoding="utf-8"))
                    round_info["timings"] = timings_data
                    
                    # Extract models from timings
                    for agent, timing_info in timings_data.items():
                        if isinstance(timing_info, dict) and "model" in timing_info:
                            round_info["models"][agent] = timing_info["model"]
                    
                    # Get completion time (use latest timestamp)
                    if timings_data:
                        latest_time = max(timing_info.get("end_time", 0) for timing_info in timings_data.values() if isinstance(timing_info, dict))
                        if latest_time > 0:
                            round_info["completed_at"] = latest_time
                            
                except:
                    pass
            
            round_details.append(round_info)
    
    # Determine overall status
    current_round = base_status.get("round", 0)
    phase = base_status.get("phase", "idle")
    # Ensure timestamp is treated as number
    ts = base_status.get("ts", 0)
    if isinstance(ts, str):
        try:
            ts = float(ts)
        except (ValueError, TypeError):
            ts = 0
    is_running = phase != "idle" and time.time() - ts < 600  # 10 minutes timeout
    
    # Calculate remaining rounds (this would need to be stored somewhere, for now estimate)
    total_planned_rounds = 5  # Default, could be read from run metadata
    remaining_rounds = max(0, total_planned_rounds - current_round) if is_running else 0
    
    # Check if last round is completed
    last_round_completed = True
    if round_details and is_running:
        last_round = round_details[-1]
        last_round_completed = last_round["status"] == "completed"
    
    return {
        "overall": {
            "phase": phase,
            "current_round": current_round,
            "is_running": is_running,
            "last_round_completed": last_round_completed,
            "remaining_rounds": remaining_rounds,
            "timestamp": base_status.get("ts", 0)
        },
        "rounds": round_details,
        "models": base_status.get("models", {}),
        # Keep old format for backward compatibility
        "phase": phase,
        "round": current_round,
        "ts": base_status.get("ts", 0),
        "verdict": round_details[-1].get("verdict") if round_details else None
    }

@app.get("/problems_public/{problem}/rounds")
def problem_rounds_public(problem: str):
    """Get conversation rounds for a problem from repo's problems/ without auth."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    runs_dir = problem_dir / "runs"
    
    if not runs_dir.exists():
        return []
    
    try:
        # Get all round directories
        rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
        round_data = []
        
        for round_dir in rounds:
            try:
                # Load verdict from verifier
                verdict = None
                verifier_out = round_dir / "verifier.out.json"
                if verifier_out.exists():
                    try:
                        verdict_data = json.loads(verifier_out.read_text(encoding="utf-8"))
                        verdict = verdict_data.get("verdict")
                    except:
                        pass
                
                # Load timings
                timings = {}
                timings_file = round_dir / "timings.json"
                if timings_file.exists():
                    try:
                        timings = json.loads(timings_file.read_text(encoding="utf-8"))
                    except:
                        pass
                
                # Load prover outputs (handle multi-prover)
                provers = []
                prover_files = sorted(round_dir.glob("prover-*.out.json"))
                if prover_files:
                    # Multi-prover setup
                    for prover_file in prover_files:
                        try:
                            prover_data = json.loads(prover_file.read_text(encoding="utf-8"))
                            provers.append({
                                "name": prover_file.name,
                                "content": prover_data.get("progress_md", "")
                            })
                        except:
                            provers.append({
                                "name": prover_file.name,
                                "content": "Error loading prover data"
                            })
                else:
                    # Single prover fallback
                    single_prover = round_dir / "prover.out.json"
                    if single_prover.exists():
                        try:
                            prover_data = json.loads(single_prover.read_text(encoding="utf-8"))
                            provers.append({
                                "name": "prover.out.json",
                                "content": prover_data.get("progress_md", "")
                            })
                        except:
                            provers.append({
                                "name": "prover.out.json", 
                                "content": "Error loading prover data"
                            })
                
                # Load verifier feedback
                verifier_feedback = ""
                verifier_fb = round_dir / "verifier.feedback.md"
                if verifier_fb.exists():
                    try:
                        verifier_feedback = verifier_fb.read_text(encoding="utf-8")
                    except:
                        pass
                
                # Load summary
                summary = ""
                summary_files = [
                    round_dir / "summarizer.summary.md",
                    round_dir / "verifier.summary.md"
                ]
                for summary_file in summary_files:
                    if summary_file.exists():
                        try:
                            summary = summary_file.read_text(encoding="utf-8")
                            break
                        except:
                            continue
                
                round_data.append({
                    "name": round_dir.name,
                    "verdict": verdict,
                    "timings": timings,
                    "provers": provers if provers else [{"name": "No prover data", "content": "No prover outputs found"}],
                    "verifier": verifier_feedback,
                    "summary": summary
                })
                
            except Exception as e:
                # Skip malformed rounds
                print(f"Error processing round {round_dir.name}: {e}")
                continue
        
        return round_data
        
    except Exception as e:
        print(f"Error loading rounds for {problem}: {e}")
        return []

@app.post("/problems_public/{problem}/run")
def run_problem_public(problem: str, params: RunParams):
    """Run rounds for a problem from repo's problems/ without auth (dev convenience)."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    if not problem_dir.exists():
        raise HTTPException(404, "problem not found")

    # Model preset mappings (matching web_app.py)
    model_presets = {
        "gpt5": {
            "prover": "gpt-5",
            "verifier": "gpt-5", 
            "summarizer": "gpt-5-mini",
            "paper_suggester": "gpt-5",
            "paper_fixer": "gpt-5",
        },
        "fast": {
            "prover": "gpt-4o-mini",
            "verifier": "gpt-4o-mini",
            "summarizer": "gpt-4o-mini",
            "paper_suggester": "gpt-4o-mini",
            "paper_fixer": "gpt-4o-mini",
        },
    }
    
    preset_config = model_presets.get(params.preset, model_presets["gpt5"])

    env = os.environ.copy()
    env["AR_NUM_PROVERS"] = str(params.provers)
    env["AR_PROVER_TEMPERATURE"] = str(params.temperature)
    # Set model environment variables based on preset
    env["OPENAI_MODEL_PROVER"] = preset_config["prover"]
    env["OPENAI_MODEL_VERIFIER"] = preset_config["verifier"]
    env["OPENAI_MODEL_SUMMARIZER"] = preset_config["summarizer"]

    cmd = [
        "python3", "orchestrator.py", str(problem_dir.resolve()),
        "--rounds", str(params.rounds)
    ]
    proc = subprocess.Popen(cmd, cwd=str(Path(__file__).resolve().parent.parent), env=env)
    return {"ok": True, "pid": proc.pid}

@app.post("/problems_public/{problem}/stop")
def stop_problem_public(problem: str):
    """Stop a running problem from repo's problems/ without auth (dev convenience)."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    # Try to find and kill orchestrator processes for this problem
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        for line in result.stdout.splitlines():
            if 'python' in line and 'orchestrator.py' in line and problem in line:
                parts = line.split()
                if len(parts) > 1:
                    pid = parts[1]
                    print(f"Found orchestrator process {pid} for {problem}")
                    subprocess.run(['kill', '-TERM', pid])
                    time.sleep(0.5)
                    subprocess.run(['kill', '-9', pid], capture_output=True)
                    
                    # Update live_status.json to reflect stopped state
                    status_file = problem_dir / "runs" / "live_status.json"
                    if status_file.exists():
                        try:
                            status_data = json.loads(status_file.read_text(encoding="utf-8"))
                            status_data["phase"] = "idle"
                            status_data["ts"] = time.time()
                            status_file.write_text(json.dumps(status_data), encoding="utf-8")
                        except:
                            pass
                    
                    return {"ok": True, "message": f"Stopped process {pid}"}
        
        return {"ok": True, "message": "No running process found"}
        
    except Exception as e:
        raise HTTPException(500, f"Error stopping problem: {e}")

@app.delete("/problems_public/{problem}/rounds")
def delete_rounds_public(problem: str, delete_count: int = 1):
    """Delete the specified number of oldest conversation rounds."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    runs_dir = problem_dir / "runs"
    
    if not runs_dir.exists():
        return {"ok": True, "deleted": 0, "message": "No runs directory found"}
    
    try:
        # Get all round directories
        rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
        
        if len(rounds) == 0:
            return {"ok": True, "deleted": 0, "message": "No rounds found"}
        
        if delete_count <= 0:
            return {"ok": True, "deleted": 0, "message": "Delete count must be positive"}
            
        if delete_count >= len(rounds):
            return {"ok": True, "deleted": 0, "message": f"Cannot delete {delete_count} rounds - only {len(rounds)} rounds exist"}
        
        # Calculate how many to delete (oldest rounds first)
        rounds_to_delete = rounds[:delete_count]
        deleted_count = 0
        
        for round_dir in rounds_to_delete:
            try:
                import shutil
                shutil.rmtree(round_dir)
                deleted_count += 1
                print(f"Deleted round: {round_dir.name}")
            except Exception as e:
                print(f"Error deleting {round_dir.name}: {e}")
        
        return {
            "ok": True, 
            "deleted": deleted_count, 
            "kept": len(rounds) - deleted_count,
            "message": f"Deleted {deleted_count} oldest rounds, kept {len(rounds) - deleted_count} rounds"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error deleting rounds: {e}")

@app.get("/problems_public/{problem}/drafts")
def get_drafts_public(problem: str):
    """Get list of drafts for a problem."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    drafts_dir = problem_dir / "drafts"
    
    if not drafts_dir.exists():
        return []
    
    try:
        drafts = []
        for draft_file in drafts_dir.iterdir():
            if draft_file.is_file():
                drafts.append({
                    "id": str(uuid.uuid4()),  # Generate temp ID
                    "name": draft_file.name,
                    "createdAt": time.ctime(draft_file.stat().st_mtime),
                    "size": draft_file.stat().st_size
                })
        
        return sorted(drafts, key=lambda x: x['createdAt'], reverse=True)
    except Exception as e:
        print(f"Error loading drafts for {problem}: {e}")
        return []

@app.get("/problems_public/{problem}/file")
def get_file_public(problem: str, file_path: str):
    """Get content of a file within a problem directory."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    # Resolve file path within problem directory
    try:
        full_path = (problem_dir / file_path).resolve()
        # Security check: ensure path is within problem directory
        if not str(full_path).startswith(str(problem_dir.resolve())):
            raise HTTPException(403, "Invalid file path")
        
        if not full_path.exists():
            raise HTTPException(404, "File not found")
        
        if not full_path.is_file():
            raise HTTPException(400, "Path is not a file")
            
        # Read file content
        content = full_path.read_text(encoding="utf-8")
        
        return {
            "path": file_path,
            "content": content,
            "size": full_path.stat().st_size,
            "modified": time.ctime(full_path.stat().st_mtime)
        }
        
    except UnicodeDecodeError:
        raise HTTPException(400, "File is not text-readable")
    except Exception as e:
        raise HTTPException(500, f"Error reading file: {e}")

@app.get("/problems_public/{problem}/files")
def list_files_public(problem: str):
    """List files in a problem directory."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    try:
        files = []
        common_files = ["notes.md", "output.md", "progress.md", "task.md", "summary.md"]
        
        # Add common files if they exist
        for file_name in common_files:
            file_path = problem_dir / file_name
            if file_path.exists():
                files.append({
                    "name": file_name,
                    "path": file_name,
                    "type": "markdown" if file_name.endswith(".md") else "text",
                    "size": file_path.stat().st_size,
                    "modified": time.ctime(file_path.stat().st_mtime)
                })
        
        # Add papers directory files
        papers_dir = problem_dir / "papers"
        if papers_dir.exists():
            for paper_file in papers_dir.iterdir():
                if paper_file.is_file():
                    files.append({
                        "name": f"papers/{paper_file.name}",
                        "path": f"papers/{paper_file.name}",
                        "type": "paper",
                        "size": paper_file.stat().st_size,
                        "modified": time.ctime(paper_file.stat().st_mtime)
                    })
        
        return files
        
    except Exception as e:
        raise HTTPException(500, f"Error listing files: {e}")

@app.get("/problems_public/{problem}/output-md") 
def check_output_md_public(problem: str):
    """Check if output.md exists for a problem."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    output_file = problem_dir / "output.md"
    
    if output_file.exists():
        return {"exists": True}
    else:
        raise HTTPException(404, "output.md not found")

@app.post("/problems_public/{problem}/upload-draft")
def upload_draft_public(problem: str, file: UploadFile = File(...)):
    """Upload a draft file for a problem."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    drafts_dir = problem_dir / "drafts"
    drafts_dir.mkdir(exist_ok=True)
    
    try:
        # Save uploaded file
        timestamp = int(time.time())
        filename = f"draft_{timestamp}_{file.filename}"
        file_path = drafts_dir / filename
        
        content = file.file.read()
        file_path.write_bytes(content)
        
        return {"ok": True, "filename": filename}
    except Exception as e:
        raise HTTPException(500, f"Error uploading draft: {e}")

@app.post("/problems_public/{problem}/convert-output")
def convert_output_md_public(problem: str):
    """Convert output.md to first draft."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    output_file = problem_dir / "output.md"
    drafts_dir = problem_dir / "drafts"
    
    if not output_file.exists():
        raise HTTPException(404, "output.md not found")
    
    try:
        drafts_dir.mkdir(exist_ok=True)
        timestamp = int(time.time())
        draft_filename = f"draft_from_output_{timestamp}.md"
        draft_path = drafts_dir / draft_filename
        
        # Copy output.md content to drafts
        content = output_file.read_text(encoding="utf-8")
        draft_path.write_text(content, encoding="utf-8")
        
        return {"ok": True, "filename": draft_filename}
    except Exception as e:
        raise HTTPException(500, f"Error converting output.md: {e}")

# Paper Writing Endpoints (using drafts/ folder)

@app.get("/drafts_public/{draft}/status")
def draft_status_public(draft: str):
    """Get detailed draft status with round-by-round information."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    runs_dir = draft_dir / "runs"
    
    if not draft_dir.exists():
        raise HTTPException(404, "Draft not found")
    
    # Rest of status logic is the same as problem_status_public but using draft_dir
    base_status = {"phase": "idle", "round": 0, "ts": 0}
    round_details = []
    
    # Load base status from live_status.json if exists
    status_file = runs_dir / "live_status.json"
    if status_file.exists():
        try:
            base_status = json.loads(status_file.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"Error parsing status file: {e}")
    
    # Load round details
    if runs_dir.exists():
        for round_dir in sorted(runs_dir.iterdir()):
            if round_dir.is_dir() and round_dir.name.startswith('round-'):
                try:
                    round_num = int(round_dir.name.split('-')[1])
                except (IndexError, ValueError):
                    continue
                
                round_info = {
                    "name": round_dir.name,
                    "number": round_num,
                    "status": "completed",  # Default assumption
                    "verdict": None,
                    "models": {},
                    "timings": {},
                    "completed_at": None
                }
                
                # Check if this is the current round (incomplete)
                if round_num == base_status.get("round", 0):
                    round_info["status"] = "in_progress"
                
                try:
                    # Load timings
                    timings_file = round_dir / "timings.json"
                    if timings_file.exists():
                        timings = json.loads(timings_file.read_text(encoding="utf-8"))
                        round_info["timings"] = timings
                except Exception:
                    pass
                
                round_details.append(round_info)
    
    # Determine overall status
    current_round = base_status.get("round", 0)
    phase = base_status.get("phase", "idle")
    # Ensure timestamp is treated as number
    ts = base_status.get("ts", 0)
    if isinstance(ts, str):
        try:
            ts = float(ts)
        except (ValueError, TypeError):
            ts = 0
    is_running = phase != "idle" and time.time() - ts < 600  # 10 minutes timeout
    
    # Calculate remaining rounds (this would need to be stored somewhere, for now estimate)
    total_planned_rounds = 5  # Default, could be read from run metadata
    remaining_rounds = max(0, total_planned_rounds - current_round) if is_running else 0
    
    # Check if last round is completed
    last_round_completed = True
    if round_details:
        last_round = max(round_details, key=lambda x: x["number"])
        last_round_completed = last_round["status"] == "completed"
    
    overall_status = {
        "phase": phase,
        "current_round": current_round,
        "is_running": is_running,
        "last_round_completed": last_round_completed,
        "remaining_rounds": remaining_rounds,
        "timestamp": ts
    }
    
    result = {
        "overall": overall_status,
        "rounds": round_details,
        "models": base_status.get("models", {}),
        **base_status  # Include raw status for backward compatibility
    }
    
    return result

@app.get("/drafts_public/{draft}/drafts")
def get_draft_drafts_public(draft: str):
    """Get list of draft files for a draft project."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    drafts_dir = draft_dir / "drafts"
    
    if not drafts_dir.exists():
        return []
    
    try:
        drafts = []
        for draft_file in drafts_dir.iterdir():
            if draft_file.is_file():
                drafts.append({
                    "id": str(uuid.uuid4()),  # Generate temp ID
                    "name": draft_file.name,
                    "createdAt": time.ctime(draft_file.stat().st_mtime),
                    "size": draft_file.stat().st_size
                })
        
        return sorted(drafts, key=lambda x: x['createdAt'], reverse=True)
    except Exception as e:
        print(f"Error loading drafts for {draft}: {e}")
        return []

@app.get("/drafts_public/{draft}/output-md")
def check_draft_output_md_public(draft: str):
    """Check if output.md exists for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    output_file = draft_dir / "output.md"
    
    if output_file.exists():
        return {"exists": True}
    else:
        raise HTTPException(404, "output.md not found")

@app.post("/drafts_public/{draft}/upload-draft")
def upload_draft_to_draft_public(draft: str, file: UploadFile = File(...)):
    """Upload a draft file to a draft project."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    drafts_dir = draft_dir / "drafts"
    drafts_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Save uploaded file
        timestamp = int(time.time())
        filename = f"draft_{timestamp}_{file.filename}"
        file_path = drafts_dir / filename
        
        content = file.file.read()
        file_path.write_bytes(content)
        
        return {"ok": True, "filename": filename}
    except Exception as e:
        raise HTTPException(500, f"Error uploading draft: {e}")

@app.post("/drafts_public/{draft}/convert-output")
def convert_draft_output_md_public(draft: str):
    """Convert output.md to first draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    output_file = draft_dir / "output.md"
    drafts_dir = draft_dir / "drafts"
    
    if not output_file.exists():
        raise HTTPException(404, "output.md not found")
    
    try:
        drafts_dir.mkdir(exist_ok=True)
        timestamp = int(time.time())
        draft_filename = f"draft_from_output_{timestamp}.md"
        draft_path = drafts_dir / draft_filename
        
        # Copy output.md content to drafts
        content = output_file.read_text(encoding="utf-8")
        draft_path.write_text(content, encoding="utf-8")
        
        return {"ok": True, "filename": draft_filename}
    except Exception as e:
        raise HTTPException(500, f"Error converting output.md: {e}")

@app.post("/drafts_public/{draft}/start-writing")
def start_writing_public(draft: str, params: WritingParams):
    """Start paper writing process for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    drafts_dir = draft_dir / "drafts"
    
    if not drafts_dir.exists() or not any(drafts_dir.iterdir()):
        raise HTTPException(400, "No drafts found. Upload a draft first.")
    
    try:
        env = os.environ.copy()
        env["AR_MODE"] = "writing"  # Signal to orchestrator to use writing mode
        
        # Set model environment variables based on preset
        model_presets = {
            "gpt5": {
                "prover": "gpt-5",
                "verifier": "gpt-5", 
                "summarizer": "gpt-5-mini"
            },
            "fast": {
                "prover": "gpt-4o-mini",
                "verifier": "gpt-4o-mini",
                "summarizer": "gpt-4o-mini"
            }
        }
        
        preset_config = model_presets.get(params.preset, model_presets["gpt5"])
        env["OPENAI_MODEL_PROVER"] = preset_config["prover"]
        env["OPENAI_MODEL_VERIFIER"] = preset_config["verifier"]
        env["OPENAI_MODEL_SUMMARIZER"] = preset_config["summarizer"]
        
        cmd = [
            "python3", "orchestrator.py", str(draft_dir.resolve()),
            "--rounds", str(params.rounds),
            "--mode", "paper"
        ]
        proc = subprocess.Popen(cmd, cwd=str(Path(__file__).resolve().parent.parent), env=env)
        return {"ok": True, "pid": proc.pid}
    except Exception as e:
        raise HTTPException(500, f"Error starting writing process: {e}")

@app.get("/drafts_public/{draft}/rounds")
def get_draft_rounds_public(draft: str):
    """Get rounds data for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    runs_dir = draft_dir / "runs"
    
    if not runs_dir.exists():
        return []
    
    try:
        rounds = []
        round_dirs = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
        
        for round_dir in round_dirs:
            round_data = {
                "name": round_dir.name,
                "provers": [],
                "paper_suggester": None,
                "paper_fixer": None,
                "timings": {},
                "models": {}
            }
            
            # Load prover outputs (but there might not be any for paper writing)
            for prover_file in sorted(round_dir.glob("prover-*.text.txt")):
                prover_name = prover_file.stem.replace('.text', '')
                try:
                    content = prover_file.read_text(encoding="utf-8")
                    round_data["provers"].append({"name": prover_name, "content": content})
                except:
                    pass
            
            # Load paper suggester
            suggester_file = round_dir / "paper-suggester.text.txt"
            if suggester_file.exists():
                try:
                    content = suggester_file.read_text(encoding="utf-8")
                    round_data["paper_suggester"] = {"content": content}
                except:
                    pass
            
            # Load paper fixer
            fixer_file = round_dir / "paper-fixer.text.txt"
            if fixer_file.exists():
                try:
                    content = fixer_file.read_text(encoding="utf-8")
                    round_data["paper_fixer"] = {"content": content}
                except:
                    pass
            
            # Load timings
            timings_file = round_dir / "timings.json"
            if timings_file.exists():
                try:
                    timings_data = json.loads(timings_file.read_text())
                    round_data["timings"] = timings_data
                except:
                    pass
            
            rounds.append(round_data)
        
        return rounds
        
    except Exception as e:
        raise HTTPException(500, f"Error loading rounds: {e}")

@app.get("/drafts_public/{draft}/files")
def get_draft_files_public(draft: str):
    """Get list of files for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    
    if not draft_dir.exists():
        return []
    
    try:
        files = []
        
        # Check common files
        for file_path in [
            "task.md", "progress.md", "output.md", "summary.md", "notes.md",
            "final_output.tex", "final_output.pdf"
        ]:
            full_path = draft_dir / file_path
            if full_path.exists():
                stat = full_path.stat()
                files.append({
                    "name": file_path,
                    "path": file_path,
                    "type": "text" if file_path.endswith(('.md', '.txt', '.tex')) else "binary",
                    "size": stat.st_size
                })
        
        # Check drafts folder
        drafts_dir = draft_dir / "drafts"
        if drafts_dir.exists():
            for draft_file in drafts_dir.iterdir():
                if draft_file.is_file():
                    stat = draft_file.stat()
                    files.append({
                        "name": f"drafts/{draft_file.name}",
                        "path": f"drafts/{draft_file.name}",
                        "type": "text" if draft_file.suffix in ['.md', '.txt', '.tex'] else "binary",
                        "size": stat.st_size
                    })
        
        return files
        
    except Exception as e:
        raise HTTPException(500, f"Error loading files: {e}")

@app.get("/drafts_public/{draft}/file")
def get_draft_file_content_public(draft: str, file_path: str):
    """Get content of a specific file from a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    full_path = draft_dir / file_path
    
    if not full_path.exists():
        raise HTTPException(404, "File not found")
    
    try:
        # For PDFs, return a link instead of content
        if file_path.endswith('.pdf'):
            return {
                "content": f"PDF file: {file_path}",
                "is_pdf": True,
                "pdf_url": f"/drafts_public/{draft}/file-raw?file_path={file_path}"
            }
        
        content = full_path.read_text(encoding="utf-8")
        return {"content": content, "is_pdf": False}
        
    except Exception as e:
        raise HTTPException(500, f"Error reading file: {e}")

@app.get("/drafts_public/{draft}/file-raw")
def get_draft_file_raw_public(draft: str, file_path: str):
    """Get raw file content (for PDFs, images, etc.)."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    full_path = draft_dir / file_path
    
    if not full_path.exists():
        raise HTTPException(404, "File not found")
    
    # Return the file directly
    from fastapi.responses import FileResponse
    return FileResponse(full_path)

@app.delete("/drafts_public/{draft}/rounds")
def delete_draft_rounds_public(draft: str, delete_count: int = 1):
    """Delete the specified number of oldest conversation rounds for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    runs_dir = draft_dir / "runs"
    
    if not runs_dir.exists():
        return {"ok": True, "deleted": 0, "message": "No runs directory found"}
    
    try:
        # Get all round directories
        rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
        
        if len(rounds) == 0:
            return {"ok": True, "deleted": 0, "message": "No rounds found"}
            
        # Ensure we don't try to delete more rounds than exist
        delete_count = min(delete_count, len(rounds))
        
        # Delete the oldest rounds (first in sorted list)
        deleted = 0
        for round_dir in rounds[:delete_count]:
            try:
                import shutil
                shutil.rmtree(round_dir)
                deleted += 1
            except Exception as e:
                print(f"Error deleting round {round_dir}: {e}")
        
        return {"ok": True, "deleted": deleted, "message": f"Deleted {deleted} rounds"}
        
    except Exception as e:
        raise HTTPException(500, f"Error deleting rounds: {e}")

# Keep old problem endpoints for backward compatibility (but remove paper writing from them)

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

