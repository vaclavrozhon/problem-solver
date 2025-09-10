"""
Draft writing router for the backend API.

This module handles all endpoints related to paper writing, draft management,
status tracking, and file operations for writing tasks.
"""

import os
import json
import time
import subprocess
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from typing import List, Optional
from pydantic import BaseModel

from ..models import WritingParams
from ..config import REPO_DRAFTS_ROOT
from ..services.tasks import TaskService


class CreateDraftPayload(BaseModel):
    name: str
    task_description: str
    initial_draft: str
    task_type: str = "tex"


router = APIRouter(prefix="/drafts_public", tags=["drafts"])


@router.get("")
def list_drafts_public():
    """List all drafts in the public repository without auth (dev convenience)."""
    drafts = []
    if REPO_DRAFTS_ROOT.exists():
        for draft_dir in REPO_DRAFTS_ROOT.iterdir():
            if draft_dir.is_dir():
                drafts.append(draft_dir.name)
    return drafts


@router.post("/create")
def create_draft_public(payload: CreateDraftPayload):
    """Create a new draft project with task and initial draft."""
    import re
    
    # Sanitize the name for filesystem
    safe_name = re.sub(r'[^a-zA-Z0-9_-]', '-', payload.name)
    draft_dir = REPO_DRAFTS_ROOT / safe_name
    
    if draft_dir.exists():
        raise HTTPException(400, f"Draft '{safe_name}' already exists")
    
    try:
        # Create directory structure
        draft_dir.mkdir(parents=True, exist_ok=True)
        (draft_dir / "drafts").mkdir(exist_ok=True)
        (draft_dir / "runs").mkdir(exist_ok=True)
        (draft_dir / "papers").mkdir(exist_ok=True)
        
        # Save task description
        task_file = draft_dir / "task.md"
        task_file.write_text(payload.task_description, encoding="utf-8")
        
        # Save initial draft
        draft_extension = "tex" if payload.task_type == "tex" else "md"
        initial_draft_file = draft_dir / "drafts" / f"initial_draft.{draft_extension}"
        initial_draft_file.write_text(payload.initial_draft, encoding="utf-8")
        
        # Initialize status file
        status_file = draft_dir / "runs" / "live_status.json"
        initial_status = {
            "phase": "idle",
            "round": 0,
            "ts": 0
        }
        status_file.write_text(json.dumps(initial_status, indent=2), encoding="utf-8")
        
        return {"ok": True, "name": safe_name}
        
    except Exception as e:
        # Clean up on failure
        if draft_dir.exists():
            import shutil
            shutil.rmtree(draft_dir)
        raise HTTPException(500, f"Failed to create draft: {str(e)}")


@router.get("/{draft}/status")
def get_draft_status_public(draft: str):
    """Get detailed draft status with round-by-round information."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    runs_dir = draft_dir / "runs"
    
    if not draft_dir.exists():
        raise HTTPException(404, "Draft not found")
    
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
    is_running = phase != "idle" and time.time() - ts < 600
    
    # Calculate remaining rounds from run metadata
    total_planned_rounds = 5  # Default fallback
    metadata_file = runs_dir / "run_metadata.json"
    if metadata_file.exists():
        try:
            metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
            total_planned_rounds = metadata.get("requested_rounds", 5)
        except Exception as e:
            print(f"Error reading run metadata: {e}")
    
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
    
    # Add error information if present
    if "error" in base_status:
        overall_status["error"] = base_status["error"]
    
    return {
        "overall": overall_status,
        "rounds": round_details,
        "models": base_status.get("models", {}),
        **base_status  # Include raw status for backward compatibility
    }


@router.get("/{draft}/rounds")
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
            suggester_file = round_dir / "paper_suggester.text.txt"
            if suggester_file.exists():
                try:
                    content = suggester_file.read_text(encoding="utf-8")
                    round_data["paper_suggester"] = {"content": content}
                except:
                    pass
            
            # Load paper fixer
            fixer_file = round_dir / "paper_fixer.text.txt"
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


@router.post("/{draft}/start-writing")
def start_writing_public(draft: str, params: WritingParams):
    """Start paper writing process for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    drafts_dir = draft_dir / "drafts"
    
    if not drafts_dir.exists() or not any(drafts_dir.iterdir()):
        raise HTTPException(400, "No drafts found. Upload a draft first.")
    
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
    env["AR_MODE"] = "writing"
    env["OPENAI_MODEL_PROVER"] = preset_config["prover"]
    env["OPENAI_MODEL_VERIFIER"] = preset_config["verifier"]
    env["OPENAI_MODEL_SUMMARIZER"] = preset_config["summarizer"]
    env["OPENAI_MODEL_PAPER_SUGGESTER"] = preset_config["paper_suggester"]
    env["OPENAI_MODEL_PAPER_FIXER"] = preset_config["paper_fixer"]
    
    # Save run metadata
    runs_dir = draft_dir / "runs"
    runs_dir.mkdir(exist_ok=True)
    metadata_file = runs_dir / "run_metadata.json"
    metadata = {
        "requested_rounds": params.rounds,
        "preset": params.preset,
        "started_at": time.time()
    }
    metadata_file.write_text(json.dumps(metadata, indent=2))
    
    cmd = [
        "python3", "orchestrator.py", str(draft_dir.resolve()),
        "--rounds", str(params.rounds),
        "--mode", "paper"
    ]
    proc = subprocess.Popen(cmd, cwd=str(Path(__file__).resolve().parent.parent.parent), env=env)
    return {"ok": True, "pid": proc.pid}


@router.post("/{draft}/stop")
def stop_draft_public(draft: str):
    """Stop a running draft by writing a stop signal."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    if not draft_dir.exists():
        raise HTTPException(404, "Draft not found")
    
    # Write stop signal
    stop_file = draft_dir / "runs" / "stop_signal"
    stop_file.parent.mkdir(exist_ok=True)
    stop_file.write_text(str(time.time()))
    
    return {"message": "Stop signal sent"}


@router.delete("/{draft}/rounds")
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
        
        # Check if we're deleting ALL rounds (full reset)
        is_full_reset = (delete_count >= len(rounds))
        
        # Delete the oldest rounds (first in sorted list)
        deleted = 0
        for round_dir in rounds[:delete_count]:
            try:
                import shutil
                shutil.rmtree(round_dir)
                deleted += 1
            except Exception as e:
                print(f"Error deleting round {round_dir}: {e}")
        
        # If full reset, also reset the status file and clean up generated files
        if is_full_reset:
            # Reset live_status.json
            status_file = runs_dir / "live_status.json"
            if status_file.exists():
                initial_status = {
                    "phase": "idle",
                    "round": 0,
                    "ts": 0
                }
                status_file.write_text(json.dumps(initial_status, indent=2))
            
            # Clean up other generated files in runs directory
            for file in runs_dir.iterdir():
                if file.is_file() and file.name not in ['live_status.json']:
                    try:
                        file.unlink()
                    except Exception as e:
                        print(f"Error deleting file {file}: {e}")
            
            # Clean up compiled outputs and LaTeX files
            for pattern in ['final_output.pdf', 'final_output.aux', 'final_output.log', 'final_output.out', 'final_output.tex']:
                output_file = draft_dir / pattern
                if output_file.exists():
                    try:
                        output_file.unlink()
                    except Exception as e:
                        print(f"Error deleting {pattern}: {e}")
            
            # Clean up generated drafts in drafts/ directory (keep only original)
            drafts_subdir = draft_dir / "drafts"
            if drafts_subdir.exists():
                # Keep only files that don't have timestamps in their names (original uploads)
                for draft_file in drafts_subdir.glob("*"):
                    if draft_file.is_file() and ("_" in draft_file.name and draft_file.name.count("_") >= 2):
                        # This looks like a generated draft with timestamp
                        try:
                            draft_file.unlink()
                        except Exception as e:
                            print(f"Error deleting generated draft {draft_file}: {e}")
            
            return {"ok": True, "deleted": deleted, "message": f"All {deleted} rounds deleted. Task reset to beginning."}
        
        return {"ok": True, "deleted": deleted, "message": f"Deleted {deleted} rounds"}
        
    except Exception as e:
        raise HTTPException(500, f"Error deleting rounds: {e}")


@router.get("/{draft}/drafts")
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


@router.get("/{draft}/files")
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


@router.get("/{draft}/file")
def get_draft_file_content_public(draft: str, file_path: str):
    """Get content of a specific file from a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    full_path = draft_dir / file_path
    
    if not draft_dir.exists():
        raise HTTPException(404, "Draft not found")
    
    if not full_path.exists():
        raise HTTPException(404, "File not found")
    
    # Security check - ensure file is within draft directory
    try:
        full_path.resolve().relative_to(draft_dir.resolve())
    except ValueError:
        raise HTTPException(403, "Access denied")
    
    try:
        # For PDFs, return a link instead of content
        if file_path.endswith('.pdf'):
            return FileResponse(full_path)
        
        content = full_path.read_text(encoding="utf-8")
        return {"content": content}
        
    except Exception as e:
        raise HTTPException(500, f"Error reading file: {e}")


@router.get("/{draft}/file-raw")
def get_draft_file_raw_public(draft: str, file_path: str):
    """Get raw file content (for PDFs, images, etc.)."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    full_path = draft_dir / file_path
    
    if not full_path.exists():
        raise HTTPException(404, "File not found")
    
    # Return the file directly
    return FileResponse(full_path)


@router.get("/{draft}/output-md")
def check_draft_output_md_public(draft: str):
    """Check if output.md exists for a draft."""
    draft_dir = REPO_DRAFTS_ROOT / draft
    output_file = draft_dir / "output.md"
    
    if output_file.exists():
        return {"exists": True}
    else:
        raise HTTPException(404, "output.md not found")


@router.post("/{draft}/upload-draft")
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


@router.post("/{draft}/convert-output")
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


@router.delete("/{draft}")
def delete_draft_public(draft: str):
    """Delete a draft and all its associated data."""
    return TaskService.delete_draft(draft)