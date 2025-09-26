"""
Paper handling simplified to text-only.

Papers are loaded from the database instead of filesystem.
"""

import os
import sys
from pathlib import Path
from typing import Optional

# Add backend to path to import database service
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from services.database import DatabaseService
except ImportError:
    DatabaseService = None


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


def get_paper_text_from_database(problem_id: int = None) -> str:
    """
    Load paper content from database instead of filesystem.

    Args:
        problem_id: Problem ID to load papers for (if None, returns empty string)

    Returns:
        Concatenated paper content with descriptions
    """
    if not problem_id or not DatabaseService:
        return ""

    # Get database integration instance
    from .database_integration import get_database_integration
    db_integration = get_database_integration()

    if not db_integration or not db_integration.db_client:
        return ""

    try:
        import asyncio

        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # Get all paper files from database (round 0 = base files, file_type = 'paper')
            files = loop.run_until_complete(
                DatabaseService.get_problem_files(db_integration.db_client, problem_id)
            )

            if not files:
                return ""

            # Filter for paper files
            paper_files = [f for f in files if f.get('file_type') == 'paper' and f.get('round', 0) == 0]

            if not paper_files:
                return ""

            parts = []
            for paper_file in paper_files:
                filename = paper_file.get('file_name', 'unknown')
                content = paper_file.get('content', '')
                metadata = paper_file.get('metadata', {})

                # Add description if available in metadata
                description = metadata.get('description', '')
                if description:
                    parts.append(f"=== Paper Description ({filename}) ===\n{description}\n")

                # Add paper content
                parts.append(f"=== Paper ({filename}) ===\n{content}\n")

            return "\n".join(parts)

        finally:
            loop.close()

    except Exception as e:
        print(f"Warning: Could not load papers from database: {e}")
        return ""


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


def get_paper_text_from_database(problem_id: int = None) -> str:
    """
    Load paper content from database instead of filesystem.

    Args:
        problem_id: Problem ID to load papers for (if None, returns empty string)

    Returns:
        Concatenated paper content with descriptions
    """
    if not problem_id or not DatabaseService:
        return ""

    # Get database integration instance
    from .database_integration import get_database_integration
    db_integration = get_database_integration()

    if not db_integration or not db_integration.db_client:
        return ""


def read_problem_context_from_database(problem_id: int, round_idx: int) -> str:
    """
    Build problem context entirely from the database (problem_files),
    including base files and previous verifier feedback. Sections are
    always present with '=== HEADER ===' and 'not applicable' if empty.
    """
    if not problem_id:
        return ""

    from .database_integration import get_database_integration
    dbi = get_database_integration()
    if not dbi or not dbi.db_client:
        return ""

    try:
        import asyncio, json

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            files = loop.run_until_complete(
                DatabaseService.get_problem_files(dbi.db_client, problem_id)  # type: ignore
            )

            # Base files (round 0)
            def get_base(ftype: str) -> str:
                for f in files:
                    if (f.get('round') or 0) == 0 and f.get('file_type') == ftype:
                        return f.get('content') or ""
                return ""

            task = get_base('task')
            notes = get_base('notes')
            proofs = get_base('proofs')
            output = get_base('output')

            # Previous round feedback (latest round < round_idx)
            prev_feedback_text = ""
            if round_idx and round_idx > 1:
                prev_rounds = sorted({f.get('round') for f in files if (f.get('round') or 0) > 0 and (f.get('round') or 0) < round_idx}, reverse=True)
                if prev_rounds:
                    r = prev_rounds[0]
                    vf = next((f for f in files if f.get('round') == r and f.get('file_type') == 'verifier_output'), None)
                    if vf and vf.get('content'):
                        try:
                            vj = json.loads(vf['content'])
                            prev_feedback_text = vj.get('feedback_md') or vj.get('feedback') or json.dumps(vj, indent=2)
                        except Exception:
                            prev_feedback_text = vf['content']

            # Build sections with headings (simple === HEADER ===)
            parts: list[str] = []
            parts.append("=== TASK ===")
            parts.append(task if task.strip() else "not applicable")
            parts.append("")

            parts.append("=== NOTES ===")
            parts.append(notes if notes.strip() else "not applicable")
            parts.append("")

            parts.append("=== PROOFS ===")
            parts.append(proofs if proofs.strip() else "not applicable")
            parts.append("")

            parts.append("=== OUTPUT ===")
            parts.append(output if output.strip() else "not applicable")
            parts.append("")

            parts.append("=== PREVIOUS ROUND FEEDBACK ===")
            parts.append(prev_feedback_text if prev_feedback_text.strip() else "not applicable")

            # Papers section from database
            papers_text = get_paper_text_from_database(problem_id)
            parts.append("")
            parts.append("=== PAPERS ===")
            parts.append(papers_text.strip() if papers_text and papers_text.strip() else "not applicable")

            return "\n".join(parts)
        finally:
            loop.close()

    except Exception as e:
        print(f"Warning: Could not build DB context: {e}")
        return ""

    try:
        import asyncio

        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            # Get all paper files from database (round 0 = base files, file_type = 'paper')
            files = loop.run_until_complete(
                DatabaseService.get_problem_files(db_integration.db_client, problem_id)
            )

            if not files:
                return ""

            # Filter for paper files
            paper_files = [f for f in files if f.get('file_type') == 'paper' and f.get('round', 0) == 0]

            if not paper_files:
                return ""

            parts = []
            for paper_file in paper_files:
                filename = paper_file.get('file_name', 'unknown')
                content = paper_file.get('content', '')
                metadata = paper_file.get('metadata', {})

                # Add description if available in metadata
                description = metadata.get('description', '')
                if description:
                    parts.append(f"=== Paper Description ({filename}) ===\n{description}\n")

                # Add paper content
                parts.append(f"=== Paper ({filename}) ===\n{content}\n")

            return "\n".join(parts)

        finally:
            loop.close()

    except Exception as e:
        print(f"Warning: Could not load papers from database: {e}")
        return ""