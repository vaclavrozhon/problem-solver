"""
Problem solving router for the backend API.

This module handles all endpoints related to problem creation, execution,
status tracking, and file management for research problems.
"""

import os
import json
import time
import subprocess
from pathlib import Path
from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from typing import List, Optional
from pydantic import BaseModel

from ..models import RunParams
from ..config import REPO_PROBLEMS_ROOT
from ..services.tasks import TaskService

router = APIRouter(prefix="/problems_public", tags=["problems"])


class FileUpdatePayload(BaseModel):
    content: str
    description: Optional[str] = None


@router.get("")
def list_problems_public():
    """List all problems in the public repository without auth (dev convenience)."""
    problems = []
    if REPO_PROBLEMS_ROOT.exists():
        # Sort by creation time, newest first
        problem_dirs = [x for x in REPO_PROBLEMS_ROOT.iterdir() if x.is_dir()]
        problems = [x.name for x in sorted(problem_dirs, key=lambda x: x.stat().st_ctime, reverse=True)]
    return problems


@router.get("/{problem}/status")
def get_problem_status_public(problem: str):
    """Get detailed problem status with round-by-round information."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    runs_dir = problem_dir / "runs"
    
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    # Load base status from live_status.json if exists
    base_status = {"phase": "idle", "round": 0, "ts": 0}
    round_details = []
    
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
                    "status": "completed",
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
                
                try:
                    # Load verdict from verifier output
                    verifier_file = round_dir / "verifier.out.json"
                    if verifier_file.exists():
                        verifier_data = json.loads(verifier_file.read_text(encoding="utf-8"))
                        round_info["verdict"] = verifier_data.get("verdict")
                except Exception:
                    pass
                
                try:
                    # Load one-line summary from summarizer output
                    summarizer_file = round_dir / "summarizer.out.json"
                    if summarizer_file.exists():
                        summarizer_data = json.loads(summarizer_file.read_text(encoding="utf-8"))
                        round_info["one_line_summary"] = summarizer_data.get("one_line_summary")
                except Exception:
                    pass
                
                round_details.append(round_info)
    
    # Determine overall status
    current_round = base_status.get("round", 0)
    phase = base_status.get("phase", "idle")
    ts = base_status.get("ts", 0)
    if isinstance(ts, str):
        try:
            ts = float(ts)
        except (ValueError, TypeError):
            ts = 0
    is_running = phase != "idle" and time.time() - ts < 1800  # 30 minutes for very long model calls
    
    # Read batch status from dedicated batch_status.json file
    # This file is created by the orchestrator when starting a new batch of rounds
    batch_size = None
    current_batch_round = None
    batch_start_round = None

    batch_status_file = runs_dir / "batch_status.json"
    if batch_status_file.exists():
        try:
            batch_status = json.loads(batch_status_file.read_text(encoding="utf-8"))
            batch_size = batch_status.get("batch_total_rounds")
            current_batch_round = batch_status.get("batch_current_round")
            batch_start_round = batch_status.get("batch_start_round")
        except Exception as e:
            print(f"Error reading batch status: {e}")
            # Set to None if there's an error reading the file
            batch_size = None
            current_batch_round = None
            batch_start_round = None
    
    # Calculate remaining rounds only if batch info is available
    remaining_rounds = 0
    if batch_size is not None and current_batch_round is not None:
        if is_running and current_round == 0:
            # Just started, no actual round running yet
            remaining_rounds = batch_size
        else:
            # Remaining rounds includes the current round (which is still running)
            remaining_rounds = max(0, batch_size - current_batch_round + 1) if is_running else 0
    
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
        "timestamp": ts,
        "current_batch_round": current_batch_round,
        "batch_size": batch_size,
        "batch_start_round": batch_start_round
    }
    
    # Add error information if present
    if "error" in base_status:
        overall_status["error"] = base_status["error"]
    
    return {
        "overall": overall_status,
        "rounds": round_details,
        "models": base_status.get("models", {}),
    }


@router.get("/{problem}/rounds")
def get_problem_rounds_public(problem: str):
    """Get rounds data for a problem."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    runs_dir = problem_dir / "runs"
    
    if not runs_dir.exists():
        return []
    
    try:
        rounds = []
        round_dirs = sorted([d for d in runs_dir.iterdir() if d.is_dir() and d.name.startswith('round-')])
        
        for round_dir in round_dirs:
            round_data = {
                "name": round_dir.name,
                "provers": [],
                "verifier": "",
                "summary": "",
                "timings": {},
                "verdict": None,
                "models": {}
            }
            
            # Load prover outputs
            for prover_file in sorted(round_dir.glob("prover-*.text.txt")):
                prover_name = prover_file.stem.replace('.text', '')
                try:
                    content = prover_file.read_text(encoding="utf-8")
                    round_data["provers"].append({"name": prover_name, "content": content})
                except:
                    pass
            
            # Load verifier feedback
            verifier_file = round_dir / "verifier.feedback.md"
            if verifier_file.exists():
                try:
                    round_data["verifier"] = verifier_file.read_text(encoding="utf-8")
                except:
                    pass
            
            # Load summary
            summary_file = round_dir / "summarizer.summary.md"
            if summary_file.exists():
                try:
                    round_data["summary"] = summary_file.read_text(encoding="utf-8")
                except:
                    pass
            
            # Load one-line summary from summarizer output
            summarizer_out_file = round_dir / "summarizer.out.json"
            if summarizer_out_file.exists():
                try:
                    summarizer_data = json.loads(summarizer_out_file.read_text(encoding="utf-8"))
                    round_data["one_line_summary"] = summarizer_data.get("one_line_summary")
                except:
                    pass
            
            # Load timings
            timings_file = round_dir / "timings.json"
            if timings_file.exists():
                try:
                    timings = json.loads(timings_file.read_text(encoding="utf-8"))
                    round_data["timings"] = timings
                except:
                    pass
            
            # Load verdict from verifier output
            verifier_out_file = round_dir / "verifier.out.json"
            if verifier_out_file.exists():
                try:
                    verifier_data = json.loads(verifier_out_file.read_text(encoding="utf-8"))
                    round_data["verdict"] = verifier_data.get("verdict")
                except:
                    pass
            
            rounds.append(round_data)
        
        return rounds
        
    except Exception as e:
        raise HTTPException(500, f"Error loading rounds: {e}")


@router.post("/{problem}/run")
def run_problem_public(problem: str, params: RunParams):
    """Run rounds for a problem from repo's problems/ without auth (dev convenience)."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    if not problem_dir.exists():
        raise HTTPException(404, "problem not found")
    
    # Model preset mappings
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
    env["OPENAI_MODEL_PROVER"] = preset_config["prover"]
    env["OPENAI_MODEL_VERIFIER"] = preset_config["verifier"]
    env["OPENAI_MODEL_SUMMARIZER"] = preset_config["summarizer"]
    
    # Save run metadata
    runs_dir = problem_dir / "runs"
    runs_dir.mkdir(exist_ok=True)
    metadata_file = runs_dir / "run_metadata.json"
    metadata = {
        "requested_rounds": params.rounds,
        "preset": params.preset,
        "provers": params.provers,
        "temperature": params.temperature,
        "started_at": time.time()
    }
    if params.prover_configs:
        metadata["prover_configs"] = params.prover_configs
    if params.focus_description:
        metadata["focus_description"] = params.focus_description
    metadata_file.write_text(json.dumps(metadata, indent=2))
    
    # Save prover configurations for the orchestrator to read
    if params.prover_configs:
        config_file = runs_dir / "prover_configs.json"
        config_file.write_text(json.dumps(params.prover_configs, indent=2))
    
    cmd = [
        "python3", "orchestrator.py", str(problem_dir.resolve()),
        "--rounds", str(params.rounds)
    ]
    proc = subprocess.Popen(cmd, cwd=str(Path(__file__).resolve().parent.parent.parent), env=env)
    return {"ok": True, "pid": proc.pid}


@router.post("/{problem}/stop")
def stop_problem_public(problem: str):
    """Stop a running problem by writing a stop signal."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    # Write stop signal
    stop_file = problem_dir / "runs" / "stop_signal"
    stop_file.parent.mkdir(exist_ok=True)
    stop_file.write_text(str(time.time()))
    
    return {"message": "Stop signal sent"}


@router.delete("/{problem}/rounds")
def delete_problem_rounds_public(problem: str, delete_count: int = 1):
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
            
        # If requesting more rounds than exist, delete all available rounds
        rounds_to_delete = min(delete_count, len(rounds))
        
        # Delete the oldest rounds (first in sorted list)
        deleted = 0
        for round_dir in rounds[:rounds_to_delete]:
            try:
                import shutil
                shutil.rmtree(round_dir)
                deleted += 1
            except Exception as e:
                print(f"Error deleting round {round_dir}: {e}")
        
        return {"ok": True, "deleted": deleted, "message": f"Deleted {deleted} rounds"}
        
    except Exception as e:
        raise HTTPException(500, f"Error deleting rounds: {e}")


@router.get("/{problem}/files")
def list_problem_files_public(problem: str):
    """List all files in a problem directory."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    try:
        files = []
        
        # Find task file (can be task.txt, task.md, or task.tex)
        task_files = list(problem_dir.glob("task.*"))
        if task_files:
            task_file = task_files[0]  # Should only be one task file
            files.append({
                "name": task_file.name,
                "path": task_file.name,
                "type": "text" if task_file.suffix == ".txt" else 
                        "markdown" if task_file.suffix == ".md" else 
                        "latex" if task_file.suffix == ".tex" else "text",
                "size": task_file.stat().st_size,
                "modified": time.ctime(task_file.stat().st_mtime)
            })
        
        # Add other common files if they exist
        common_files = ["notes.md", "proofs.md", "output.md", "summary.md"]
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
                if paper_file.is_file() and not paper_file.name.endswith('.description.txt'):
                    # Look for description file
                    desc_file = papers_dir / f"{paper_file.stem}.description.txt"
                    description = ""
                    if desc_file.exists():
                        description = desc_file.read_text(encoding="utf-8").strip()
                    
                    files.append({
                        "name": f"papers/{paper_file.name}",
                        "path": f"papers/{paper_file.name}",
                        "type": "paper",
                        "size": paper_file.stat().st_size,
                        "modified": time.ctime(paper_file.stat().st_mtime),
                        "description": description
                    })
        
        
        # Add runs directory files (for completeness)
        runs_dir = problem_dir / "runs"
        if runs_dir.exists():
            for item in runs_dir.iterdir():
                if item.is_dir():  # Round directories
                    for run_file in item.iterdir():
                        if run_file.is_file():
                            files.append({
                                "name": f"runs/{item.name}/{run_file.name}",
                                "path": f"runs/{item.name}/{run_file.name}",
                                "type": "json" if run_file.suffix == ".json" else "text",
                                "size": run_file.stat().st_size,
                                "modified": time.ctime(run_file.stat().st_mtime)
                            })
        
        return files
        
    except Exception as e:
        raise HTTPException(500, f"Error listing files: {e}")


@router.get("/{problem}/file")
def get_problem_file_public(problem: str, file_path: str, version: Optional[str] = None):
    """Get content of a specific file in the problem directory, optionally a specific version."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    # Handle versioned files
    if version and file_path in ["notes.md", "output.md"]:
        if version == "current":
            full_path = problem_dir / file_path
        else:
            # version should be like "round-0001"
            versions_dir = problem_dir / "versions"
            filename_base = file_path.replace(".md", "")
            full_path = versions_dir / f"{filename_base}-{version}.md"
    else:
        full_path = problem_dir / file_path
    
    if not full_path.exists():
        raise HTTPException(404, "File not found")
    
    # Security check - ensure file is within problem directory or versions subdirectory
    try:
        full_path.resolve().relative_to(problem_dir.resolve())
    except ValueError:
        raise HTTPException(403, "Access denied")
    
    try:
        if full_path.suffix.lower() == '.pdf':
            return FileResponse(full_path)
        
        content = full_path.read_text(encoding="utf-8")
        return {"content": content}
    except Exception as e:
        raise HTTPException(500, f"Error reading file: {e}")


@router.put("/{problem}/file")
def update_problem_file_public(problem: str, file_path: str, payload: FileUpdatePayload):
    """Update content of a specific file in the problem directory."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    full_path = problem_dir / file_path
    
    if not full_path.exists():
        raise HTTPException(404, "File not found")
    
    # Security check - ensure file is within problem directory
    try:
        full_path.resolve().relative_to(problem_dir.resolve())
    except ValueError:
        raise HTTPException(403, "Access denied")
    
    try:
        # Update file content
        full_path.write_text(payload.content, encoding="utf-8")
        
        # Update description if provided and this is a paper file
        if payload.description is not None and file_path.startswith("papers/"):
            papers_dir = problem_dir / "papers"
            paper_name = Path(file_path).name
            desc_file = papers_dir / f"{Path(paper_name).stem}.description.txt"
            
            if payload.description.strip():
                desc_file.write_text(payload.description, encoding="utf-8")
            else:
                # Remove description file if description is empty
                if desc_file.exists():
                    desc_file.unlink()
        
        return {"message": "File updated successfully"}
        
    except Exception as e:
        raise HTTPException(500, f"Error updating file: {e}")


@router.get("/{problem}/file-versions")
def get_file_versions_public(problem: str, file_path: str):
    """Get available versions for a versioned file."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    
    if not problem_dir.exists():
        raise HTTPException(404, "Problem not found")
    
    if file_path not in ["notes.md", "output.md"]:
        raise HTTPException(400, "File versioning only supported for notes.md and output.md")
    
    try:
        versions = []
        
        # Add current version if file exists
        current_file = problem_dir / file_path
        if current_file.exists():
            versions.append({
                "version": "current",
                "label": "Current",
                "modified": time.ctime(current_file.stat().st_mtime)
            })
        
        # Add historical versions
        versions_dir = problem_dir / "versions"
        if versions_dir.exists():
            filename_base = file_path.replace(".md", "")
            pattern = f"{filename_base}-round-*.md"
            
            for version_file in sorted(versions_dir.glob(pattern), reverse=True):
                # Extract round number from filename
                try:
                    round_part = version_file.stem.split(f"{filename_base}-")[1]  # gets "round-0001"
                    round_num = int(round_part.split("-")[1])  # gets 1 from "round-0001"
                    versions.append({
                        "version": round_part,
                        "label": f"Round {round_num}",
                        "modified": time.ctime(version_file.stat().st_mtime)
                    })
                except (IndexError, ValueError):
                    continue  # Skip malformed filenames
        
        return {"versions": versions}
        
    except Exception as e:
        raise HTTPException(500, f"Error loading file versions: {e}")


@router.get("/{problem}/drafts")
def get_problem_drafts_public(problem: str):
    """Get list of drafts for a problem."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    drafts_dir = problem_dir / "drafts"
    
    if not drafts_dir.exists():
        return []
    
    try:
        import uuid
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


@router.post("/{problem}/upload-draft")
def upload_problem_draft_public(problem: str, file: UploadFile = File(...)):
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


@router.post("/{problem}/convert-output")
def convert_problem_output_md_public(problem: str):
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


@router.get("/{problem}/output-md") 
def check_problem_output_md_public(problem: str):
    """Check if output.md exists for a problem."""
    problem_dir = REPO_PROBLEMS_ROOT / problem
    output_file = problem_dir / "output.md"
    
    if output_file.exists():
        return {"exists": True}
    else:
        raise HTTPException(404, "output.md not found")


@router.delete("/{problem}")
def delete_problem_public(problem: str):
    """Delete a problem and all its associated data."""
    return TaskService.delete_problem(problem)


@router.post("/{problem}/reset")
def reset_problem_public(problem: str):
    """Reset a problem - keep task but delete all prover/verifier interactions."""
    return TaskService.reset_problem(problem)