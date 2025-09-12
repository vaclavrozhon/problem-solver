"""
Paper handling simplified to text-only.

We no longer parse PDFs/HTML. Papers are plain text files alongside optional
`.description.txt` sidecars. Use file_manager.get_paper_text_with_descriptions
to include papers in prompts.
"""

import os
from pathlib import Path
from typing import Optional


def extract_pdf_text(pdf_path: Path) -> str:
    return ""


def extract_html_text(html_path: Path) -> str:
    return ""


def ensure_papers_parsed(problem_dir: Path) -> None:
    return None


def get_parsed_papers_content(problem_dir: Path) -> str:
    return ""


def read_problem_context(problem_dir: Path, include_pdfs: bool = True, file_descriptions: str = "") -> str:
    """
    Read the complete problem context including task and progress files.
    
    This version is designed for use with the Files API - paper content is not included
    in the context but file descriptions are provided so the model knows what files
    are available for search.
    """
    context_parts = []
    
    # Read task file
    for ext in ['md', 'txt', 'tex']:
        task_file = problem_dir / f"task.{ext}"
        if task_file.exists():
            context_parts.append(f"=== Task ({ext}) ===\n")
            context_parts.append(task_file.read_text(encoding="utf-8"))
            break
    
    # Include reference note
    if include_pdfs and file_descriptions:
        context_parts.append("\n\n=== Reference Files (Descriptions Only) ===\n")
        context_parts.append(file_descriptions)
    
    # Include notes if exists
    notes_file = problem_dir / "notes.md"
    if notes_file.exists():
        context_parts.append("\n\n=== Notes ===\n")
        context_parts.append(notes_file.read_text(encoding="utf-8"))
    
    # Include output if exists
    output_file = problem_dir / "output.md"
    if output_file.exists():
        context_parts.append("\n\n=== Current Output ===\n")
        context_parts.append(output_file.read_text(encoding="utf-8"))
    
    return "\n".join(context_parts)


def read_problem_context_legacy(problem_dir: Path, include_pdfs: bool = True) -> str:
    """
    Legacy version that includes full paper content in the prompt.
    Kept for backward compatibility with non-reasoning models.
    """
    context_parts = []
    
    # Read task file
    for ext in ['md', 'txt', 'tex']:
        task_file = problem_dir / f"task.{ext}"
        if task_file.exists():
            context_parts.append(f"=== Task ({ext}) ===\n")
            context_parts.append(task_file.read_text(encoding="utf-8"))
            break
    
    # Legacy disabled
    
    # Include notes if exists
    notes_file = problem_dir / "notes.md"
    if notes_file.exists():
        context_parts.append("\n\n=== Notes ===\n")
        context_parts.append(notes_file.read_text(encoding="utf-8"))
    
    # Include output if exists
    output_file = problem_dir / "output.md"
    if output_file.exists():
        context_parts.append("\n\n=== Current Output ===\n")
        context_parts.append(output_file.read_text(encoding="utf-8"))
    
    return "\n".join(context_parts)