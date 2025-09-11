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
    """Parse structured output - simple, no repair attempts."""
    # First check if we have any text at all
    if response_text is None:
        raise ValueError(f"GPT response text is None - text extraction failed from {model}")
    
    if not response_text.strip():
        raise ValueError(f"GPT response text is empty from {model}")
    
    try:
        return model_class.model_validate_json(response_text)
    except Exception as e:
        # No retries - fail fast with the actual response for debugging
        response_preview = response_text[:500] + "..." if len(response_text) > 500 else response_text
        raise ValueError(
            f"Failed to parse structured output from {model}. "
            f"Error: {e}. Response preview: {response_preview}"
        ) from e

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
MAX_OUTPUT_TOKENS = int(os.environ.get("AR_MAX_OUTPUT_TOKENS", "50000"))


def is_o_model(name: str) -> bool:
    """O-series models are not supported in this setup."""
    return False


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
                 previous_response_id: Optional[str] = None, tools: Optional[list] = None,
                 vector_store_ids: Optional[list[str]] = None) -> Tuple[str, float, Optional[str], dict, Any]:
    """Complete text using OpenAI API with appropriate settings for the model.
    
    Returns: (response_text, duration, response_id, usage, raw_response) where response_id can be used
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
        
        if previous_response_id:
            kwargs["previous_response_id"] = previous_response_id
        
        # For Responses API, structured output is configured via text.format  
        if response_format:
            # Extract schema from response_format for Responses API
            if isinstance(response_format, dict) and response_format.get("type") == "json_schema":
                json_schema_wrapper = response_format.get("json_schema", {})
                schema = json_schema_wrapper.get("schema", {})
                name = json_schema_wrapper.get("name", "structured_output")
                if schema:
                    kwargs["text"] = {"format": {"type": "json_schema", "name": name, "schema": schema}, "verbosity": "high"}
                    print(f"    Configured structured output with schema: {name}")
            else:
                print(f"    Warning: Unsupported response_format for Responses API: {response_format}")
        
        # Normalize incoming tools
        norm_tools = _normalize_tools(tools)
        
        # For Responses API, only allow supported tools (filter out code_interpreter)
        if norm_tools:
            allowed_tool_types = {"file_search"}
            norm_tools = [t for t in norm_tools if t.get("type") in allowed_tool_types]
            print(f"    Filtered tools for Responses API: {[t.get('type') for t in norm_tools]}")
        
        # For Responses API, vector stores are configured directly in the file_search tool
        if vector_store_ids:
            # Remove any existing file_search tool
            norm_tools = [t for t in (norm_tools or []) if t.get("type") != "file_search"]
            # Add file_search tool with vector_store_ids configuration
            file_search_tool = {
                "type": "file_search",
                "vector_store_ids": vector_store_ids
            }
            norm_tools.append(file_search_tool)
            print(f"    Configured file_search with vector stores: {vector_store_ids}")
        
        if norm_tools:
            kwargs["tools"] = norm_tools

        # Execute API call
        completion = client.responses.create(**kwargs)

        # Store raw response for debugging FIRST (before any processing)
        raw_response = None
        try:
            raw_response = completion.model_dump() if hasattr(completion, 'model_dump') else str(completion)
            print(f"    DEBUG: Raw response captured, size: {len(str(raw_response))}")
            
            # Raw response will be saved automatically by dump_io in the round directory
                
        except Exception as e:
            print(f"    DEBUG: Could not capture completion object: {e}")
            raw_response = {"error": f"Could not capture: {e}"}
        
        # Extract text from Responses API format - FIXED FOR REASONING RESPONSES
        print(f"    DEBUG: Completion object type: {type(completion)}")
        print(f"    DEBUG: Available attributes: {[attr for attr in dir(completion) if not attr.startswith('_')]}")
        
        # For GPT-5 reasoning models, extract text from reasoning summaries
        text = ""
        output_items = getattr(completion, "output", [])
        print(f"    DEBUG: Found {len(output_items)} output items")
        
        for i, item in enumerate(output_items):
            print(f"    DEBUG: Item {i}: {type(item)}")
            
            # Extract reasoning summaries (GPT-5 reasoning format)
            summary_items = getattr(item, "summary", [])
            if summary_items:
                print(f"    DEBUG: Found {len(summary_items)} summary items in item {i}")
                for j, summary in enumerate(summary_items):
                    if hasattr(summary, "text") and hasattr(summary, "type"):
                        summary_text = getattr(summary, "text", "")
                        summary_type = getattr(summary, "type", "")
                        if summary_text and summary_type == "summary_text":
                            text += summary_text + "\n\n"
                            print(f"    DEBUG: Added {len(summary_text)} chars from summary {j}")
            
            # Fallback: try output_text attribute
            direct_text = getattr(completion, "output_text", None)
            if direct_text:
                text += direct_text
                print(f"    DEBUG: Added {len(direct_text)} chars from direct output_text")
            
            # Original content parsing as fallback
                if hasattr(item, "content"):
                    content_items = getattr(item, "content", [])
                    print(f"    DEBUG: Item {i} has {len(content_items)} content pieces")
                    for j, piece in enumerate(content_items):
                        piece_text = getattr(piece, "text", None)
                        if piece_text:
                            text += piece_text
                            print(f"    DEBUG: Added {len(piece_text)} chars from content piece {j}")
        
        print(f"    DEBUG: Final extracted text: {'None' if text is None else len(text)} chars")
        if text and len(text) > 0:
            print(f"    DEBUG: Text preview: {text[:200]}...")
            
        # CRITICAL: If we still have no text but got reasoning summaries, this is a structured output failure
        if not text and output_items:
            print(f"    DEBUG: WARNING - Got response but no extractable text. This suggests structured output failed.")
            text = "ERROR: GPT-5 produced reasoning summaries but no structured JSON output."
        
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
            
        return text, duration, response_id, usage_dict, raw_response
        
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
        
        completion = client.chat.completions.create(**kwargs)
    
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
    
    content_text = ""
    try:
        choices = getattr(completion, "choices", []) or []
        if choices:
            first = choices[0]
            msg = getattr(first, "message", None)
            content_text = getattr(msg, "content", "") or ""
    except Exception:
        content_text = ""
    return content_text, duration, None, usage_dict, completion


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
        notes_file.write_text(str(content or ""), encoding="utf-8")
    elif mode == "append":
        existing = notes_file.read_text(encoding="utf-8") if notes_file.exists() else ""
        notes_file.write_text(existing + "\n\n" + str(content or ""), encoding="utf-8")


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
        proofs_file.write_text(str(content or ""), encoding="utf-8")
    elif mode == "append":
        existing = proofs_file.read_text(encoding="utf-8") if proofs_file.exists() else ""
        proofs_file.write_text(existing + "\n\n" + str(content or ""), encoding="utf-8")


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
        output_file.write_text(str(content or ""), encoding="utf-8")
    elif mode == "append":
        existing = output_file.read_text(encoding="utf-8") if output_file.exists() else ""
        output_file.write_text(existing + "\n\n" + str(content or ""), encoding="utf-8")


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