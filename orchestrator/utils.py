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
    """Log status (no filesystem writes)."""
    model_prover = os.environ.get("OPENAI_MODEL_PROVER", "gpt-5")
    model_verifier = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-5")
    model_summarizer = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-5-mini")
    status = {
        "phase": phase,
        "round": round_idx,
        "ts": int(time.time()),
        "models": {
            "prover": model_prover,
            "verifier": model_verifier,
            "summarizer": model_summarizer,
            
        }
    }
    if extra:
        status.update(extra)
    print(f"[STATUS] {json.dumps(status)}")


def gather_context_files(problem_dir: Path, round_idx: int) -> list[str]:
    """DB-only mode: no filesystem context files to gather."""
    return []


def auto_commit_round(problem_dir: Path, round_idx: int, verdict: str):
    """No-op: disabled filesystem git operations."""
    print(f"[GIT] Auto-commit disabled (round {round_idx}, verdict={verdict})")


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
    """Log-only; no filesystem writes."""
    summary = {
        "agent": agent,
        "model": model,
        "duration_s": duration_s,
        "response_text_len": len(response_text) if response_text else 0,
        "has_raw_response": bool(raw_response),
        "usage": usage or {},
        "error": error or ""
    }
    print(f"[DEBUG] dump_io {json.dumps(summary)}")


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

    


def pre_dump_io(round_dir: Path, agent: str, system_prompt: str, user_message: str, 
                model: str) -> None:
    """Log-only; no filesystem writes."""
    print(f"[DEBUG] pre_dump_io agent={agent} model={model} sys_len={len(system_prompt)} user_len={len(user_message)}")


def dump_failure(round_dir: Path, agent: str, system_prompt: str, user_message: str, 
                error: str, model: str, stage: Optional[str] = None) -> None:
    """Log-only; no filesystem writes."""
    failure_data = {
        "timestamp": time.time(),
        "agent": agent,
        "model": model,
        "stage": stage or "unknown",
        "error": error,
        "system_prompt_length": len(system_prompt),
        "user_message_length": len(user_message)
    }
    print(f"[FAILURE] {json.dumps(failure_data)}")


def enhanced_write_status(problem_dir: Path, phase: str, round_idx: int, 
                         error_component: Optional[str] = None, 
                         error_phase: Optional[str] = None,
                         error: Optional[str] = None,
                         extra: dict | None = None):
    """Log status with error context (no filesystem writes)."""
    model_prover = os.environ.get("OPENAI_MODEL_PROVER", "gpt-5")
    model_verifier = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-5")
    model_summarizer = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-5-mini")
    status = {
        "phase": phase,
        "round": round_idx,
        "ts": int(time.time()),
        "models": {
            "prover": model_prover,
            "verifier": model_verifier,
            "summarizer": model_summarizer,
            
        }
    }
    if error:
        status["error"] = error
        if error_component:
            status["error_component"] = error_component
        if error_phase:
            status["error_phase"] = error_phase
    if extra:
        status.update(extra)
    print(f"[STATUS+ERR] {json.dumps(status)}")


def check_stop_signal(problem_dir: Path) -> bool:
    """Check DB for stop request for the active run (no filesystem)."""
    try:
        from .database_integration import get_database_integration
        dbi = get_database_integration()
        if not dbi or not dbi.db_client or not dbi.problem_id:
            return False
        # Avoid creating new event loops here; use direct sync queries
        # because this function is called from sync orchestrator code.
        # Read active_run_id from problems then check run status.
        problem_resp = dbi.db_client.table('problems')\
            .select('active_run_id')\
            .eq('id', dbi.problem_id)\
            .single()\
            .execute()
        problem = getattr(problem_resp, 'data', None)
        active_run_id = problem.get('active_run_id') if problem else None
        if not active_run_id:
            return False
        run_resp = dbi.db_client.table('runs')\
            .select('status')\
            .eq('id', int(active_run_id))\
            .single()\
            .execute()
        run_row = getattr(run_resp, 'data', None)
        status = (run_row or {}).get('status') if run_row else None
        return status == 'stopping' or status == 'stopped'
    except Exception:
        return False


class StopSignalException(Exception):
    """Exception raised when a stop signal is detected."""
    pass