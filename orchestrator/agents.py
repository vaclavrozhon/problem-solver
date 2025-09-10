"""
Shared agent utilities for the orchestrator system.

This module contains shared utilities used by both problem-solving and paper-writing agents:
- Model compatibility functions
- Text completion with Responses API support
- Response ID management for reasoning state preservation
- File update utilities
"""

import os
import json
import time
import random
from pathlib import Path
from typing import Optional, Tuple, Any, Dict
from openai import OpenAI

from .models import (
    NotesUpdate, ProofsUpdate, OutputUpdate
)
from .utils import extract_json_from_response


def parse_structured_output(model_class, response_text: str, model: str, system_prompt: str, 
                           user_message: str, response_format: Any = None):
    """Parse structured output with fallback and retry logic."""
    try:
        return model_class.model_validate_json(response_text)
    except Exception as e:
        # Try to salvage JSON substring
        try:
            json_only = extract_json_from_response(response_text)
            return model_class.model_validate_json(json_only)
        except Exception:
            # One constrained repair retry
            repair_prompt = (f"Your last message did not match the JSON schema due to: {e}. "
                           f"Return ONLY a JSON object that conforms to the exact schema I provided.")
            repair_text, _, _, _ = complete_text(
                model, system_prompt, user_message + "\n\n" + repair_prompt,
                response_format=response_format
            )
            return model_class.model_validate_json(extract_json_from_response(repair_text))

# Initialize OpenAI client
client = OpenAI()

# New reasoning configuration with validation
def _validate_reasoning_effort(effort: str) -> str:
    """Validate and return reasoning effort."""
    valid_efforts = {"low", "medium", "high"}
    if effort.lower() not in valid_efforts:
        print(f"Warning: Invalid AR_REASONING_EFFORT '{effort}'. Using 'high'. Valid values: {valid_efforts}")
        return "high"
    return effort.lower()

def _validate_reasoning_summary(summary: str) -> str:
    """Validate and return reasoning summary."""
    valid_summaries = {"auto", "detailed", "none"}
    if summary.lower() not in valid_summaries:
        print(f"Warning: Invalid AR_REASONING_SUMMARY '{summary}'. Using 'auto'. Valid values: {valid_summaries}")
        return "auto"
    return summary.lower()

REASONING_EFFORT = _validate_reasoning_effort(os.environ.get("AR_REASONING_EFFORT", "high"))
REASONING_SUMMARY = _validate_reasoning_summary(os.environ.get("AR_REASONING_SUMMARY", "auto"))
MAX_OUTPUT_TOKENS = int(os.environ.get("AR_MAX_OUTPUT_TOKENS", "8192"))


def is_o_model(name: str) -> bool:
    """Check if model is an O-series model."""
    return name.startswith("o1") or name.startswith("o3")


def is_reasoning_model(name: str) -> bool:
    """Check if model supports reasoning controls via Responses API."""
    return any(name.startswith(p) for p in ["o3", "o4", "gpt-5"])


def save_response_id(problem_dir: Path, round_idx: int, agent: str, response_id: str, model: str = ""):
    """Save response ID for reasoning state preservation, keyed by agent and model."""
    if not response_id:
        return
        
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    # Load existing response IDs
    response_ids_file = round_dir / "response_ids.json"
    store = {}
    if response_ids_file.exists():
        try:
            store = json.loads(response_ids_file.read_text(encoding="utf-8"))
        except Exception:
            store = {}
    
    # Save this agent's response ID for this model
    store.setdefault(agent, {})[model] = response_id
    
    # Atomic write to prevent corruption during parallel execution
    try:
        response_ids_file.write_text(json.dumps(store, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"Warning: Failed to save response ID for {agent}/{model}: {e}")


def load_previous_response_id(problem_dir: Path, round_idx: int, agent: str, model: str) -> Optional[str]:
    """Load previous response ID for reasoning state preservation, matching agent and model."""
    if round_idx <= 1:
        return None
    
    prev_round_idx = round_idx - 1
    response_ids_file = problem_dir / "runs" / f"round-{prev_round_idx:04d}" / "response_ids.json"
    
    if not response_ids_file.exists():
        return None
    
    try:
        store = json.loads(response_ids_file.read_text(encoding="utf-8"))
        return (store.get(agent) or {}).get(model)
    except Exception:
        return None


def _with_retries(call, max_retries=4):
    """Execute a function with exponential backoff retries."""
    delay = 0.5
    for attempt in range(max_retries):
        try:
            return call()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay + random.random() * 0.25)
            delay *= 2


def _normalize_tools(tools):
    """Convert tools into [{'type': ...}] dicts and deduplicate by type."""
    if not tools:
        return []
    norm = []
    seen = set()
    for t in tools:
        ttype = t if isinstance(t, str) else t.get("type")
        if not ttype or ttype in seen:
            continue
        seen.add(ttype)
        norm.append({"type": ttype})
    return norm


def load_prover_focus_prompts() -> dict:
    """Load prover focus mini-prompts from JSON file."""
    focus_file = Path(__file__).parent.parent / "prompts" / "prover_focus.json"
    if not focus_file.exists():
        return {"default": {"name": "No special instructions", "prompt": ""}}
    
    try:
        return json.loads(focus_file.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, FileNotFoundError):
        return {"default": {"name": "No special instructions", "prompt": ""}}


def complete_text(model: str, system_prompt: str, user_message: str,
                 response_format: Any = None, temperature: float = 0.2, 
                 previous_response_id: str = None, tools: list = None, attachments: list = None) -> Tuple[str, float, str, dict]:
    """Complete text using OpenAI API with appropriate settings for the model.
    
    Returns: (response_text, duration, response_id, usage) where response_id can be used
    for reasoning state preservation in subsequent calls and usage contains token counts.
    """
    start_time = time.perf_counter()
    
    # Debug logging
    print(f"    Model: {model}, Effort: {REASONING_EFFORT}, MaxTokens: {MAX_OUTPUT_TOKENS}, "
          f"PrevResponseID: {'✓' if previous_response_id else '✗'}")
    
    if is_reasoning_model(model):
        # Use Responses API for reasoning models (GPT-5, O3, O4)
        input_msgs = []
        if system_prompt:
            # For reasoning models, use developer role for system prompts
            input_msgs.append({"role": "developer", "content": system_prompt})
        input_msgs.append({"role": "user", "content": user_message})

        kwargs = {
            "model": model,
            "input": input_msgs,
            "reasoning": {"effort": REASONING_EFFORT, "summary": REASONING_SUMMARY},
            "max_output_tokens": MAX_OUTPUT_TOKENS,
        }
        
        if response_format:
            kwargs["response_format"] = response_format
        
        if previous_response_id:
            kwargs["previous_response_id"] = previous_response_id
        
        # Normalize incoming tools
        norm_tools = _normalize_tools(tools)
        
        if attachments:
            kwargs["attachments"] = attachments
            # Ensure file_search is available whenever attachments are present
            if not any(t["type"] == "file_search" for t in norm_tools):
                norm_tools.append({"type": "file_search"})
        
        if norm_tools:
            kwargs["tools"] = norm_tools

        # Execute with retries
        def _call():
            return client.responses.create(**kwargs)
        
        completion = _with_retries(_call)

        # Extract text from Responses API format
        text = getattr(completion, "output_text", None)
        if text is None:
            # Fallback: stitch text pieces for older SDK versions
            text = ""
            for item in completion.output:
                if hasattr(item, "content"):
                    for piece in item.content:
                        if hasattr(piece, "text"):
                            text += piece.text
        
        duration = time.perf_counter() - start_time
        response_id = getattr(completion, "id", None)
        
        # Extract usage information
        usage_dict = {}
        try:
            usage = getattr(completion, 'usage', None)
            if usage:
                usage_dict = {
                    'input_tokens': getattr(usage, 'input_tokens', 0),
                    'output_tokens': getattr(usage, 'output_tokens', 0),
                    'reasoning_tokens': getattr(usage, 'reasoning_tokens', 0)
                }
                print(f"    Usage - Input: {usage_dict['input_tokens']}, "
                      f"Output: {usage_dict['output_tokens']}, "
                      f"Reasoning: {usage_dict['reasoning_tokens']}")
        except Exception:
            pass  # Don't fail on usage logging errors
            
        return text, duration, response_id, usage_dict
        
    elif is_o_model(model):
        # O-series models don't support system prompts or temperature
        combined_message = f"{system_prompt}\n\n{user_message}" if system_prompt else user_message
        messages = [{"role": "user", "content": combined_message}]
        
        def _call():
            return client.chat.completions.create(
                model=model,
                messages=messages,
                response_format=response_format
            )
        
        completion = _with_retries(_call)
    else:
        # Standard models (GPT-4, etc.)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_message})
        
        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature
        }
        if response_format:
            kwargs["response_format"] = response_format
        
        def _call():
            return client.chat.completions.create(**kwargs)
            
        completion = _with_retries(_call)
    
    duration = time.perf_counter() - start_time
    
    # Extract usage for standard models
    usage_dict = {}
    try:
        usage = getattr(completion, 'usage', None)
        if usage:
            usage_dict = {
                'input_tokens': getattr(usage, 'prompt_tokens', 0),
                'output_tokens': getattr(usage, 'completion_tokens', 0),
                'reasoning_tokens': 0  # Standard models don't have reasoning tokens
            }
            print(f"    Usage - Input: {usage_dict['input_tokens']}, "
                  f"Output: {usage_dict['output_tokens']}")
    except Exception:
        pass  # Don't fail on usage logging errors
    
    return completion.choices[0].message.content, duration, None, usage_dict


def _get_update_mode_and_content(u):
    """Accept legacy and new field names for backward compatibility."""
    mode = getattr(u, "mode", None) or getattr(u, "action", None)
    content = getattr(u, "content_md", None) or getattr(u, "content", None)
    return mode, content


def apply_notes_update(problem_dir: Path, update: NotesUpdate, round_idx: int = 0) -> None:
    """Apply an update to the notes.md file and save versioned copy."""
    notes_file = problem_dir / "notes.md"
    
    # Create versioned backup
    if notes_file.exists() and round_idx > 0:
        backup_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_file = backup_dir / "notes.appended.md"
        backup_file.write_text(notes_file.read_text(encoding="utf-8"), encoding="utf-8")
    
    # Apply update with backward compatibility
    mode, content = _get_update_mode_and_content(update)
    if mode == "replace":
        notes_file.write_text(content, encoding="utf-8")
    elif mode == "append":
        existing = notes_file.read_text(encoding="utf-8") if notes_file.exists() else ""
        notes_file.write_text(existing + "\n\n" + content, encoding="utf-8")


def apply_proofs_update(problem_dir: Path, update: ProofsUpdate, round_idx: int = 0) -> None:
    """Apply an update to the proofs.md file and save versioned copy."""
    proofs_file = problem_dir / "proofs.md"
    
    # Create versioned backup
    if proofs_file.exists() and round_idx > 0:
        backup_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_file = backup_dir / "proofs.appended.md"
        backup_file.write_text(proofs_file.read_text(encoding="utf-8"), encoding="utf-8")
    
    # Apply update with backward compatibility
    mode, content = _get_update_mode_and_content(update)
    if mode == "replace":
        proofs_file.write_text(content, encoding="utf-8")
    elif mode == "append":
        existing = proofs_file.read_text(encoding="utf-8") if proofs_file.exists() else ""
        proofs_file.write_text(existing + "\n\n" + content, encoding="utf-8")


def apply_output_update(problem_dir: Path, update: OutputUpdate, round_idx: int = 0) -> None:
    """Apply an update to the output.md file and save versioned copy."""
    output_file = problem_dir / "output.md"
    
    # Create versioned backup
    if output_file.exists() and round_idx > 0:
        backup_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_file = backup_dir / "output.appended.md"
        backup_file.write_text(output_file.read_text(encoding="utf-8"), encoding="utf-8")
    
    # Apply update with backward compatibility
    mode, content = _get_update_mode_and_content(update)
    if mode == "replace":
        output_file.write_text(content, encoding="utf-8")
    elif mode == "append":
        existing = output_file.read_text(encoding="utf-8") if output_file.exists() else ""
        output_file.write_text(existing + "\n\n" + content, encoding="utf-8")


def ensure_three_tier_files(problem_dir: Path) -> None:
    """Ensure notes.md, proofs.md, and output.md exist in the problem directory."""
    # Always ensure notes.md exists
    notes_file = problem_dir / "notes.md"
    if not notes_file.exists():
        notes_file.write_text("# Research Notes\n\n", encoding="utf-8")
    
    # Always ensure proofs.md exists (start empty for existing problems)
    proofs_file = problem_dir / "proofs.md"
    if not proofs_file.exists():
        proofs_file.write_text("# Rigorous Proofs\n\n", encoding="utf-8")
    
    # Always ensure output.md exists
    output_file = problem_dir / "output.md"
    if not output_file.exists():
        output_file.write_text("# Main Results\n\n", encoding="utf-8")