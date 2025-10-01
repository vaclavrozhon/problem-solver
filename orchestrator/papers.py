"""
Paper handling simplified to text-only.

Papers are loaded from the database instead of filesystem.
"""

import os
import sys
from pathlib import Path
from typing import Optional, Any

# Use orchestrator's database_integration to access DatabaseService in a
# linter-friendly way (avoids unresolved import diagnostics)
from .database_integration import DatabaseService as DatabaseService  # type: ignore


def build_empty_db_context() -> str:
    """Return a scaffold of all expected sections with 'not applicable'."""
    parts: list[str] = []
    parts.append("=== VERIFIER OUTPUT FROM PREVIOUS ROUND ===")
    parts.append("not applicable")
    parts.append("")
    parts.append("=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ===")
    parts.append("not applicable")
    parts.append("")
    parts.append("=== CURRENT NOTES ===")
    parts.append("not applicable")
    parts.append("")
    parts.append("=== CURRENT PROOFS ===")
    parts.append("not applicable")
    parts.append("")
    parts.append("=== CURRENT OUTPUT ===")
    parts.append("not applicable")
    parts.append("")
    parts.append("=== INPUT PAPERS ===")
    parts.append("not applicable")
    parts.append("")
    parts.append("=== TASK ===")
    parts.append("not applicable")
    return "\n".join(parts)

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
    
    # Filesystem task loading disabled in DB mode
    
    # Include reference note
    if include_pdfs and file_descriptions:
        context_parts.append("\n\n=== Reference Files (Descriptions Only) ===\n")
        context_parts.append(file_descriptions)
    
    # Include notes if exists
    # Filesystem notes disabled in DB mode
    
    # Include output if exists
    # Filesystem output disabled in DB mode
    
    return "\n".join(context_parts)


def get_paper_text_from_database(problem_id: int) -> str:
    """Load paper content from database (round 0, file_type='paper')."""
    if not problem_id or not DatabaseService:
        return ""
    from .database_integration import get_database_integration
    db_integration = get_database_integration()
    if not db_integration or not db_integration.db_client:
        return ""
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            files = loop.run_until_complete(DatabaseService.get_problem_files(db_integration.db_client, problem_id))  # type: ignore
            if not files:
                return ""
            paper_files = [f for f in files if f.get('file_type') == 'paper' and (f.get('round') or 0) == 0]
            if not paper_files:
                return ""
            parts = []
            for paper_file in paper_files:
                filename = paper_file.get('file_name', 'unknown')
                content = paper_file.get('content', '')
                metadata = paper_file.get('metadata', {}) or {}
                description = metadata.get('description', '')
                if description:
                    parts.append(f"=== Paper Description ({filename}) ===\n{description}\n")
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
    
    # Filesystem task loading disabled in DB mode
    
    # Legacy disabled
    
    # Include notes if exists
    # Filesystem notes disabled in DB mode
    
    # Include output if exists
    # Filesystem output disabled in DB mode
    
    return "\n".join(context_parts)


def read_problem_context_from_database(problem_id: int, round_idx: int) -> str:
    """
    Build problem context entirely from the database (problem_files),
    including base files and previous verifier/summarizer outputs.

    Sections are always present with '=== HEADER ===' and 'not applicable' if empty.
    Order of sections aligns with prompt requirements downstream (excluding
    user-specific sections which are added by the caller):
      - VERIFIER OUTPUT FROM PREVIOUS ROUND
      - SUMMARIZER OUTPUTS FROM ALL PREVIOUS ROUNDS
      - CURRENT NOTES
      - CURRENT PROOFS
      - CURRENT OUTPUT
      - PAPERS
      - TASK
    """
    if not problem_id:
        print("[DBCTX] No problem_id; returning empty DB context scaffold")
        return build_empty_db_context()

    from .database_integration import get_database_integration
    dbi = get_database_integration()
    if not dbi or not dbi.db_client:
        print("[DBCTX] No database integration; returning empty DB context scaffold")
        return build_empty_db_context()

    try:
        import asyncio, json

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Running inside an event loop (FastAPI task). We cannot run coroutines directly here.
                # Fall back to empty scaffold to preserve required sections.
                print("[DBCTX] Running loop detected; returning empty DB context scaffold")
                return build_empty_db_context()
        except RuntimeError:
            # No loop yet; create one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        try:
            files = loop.run_until_complete(DatabaseService.get_problem_files(dbi.db_client, problem_id))  # type: ignore

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

            # Previous round verifier output (latest round < round_idx)
            prev_feedback_text = ""
            prev_summary_text = ""
            if round_idx and round_idx > 1:
                prev_rounds = sorted({f.get('round') for f in files if (f.get('round') or 0) > 0 and (f.get('round') or 0) < round_idx}, reverse=True)
                if prev_rounds:
                    r = prev_rounds[0]
                    vf = next((f for f in files if f.get('round') == r and f.get('file_type') == 'verifier_output'), None)
                    if vf and vf.get('content'):
                        try:
                            vj = json.loads(vf['content'])
                            prev_feedback_text = vj.get('feedback_md') or vj.get('feedback') or ""
                            prev_summary_text = vj.get('summary_md') or vj.get('summary') or ""
                            if not (prev_feedback_text or prev_summary_text):
                                prev_feedback_text = json.dumps(vj, indent=2)
                        except Exception:
                            prev_feedback_text = vf['content']

            # All previous rounds' summarizer outputs (< round_idx)
            all_summaries = []
            if round_idx and round_idx > 1:
                prior_rounds_sorted = sorted({f.get('round') for f in files if (f.get('round') or 0) > 0 and (f.get('round') or 0) < round_idx})
                for r in prior_rounds_sorted:
                    sf = next((f for f in files if f.get('round') == r and f.get('file_type') == 'summarizer_output'), None)
                    if sf and sf.get('content'):
                        try:
                            sj = json.loads(sf['content'])
                            summary_txt = sj.get('summary') or sj.get('summary_md') or ""
                        except Exception:
                            summary_txt = sf['content']
                        all_summaries.append((r, summary_txt))

            # Build sections with headings (simple === HEADER ===)
            parts: list[str] = []
            
            parts.append("=== VERIFIER OUTPUT FROM PREVIOUS ROUND ===")
            if round_idx and round_idx > 1:
                if prev_feedback_text.strip() or prev_summary_text.strip():
                    if prev_feedback_text.strip():
                        parts.append("## Feedback\n" + prev_feedback_text)
                    if prev_summary_text.strip():
                        parts.append("\n## Summary\n" + prev_summary_text)
                else:
                    error_msg = f"DB context missing previous verifier output for problem_id={problem_id}, round={round_idx}"
                    print(f"[DBCTX][ERROR] {error_msg}")
                    raise RuntimeError(error_msg)
            else:
                parts.append("not applicable")

            parts.append("")

            parts.append("=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ===")
            if round_idx and round_idx > 1:
                if all_summaries:
                    for r, s in all_summaries:
                        parts.append(f"\n## Round {r}\n" + (s if str(s).strip() else "(empty)"))
                else:
                    error_msg = f"DB context missing summarizer outputs for previous rounds for problem_id={problem_id}, round={round_idx}"
                    print(f"[DBCTX][ERROR] {error_msg}")
                    raise RuntimeError(error_msg)
            else:
                parts.append("not applicable")

            parts.append("")

            parts.append("=== CURRENT NOTES ===")
            parts.append(notes if str(notes).strip() else "not applicable")
            parts.append("")

            parts.append("=== CURRENT PROOFS ===")
            parts.append(proofs if str(proofs).strip() else "not applicable")
            parts.append("")

            parts.append("=== CURRENT OUTPUT ===")
            parts.append(output if str(output).strip() else "not applicable")
            parts.append("")

            # Papers section from database
            papers_text = get_paper_text_from_database(problem_id)
            parts.append("")
            parts.append("=== INPUT PAPERS ===")
            parts.append(papers_text.strip() if papers_text and papers_text.strip() else "not applicable")

            parts.append("")
            parts.append("=== TASK ===")
            # Prefer DB task; if empty, try to fetch it specifically from DB again
            if str(task).strip():
                parts.append(task)
            else:
                error_msg = f"DB context missing TASK content for problem_id={problem_id}"
                print(f"[DBCTX][ERROR] {error_msg}")
                raise RuntimeError(error_msg)

            return "\n".join(parts)
        finally:
            try:
                loop.close()
            except Exception:
                pass

    except Exception as e:
        print(f"Warning: Could not build DB context: {e}")
        return build_empty_db_context()


async def read_problem_context_from_database_async(problem_id: int, round_idx: int) -> str:
    """
    Async variant for when we're already inside an event loop (e.g., FastAPI task).
    Preserves the same strict/fail-fast semantics as the sync version.
    """
    if not problem_id:
        raise RuntimeError("No problem_id available for DB context")
    from .database_integration import get_database_integration
    dbi = get_database_integration()
    if not dbi or not dbi.db_client:
        raise RuntimeError("Database integration unavailable for DB context")
    try:
        import json
        files = await DatabaseService.get_problem_files(dbi.db_client, problem_id)  # type: ignore

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

        # Previous round verifier output
        prev_feedback_text = ""
        prev_summary_text = ""
        if round_idx and round_idx > 1:
            prev_rounds = sorted({f.get('round') for f in files if (f.get('round') or 0) > 0 and (f.get('round') or 0) < round_idx}, reverse=True)
            if prev_rounds:
                r = prev_rounds[0]
                vf = next((f for f in files if f.get('round') == r and f.get('file_type') == 'verifier_output'), None)
                if vf and vf.get('content'):
                    try:
                        vj = json.loads(vf['content'])
                        prev_feedback_text = vj.get('feedback_md') or vj.get('feedback') or ""
                        prev_summary_text = vj.get('summary_md') or vj.get('summary') or ""
                        if not (prev_feedback_text or prev_summary_text):
                            prev_feedback_text = json.dumps(vj, indent=2)
                    except Exception:
                        prev_feedback_text = vf['content']

        # All previous summarizer outputs
        all_summaries = []
        if round_idx and round_idx > 1:
            prior_rounds_sorted = sorted({f.get('round') for f in files if (f.get('round') or 0) > 0 and (f.get('round') or 0) < round_idx})
            for r in prior_rounds_sorted:
                sf = next((f for f in files if f.get('round') == r and f.get('file_type') == 'summarizer_output'), None)
                if sf and sf.get('content'):
                    try:
                        sj = json.loads(sf['content'])
                        summary_txt = sj.get('summary') or sj.get('summary_md') or ""
                    except Exception:
                        summary_txt = sf['content']
                    all_summaries.append((r, summary_txt))

        parts: list[str] = []
        parts.append("=== VERIFIER OUTPUT FROM PREVIOUS ROUND ===")
        if round_idx and round_idx > 1:
            if prev_feedback_text.strip() or prev_summary_text.strip():
                if prev_feedback_text.strip():
                    parts.append("## Feedback\n" + prev_feedback_text)
                if prev_summary_text.strip():
                    parts.append("\n## Summary\n" + prev_summary_text)
            else:
                raise RuntimeError(f"DB context missing previous verifier output for problem_id={problem_id}, round={round_idx}")
        else:
            parts.append("not applicable")

        parts.append("")

        parts.append("=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ===")
        if round_idx and round_idx > 1:
            if all_summaries:
                for r, s in all_summaries:
                    parts.append(f"\n## Round {r}\n" + (s if str(s).strip() else "(empty)"))
            else:
                raise RuntimeError(f"DB context missing summarizer outputs for previous rounds for problem_id={problem_id}, round={round_idx}")
        else:
            parts.append("not applicable")

        parts.append("")

        parts.append("=== CURRENT NOTES ===")
        parts.append(notes if str(notes).strip() else "not applicable")
        parts.append("")

        parts.append("=== CURRENT PROOFS ===")
        parts.append(proofs if str(proofs).strip() else "not applicable")
        parts.append("")

        parts.append("=== CURRENT OUTPUT ===")
        parts.append(output if str(output).strip() else "not applicable")
        parts.append("")

        papers_text = get_paper_text_from_database(problem_id)
        parts.append("")
        parts.append("=== INPUT PAPERS ===")
        parts.append(papers_text.strip() if papers_text and papers_text.strip() else "not applicable")

        parts.append("")
        parts.append("=== TASK ===")
        if str(task).strip():
            parts.append(task)
        else:
            raise RuntimeError(f"DB context missing TASK content for problem_id={problem_id}")

        return "\n".join(parts)
    except Exception as e:
        print(f"[DBCTX][ERROR] Async DB context failed: {e}")
        raise

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