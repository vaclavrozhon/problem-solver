"""
Utility functions for the orchestrator system.

This module contains helper functions for file operations, status management,
JSON processing, and other common utilities.
"""

import os
import json
import time
import subprocess
from pathlib import Path
from typing import Optional, Any, Dict
from datetime import datetime


def load_prompt(name: str) -> str:
    """Load a prompt template from the prompts directory."""
    prompt_path = Path(__file__).parent.parent / "prompts" / f"{name}.md"
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
    return prompt_path.read_text(encoding="utf-8")


def write_status(problem_dir: Path, phase: str, round_idx: int, extra: dict | None = None):
    """Write live status so the UI can show current phase + since when."""
    # Get model configuration from environment
    model_prover = os.environ.get("OPENAI_MODEL_PROVER", "gpt-5")
    model_verifier = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-5")
    model_summarizer = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-5-mini")
    model_paper_suggester = os.environ.get("OPENAI_MODEL_PAPER_SUGGESTER", model_prover)
    model_paper_fixer = os.environ.get("OPENAI_MODEL_PAPER_FIXER", model_prover)
    
    status = {
        "phase": phase,  # "prover" | "verifier" | "summarizer" | "paper_suggester" | "paper_fixer" | "idle"
        "round": round_idx,
        "ts": int(time.time()),  # Unix timestamp for timezone-proof elapsed time
        "models": {
            "prover": model_prover,
            "verifier": model_verifier,
            "summarizer": model_summarizer,
            "paper_suggester": model_paper_suggester,
            "paper_fixer": model_paper_fixer,
        }
    }
    
    if extra:
        status.update(extra)
    
    status_file = problem_dir / "runs" / "live_status.json"
    status_file.parent.mkdir(exist_ok=True)
    status_file.write_text(json.dumps(status, indent=2), encoding="utf-8")


def gather_context_files(problem_dir: Path, round_idx: int) -> list[str]:
    """Gather all relevant context files for this round."""
    files = []
    runs_dir = problem_dir / "runs"
    
    # Previous rounds' summaries
    for prev_idx in range(1, round_idx):
        summary_file = runs_dir / f"round-{prev_idx:04d}" / "summarizer.summary.md"
        if summary_file.exists():
            files.append(str(summary_file.relative_to(problem_dir)))
    
    # Current round's prover outputs
    current_round_dir = runs_dir / f"round-{round_idx:04d}"
    for prover_file in sorted(current_round_dir.glob("prover-*.text.txt")):
        files.append(str(prover_file.relative_to(problem_dir)))
    
    # Notes and outputs
    for name in ["notes.md", "output.md"]:
        file = problem_dir / name
        if file.exists():
            files.append(name)
    
    return files


def auto_commit_round(problem_dir: Path, round_idx: int, verdict: str):
    """Auto-commit changes after each round if configured."""
    if not os.environ.get("AR_GIT_AUTOCOMMIT"):
        return
    
    try:
        # Stage all changes
        subprocess.run(["git", "add", "."], cwd=problem_dir, check=True, capture_output=True)
        
        # Commit with descriptive message
        commit_msg = f"Round {round_idx} complete: {verdict}"
        subprocess.run(
            ["git", "commit", "-m", commit_msg],
            cwd=problem_dir,
            check=True,
            capture_output=True
        )
        print(f"  [git] Committed round {round_idx}")
    except subprocess.CalledProcessError:
        pass  # Ignore git errors


def extract_json_from_response(text: str) -> Optional[dict]:
    """Extract JSON from a response that might have markdown code blocks."""
    import re
    
    # Try to find JSON in code blocks
    json_pattern = r'```(?:json)?\s*\n(.*?)\n```'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    if matches:
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    
    # Try to parse the whole text as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try to find JSON-like structure in the text
    try:
        start = text.index('{')
        end = text.rindex('}') + 1
        return json.loads(text[start:end])
    except (ValueError, json.JSONDecodeError):
        pass
    
    return None


def dump_io(round_dir: Path, agent: str, system_prompt: str, user_message: str,
            response_text: str, response_obj: Any, duration_s: float,
            model: str, error: str | None = None, usage: dict | None = None, 
            raw_response: dict | None = None) -> None:
    """Save all input/output for an agent interaction."""
    print(f"[DEBUG] dump_io called for {agent}: response_text={len(response_text) if response_text else 0} chars, raw_response={'present' if raw_response else 'missing'}")
    # Save prompts
    (round_dir / f"{agent}.prompt.txt").write_text(
        f"=== SYSTEM ===\n{system_prompt}\n\n=== USER ===\n{user_message}",
        encoding="utf-8"
    )
    
    # Save raw response
    (round_dir / f"{agent}.text.txt").write_text(response_text, encoding="utf-8")
    
    # Save parsed output
    if response_obj:
        if hasattr(response_obj, 'model_dump'):
            output_dict = response_obj.model_dump()
        else:
            output_dict = response_obj
        (round_dir / f"{agent}.out.json").write_text(
            json.dumps(output_dict, indent=2),
            encoding="utf-8"
        )
    
    # Save raw API response if available
    raw_data = {
        "model": model,
        "duration_s": duration_s,
        "timestamp": datetime.now().isoformat(),
    }
    if error:
        raw_data["error"] = error
    if usage:
        raw_data["usage"] = usage
    
    (round_dir / f"{agent}.raw.json").write_text(
        json.dumps(raw_data, indent=2),
        encoding="utf-8"
    )
    
    # Save the complete raw response from the API for debugging
    if raw_response:
        raw_file = round_dir / f"{agent}.response.full.json"
        raw_file.write_text(
            json.dumps(raw_response, indent=2),
            encoding="utf-8"
        )
        print(f"[DEBUG] Saved raw response to {raw_file}")
    else:
        print(f"[DEBUG] No raw response to save for {agent}")
    
    # Update timings file
    timings_file = round_dir / "timings.json"
    timings = {}
    if timings_file.exists():
        timings = json.loads(timings_file.read_text(encoding="utf-8"))
    
    timings_entry = {
        "model": model,
        "duration_s": duration_s,
    }
    
    # Add usage information if available (from Responses API)
    if usage:
        timings_entry["usage"] = usage
        
    timings[agent] = timings_entry
    
    timings_file.write_text(json.dumps(timings, indent=2), encoding="utf-8")


def enforce_no_additional_properties(schema_obj: dict) -> dict:
    """Recursively add 'additionalProperties': false to all objects in schema."""
    if isinstance(schema_obj, dict):
        if schema_obj.get("type") == "object" and "additionalProperties" not in schema_obj:
            schema_obj["additionalProperties"] = False
        for key, value in schema_obj.items():
            schema_obj[key] = enforce_no_additional_properties(value)
    elif isinstance(schema_obj, list):
        return [enforce_no_additional_properties(item) for item in schema_obj]
    return schema_obj


def enforce_required_all_properties(schema_obj: dict) -> dict:
    """Recursively ensure all properties are required in schema."""
    if isinstance(schema_obj, dict):
        if schema_obj.get("type") == "object" and "properties" in schema_obj:
            schema_obj["required"] = list(schema_obj["properties"].keys())
        for key, value in schema_obj.items():
            schema_obj[key] = enforce_required_all_properties(value)
    elif isinstance(schema_obj, list):
        return [enforce_required_all_properties(item) for item in schema_obj]
    return schema_obj


def normalize_schema_strict(schema_obj: dict) -> dict:
    """Normalize schema for strict mode."""
    schema_obj = enforce_no_additional_properties(schema_obj)
    schema_obj = enforce_required_all_properties(schema_obj)
    return schema_obj


def compile_latex(problem_dir: Path, round_idx: int) -> tuple[bool, str]:
    """Compile LaTeX in the problem directory."""
    tex_file = problem_dir / "final_output.tex"
    if not tex_file.exists():
        return False, "No final_output.tex found"
    
    return compile_tex_string(problem_dir, round_idx, tex_file.read_text(encoding="utf-8"))


def compile_tex_string(problem_dir: Path, round_idx: int, tex_source: str, 
                       basename: str = "final_output") -> tuple[bool, str, Path | None]:
    """Compile a LaTeX string and return success status, log, and PDF path if successful."""
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(exist_ok=True)
    
    # Write the tex source to round directory
    tex_file = round_dir / f"{basename}.tex"
    tex_file.write_text(tex_source, encoding="utf-8")
    
    # Also write to problem directory for final output
    if basename == "final_output":
        # Atomic write for main tex
        main_tex = problem_dir / "final_output.tex"
        tmp = problem_dir / "final_output.tex.tmp"
        tmp.write_text(tex_source, encoding="utf-8")
        os.replace(tmp, main_tex)
    
    # Try to compile
    try:
        result = subprocess.run(
            ["pdflatex", "-no-shell-escape", "-interaction=nonstopmode", basename],
            cwd=problem_dir if basename == "final_output" else round_dir,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Save compile log
        log_file = round_dir / f"{basename}.compile.log"
        log_file.write_text(result.stdout + "\n" + result.stderr, encoding="utf-8")
        
        # Check if PDF was created
        pdf_path = problem_dir / f"{basename}.pdf" if basename == "final_output" else round_dir / f"{basename}.pdf"
        
        if pdf_path.exists():
            return True, result.stdout, pdf_path
        else:
            return False, result.stdout + "\n" + result.stderr, None
            
    except subprocess.TimeoutExpired:
        return False, "LaTeX compilation timed out", None
    except Exception as e:
        return False, f"LaTeX compilation error: {str(e)}", None


def pre_dump_io(round_dir: Path, agent: str, system_prompt: str, user_message: str, 
                model: str) -> None:
    """Save input data before API call for debugging failures."""
    round_dir.mkdir(parents=True, exist_ok=True)
    
    # Save prompts with pre- prefix to distinguish from normal dumps
    (round_dir / f"{agent}.pre.prompt.txt").write_text(
        f"=== SYSTEM ===\n{system_prompt}\n\n=== USER ===\n{user_message}",
        encoding="utf-8"
    )
    
    # Save metadata
    pre_data = {
        "agent": agent,
        "model": model,
        "timestamp": time.time(),
        "system_prompt_length": len(system_prompt),
        "user_message_length": len(user_message),
        "status": "pre_api_call"
    }
    
    (round_dir / f"{agent}.pre.meta.json").write_text(
        json.dumps(pre_data, indent=2),
        encoding="utf-8"
    )
    
    print(f"[DEBUG] Pre-dumped inputs for {agent} (system: {len(system_prompt)} chars, user: {len(user_message)} chars)")


def dump_failure(round_dir: Path, agent: str, system_prompt: str, user_message: str, 
                error: str, model: str, stage: Optional[str] = None) -> None:
    """Dump debug info when API calls or processing fails."""
    round_dir.mkdir(parents=True, exist_ok=True)
    
    failure_data = {
        "timestamp": time.time(),
        "agent": agent,
        "model": model, 
        "stage": stage or "unknown",
        "error": error,
        "system_prompt_length": len(system_prompt),
        "user_message_length": len(user_message),
        "system_prompt": system_prompt,
        "user_message": user_message
    }
    
    (round_dir / f"{agent}.failure.json").write_text(
        json.dumps(failure_data, indent=2), encoding="utf-8"
    )
    
    print(f"[DEBUG] Dumped failure data for {agent} at stage '{stage}': {error}")


def enhanced_write_status(problem_dir: Path, phase: str, round_idx: int, 
                         error_component: Optional[str] = None, 
                         error_phase: Optional[str] = None,
                         error: Optional[str] = None,
                         extra: dict | None = None):
    """Enhanced status writing with detailed error context."""
    # Get model configuration from environment
    model_prover = os.environ.get("OPENAI_MODEL_PROVER", "gpt-5")
    model_verifier = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-5")
    model_summarizer = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-5-mini")
    model_paper_suggester = os.environ.get("OPENAI_MODEL_PAPER_SUGGESTER", model_prover)
    model_paper_fixer = os.environ.get("OPENAI_MODEL_PAPER_FIXER", model_prover)
    
    status = {
        "phase": phase,
        "round": round_idx,
        "ts": int(time.time()),
        "models": {
            "prover": model_prover,
            "verifier": model_verifier,
            "summarizer": model_summarizer,
            "paper_suggester": model_paper_suggester,
            "paper_fixer": model_paper_fixer,
        }
    }
    
    # Add enhanced error information
    if error:
        status["error"] = error
        if error_component:
            status["error_component"] = error_component
        if error_phase:
            status["error_phase"] = error_phase
    
    if extra:
        status.update(extra)
    
    status_file = problem_dir / "runs" / "live_status.json"
    status_file.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        status_file.write_text(json.dumps(status, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"Warning: Failed to write status: {e}")