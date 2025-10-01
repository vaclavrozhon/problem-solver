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
# No longer importing extract_json_from_response (unused in DB-only flow)


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

# Initialize OpenAI client with extended timeout for reasoning models
client = OpenAI(timeout=1800.0)  # 30 minute timeout for GPT-5 reasoning

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
MAX_OUTPUT_TOKENS = int(os.environ.get("AR_MAX_OUTPUT_TOKENS", "100000"))


def is_o_model(name: str) -> bool:
    """O-series models are not supported in this setup."""
    return False


def is_reasoning_model(name: str) -> bool:
    """Check if model supports reasoning controls via Responses API."""
    return any(name.startswith(p) for p in ["o3", "o4", "gpt-5"])


def save_response_id(problem_dir: Path, round_idx: int, agent: str, response_id: str, model: str = ""):
    """Persist response ID to database for reasoning state preservation."""
    if not response_id:
        return
    try:
        from .database_integration import get_database_integration, DatabaseService as _DS
        dbi = get_database_integration()
        if not dbi or not dbi.db_client or not dbi.problem_id:
            return
        import asyncio, json
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(_DS.create_problem_file(  # type: ignore
                db=dbi.db_client,
                problem_id=dbi.problem_id,
                round_num=round_idx,
                file_type='response_ids',
                filename=f'{agent}.json',
                content=json.dumps({"agent": agent, "model": model, "response_id": response_id}, indent=2),
                metadata={"model": model}
            ))
        finally:
            try:
                loop.close()
            except Exception:
                pass
    except Exception as e:
        print(f"Warning: Failed to save response ID to DB for {agent}/{model}: {e}")


def load_previous_response_id(problem_dir: Path, round_idx: int, agent: str, model: str) -> Optional[str]:
    """Load previous response ID from database (prior round)."""
    if round_idx <= 1:
        return None
    try:
        from .database_integration import get_database_integration, DatabaseService as _DS
        dbi = get_database_integration()
        if not dbi or not dbi.db_client or not dbi.problem_id:
            return None
        import asyncio, json
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        prev_round_idx = round_idx - 1
        try:
            files = loop.run_until_complete(_DS.get_problem_files(  # type: ignore
                db=dbi.db_client,
                problem_id=dbi.problem_id,
                round=prev_round_idx,
                file_type='response_ids'
            ))
        finally:
            try:
                loop.close()
            except Exception:
                pass
        for f in files or []:
            try:
                data = json.loads(f.get('content','') or '{}')
                if data.get('agent') == agent and (data.get('model') == model or not data.get('model')):
                    return data.get('response_id')
            except Exception:
                continue
        return None
    except Exception:
        return None


    


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
    try:
        focus_file = Path(__file__).parent.parent / "prompts" / "prover_focus.json"
        return json.loads(focus_file.read_text(encoding="utf-8"))
    except Exception:
        return {"default": {"name": "No special instructions", "prompt": ""}}


def complete_text(model: str, system_prompt: str, user_message: str,
                 response_format: Any = None, temperature: float = 0.2, 
                 previous_response_id: Optional[str] = None, tools: Optional[list] = None) -> Tuple[str, float, Optional[str], dict, Any]:
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
                strict = json_schema_wrapper.get("strict", True)
                if schema:
                    kwargs["text"] = {
                        "format": {
                            "type": "json_schema",
                            "name": name,
                            "schema": schema,
                            "strict": strict,
                        },
                        "verbosity": "low",
                    }
                    print(f"    Configured structured output with schema: {name}, strict={strict}")
            else:
                print(f"    Warning: Unsupported response_format for Responses API: {response_format}")
        
        # Remove response_format from kwargs - Responses API uses text.format instead
        kwargs.pop("response_format", None)
        
        # Normalize incoming tools
        norm_tools = _normalize_tools(tools)
        
        # For Responses API, we do not use tools now (no vector store, no code interpreter)
        norm_tools = []
        
        # Vector stores removed
        
        # No tools sent

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
        
        expects_structured = bool(kwargs.get("text", {}).get("format", {}).get("type") == "json_schema")
        
        text = ""
        if expects_structured:
            # For structured output, rely solely on output_text
            text = getattr(completion, "output_text", "") or ""
            print(f"    DEBUG: Structured mode - extracted {len(text)} chars from output_text")
        else:
            # Legacy/free-text path: prefer output_text; otherwise collect content and summaries
            text = getattr(completion, "output_text", "") or ""
            if not text:
                # collect content pieces
                output_items = getattr(completion, "output", []) or []
                print(f"    DEBUG: Found {len(output_items)} output items")
                
                for i, item in enumerate(output_items):
                    print(f"    DEBUG: Item {i}: {type(item)}")
                    
                    if hasattr(item, "content"):
                        content_items = getattr(item, "content", [])
                        print(f"    DEBUG: Item {i} has {len(content_items)} content pieces")
                        for j, piece in enumerate(content_items):
                            piece_text = getattr(piece, "text", None)
                            if piece_text:
                                text += piece_text
                                print(f"    DEBUG: Added {len(piece_text)} chars from content piece {j}")
                
                # Only in non-structured mode, append summaries for debugging
                for item in output_items:
                    summary_items = getattr(item, "summary", [])
                    for s in summary_items:
                        if getattr(s, "type", "") == "summary_text" and getattr(s, "text", ""):
                            text += "\n\n" + s.text
            print(f"    DEBUG: Legacy mode - extracted {len(text)} chars total")
        
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
    """Apply an update to notes via database only (no local backups)."""
    mode, content = _get_update_mode_and_content(update)
    try:
        from .database_integration import get_database_integration
        dbi = get_database_integration()
        if not dbi or not dbi.db_client or not dbi.problem_id:
            return
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            from .services.database import DatabaseService  # type: ignore
            existing = ""
            if mode == "append":
                files = loop.run_until_complete(DatabaseService.get_problem_files(dbi.db_client, dbi.problem_id, round=0, file_type='notes'))  # type: ignore
                if files:
                    existing = files[0].get('content','') or ""
            new_content = str(content or "") if mode == "replace" else (existing + "\n\n" + str(content or ""))
            loop.run_until_complete(DatabaseService.update_problem_file(dbi.db_client, dbi.problem_id, 'notes', new_content, round=0))  # type: ignore
        finally:
            try:
                loop.close()
            except Exception:
                pass
    except Exception as e:
        print(f"Warning: Failed to update notes in DB: {e}")


def apply_proofs_update(problem_dir: Path, update: ProofsUpdate, round_idx: int = 0) -> None:
    """Apply an update to proofs via database only (no local backups)."""
    mode, content = _get_update_mode_and_content(update)
    try:
        from .database_integration import get_database_integration
        dbi = get_database_integration()
        if not dbi or not dbi.db_client or not dbi.problem_id:
            return
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            from .services.database import DatabaseService  # type: ignore
            existing = ""
            if mode == "append":
                files = loop.run_until_complete(DatabaseService.get_problem_files(dbi.db_client, dbi.problem_id, round=0, file_type='proofs'))  # type: ignore
                if files:
                    existing = files[0].get('content','') or ""
            new_content = str(content or "") if mode == "replace" else (existing + "\n\n" + str(content or ""))
            loop.run_until_complete(DatabaseService.update_problem_file(dbi.db_client, dbi.problem_id, 'proofs', new_content, round=0))  # type: ignore
        finally:
            try:
                loop.close()
            except Exception:
                pass
    except Exception as e:
        print(f"Warning: Failed to update proofs in DB: {e}")


def apply_output_update(problem_dir: Path, update: OutputUpdate, round_idx: int = 0) -> None:
    """Apply an update to output via database only (no local backups)."""
    mode, content = _get_update_mode_and_content(update)
    try:
        from .database_integration import get_database_integration
        dbi = get_database_integration()
        if not dbi or not dbi.db_client or not dbi.problem_id:
            return
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            from .services.database import DatabaseService  # type: ignore
            existing = ""
            if mode == "append":
                files = loop.run_until_complete(DatabaseService.get_problem_files(dbi.db_client, dbi.problem_id, round=0, file_type='output'))  # type: ignore
                if files:
                    existing = files[0].get('content','') or ""
            new_content = str(content or "") if mode == "replace" else (existing + "\n\n" + str(content or ""))
            loop.run_until_complete(DatabaseService.update_problem_file(dbi.db_client, dbi.problem_id, 'output', new_content, round=0))  # type: ignore
        finally:
            try:
                loop.close()
            except Exception:
                pass
    except Exception as e:
        print(f"Warning: Failed to update output in DB: {e}")


def ensure_three_tier_files(problem_dir: Path) -> None:
    """No-op in DB mode: base files are managed in the database."""
    return