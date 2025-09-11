"""
Paper writing agent functions for the orchestrator system.

This module contains functions for calling AI agents used in paper writing mode:
- Paper suggester agents that provide advice and priority items
- Paper fixer agents that modify and improve LaTeX documents
"""

import os
from pathlib import Path
from typing import Optional, Tuple

from .models import (
    PaperSuggesterOutput, PaperFixerOutput
)
from .utils import (
    load_prompt, write_status, dump_io, normalize_schema_strict,
    compile_tex_string
)
from .papers import read_problem_context
from .agents import (
    complete_text, load_previous_response_id, save_response_id,
    parse_structured_output
)

# Get model configuration from environment
MODEL_PAPER_SUGGESTER = os.environ.get("OPENAI_MODEL_PAPER_SUGGESTER", os.environ.get("OPENAI_MODEL_PROVER", "gpt-5"))
MODEL_PAPER_FIXER = os.environ.get("OPENAI_MODEL_PAPER_FIXER", os.environ.get("OPENAI_MODEL_PROVER", "gpt-5"))


def call_paper_suggester(problem_dir: Path, round_idx: int) -> PaperSuggesterOutput:
    """Call paper suggester agent."""
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    write_status(problem_dir, "paper_suggester", round_idx)
    print(f"  [paper_suggester] Running (model: {MODEL_PAPER_SUGGESTER})...")
    
    # Load prompts and context
    system_prompt = load_prompt("paper_suggester")
    problem_context = read_problem_context(problem_dir)
    
    # Build user message
    user_parts = [problem_context]
    
    # Add current LaTeX if it exists
    tex_file = problem_dir / "final_output.tex"
    if tex_file.exists():
        user_parts.append(f"\n\n=== Current LaTeX ===\n")
        user_parts.append(tex_file.read_text(encoding="utf-8"))
    
    # Add previous rounds' summaries for paper writing
    for prev_idx in range(1, round_idx):
        summary_file = problem_dir / "runs" / f"round-{prev_idx:04d}" / "paper_suggester.summary.md"
        if summary_file.exists():
            user_parts.append(f"\n\n=== Round {prev_idx} Paper Suggester Summary ===\n")
            user_parts.append(summary_file.read_text(encoding="utf-8"))
            
        fixer_summary = problem_dir / "runs" / f"round-{prev_idx:04d}" / "paper_fixer.summary.md"
        if fixer_summary.exists():
            user_parts.append(f"\n\n=== Round {prev_idx} Paper Fixer Summary ===\n")
            user_parts.append(fixer_summary.read_text(encoding="utf-8"))
    
    user_message = "\n".join(user_parts)
    
    # Prepare response format
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "paper_suggester_output",
            "strict": True,
            "schema": normalize_schema_strict(PaperSuggesterOutput.model_json_schema())
        }
    }
    
    # Load previous response ID for reasoning state preservation
    previous_response_id = load_previous_response_id(problem_dir, round_idx, "paper_suggester", MODEL_PAPER_SUGGESTER)
    
    # Call the model
    response_text, duration, response_id, usage, raw_response = complete_text(
        MODEL_PAPER_SUGGESTER, system_prompt, user_message,
        response_format=response_format,
        previous_response_id=previous_response_id
    )
    
    # Save response ID for future rounds
    save_response_id(problem_dir, round_idx, "paper_suggester", response_id, MODEL_PAPER_SUGGESTER)
    
    # Parse response with retry logic
    response_obj = parse_structured_output(
        PaperSuggesterOutput, response_text, MODEL_PAPER_SUGGESTER, 
        system_prompt, user_message, response_format
    )
    
    # Save outputs
    dump_io(round_dir, "paper_suggester", system_prompt, user_message,
            response_text, response_obj, duration, MODEL_PAPER_SUGGESTER, usage=usage, raw_response=raw_response)
    
    print(f"  [paper_suggester] Complete ({duration:.1f}s)")
    return response_obj


def call_paper_fixer(problem_dir: Path, round_idx: int, 
                    suggester_output: PaperSuggesterOutput) -> Tuple[PaperFixerOutput, bool, str]:
    """Call paper fixer agent and compile the result."""
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    
    write_status(problem_dir, "paper_fixer", round_idx)
    print(f"  [paper_fixer] Running (model: {MODEL_PAPER_FIXER})...")
    
    # Load prompts and context
    system_prompt = load_prompt("paper_fixer")
    problem_context = read_problem_context(problem_dir)
    
    # Build user message
    user_parts = [problem_context]
    
    # Add suggester advice and priorities
    user_parts.append(f"\n\n=== Paper Suggester Advice ===\n{suggester_output.advice_md}")
    user_parts.append(f"\n\n=== Priority Items ===\n")
    for i, item in enumerate(suggester_output.priority_items, 1):
        user_parts.append(f"{i}. {item}")
    
    # Add current LaTeX if it exists
    tex_file = problem_dir / "final_output.tex"
    if tex_file.exists():
        user_parts.append(f"\n\n=== Current LaTeX ===\n")
        user_parts.append(tex_file.read_text(encoding="utf-8"))
    
    user_message = "\n".join(user_parts)
    
    # Prepare response format
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "paper_fixer_output",
            "strict": True,
            "schema": normalize_schema_strict(PaperFixerOutput.model_json_schema())
        }
    }
    
    # Load previous response ID for reasoning state preservation
    previous_response_id = load_previous_response_id(problem_dir, round_idx, "paper_fixer", MODEL_PAPER_FIXER)
    
    # Call the model
    response_text, duration, response_id, usage, raw_response = complete_text(
        MODEL_PAPER_FIXER, system_prompt, user_message,
        response_format=response_format,
        previous_response_id=previous_response_id
    )
    
    # Save response ID for future rounds
    save_response_id(problem_dir, round_idx, "paper_fixer", response_id, MODEL_PAPER_FIXER)
    
    # Parse response with retry logic
    response_obj = parse_structured_output(
        PaperFixerOutput, response_text, MODEL_PAPER_FIXER,
        system_prompt, user_message, response_format
    )
    
    # Save outputs
    dump_io(round_dir, "paper_fixer", system_prompt, user_message,
            response_text, response_obj, duration, MODEL_PAPER_FIXER, usage=usage, raw_response=raw_response)
    
    # Try to compile the LaTeX (accept both field names)
    compile_success = False
    compile_log = ""
    latex = getattr(response_obj, "updated_latex", None) or getattr(response_obj, "new_tex", None)
    if latex:
        try:
            compile_success, compile_log, pdf_path = compile_tex_string(
                problem_dir, round_idx, latex
            )
        except Exception as e:
            compile_log = f"Compilation error: {str(e)}"
    
    print(f"  [paper_fixer] Complete ({duration:.1f}s), compilation: {'✓' if compile_success else '✗'}")
    return response_obj, compile_success, compile_log