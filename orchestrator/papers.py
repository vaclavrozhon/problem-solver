"""
Paper handling simplified to text-only.

Papers are loaded from the database instead of filesystem.
"""

import os
import sys
from pathlib import Path
from typing import Optional, Any, cast

# Use orchestrator's database_integration to access DatabaseService in a
# linter-friendly way (avoids unresolved import diagnostics)
from .database_integration import DatabaseService as DatabaseService  # type: ignore


# Removed legacy/stub functions: build_empty_db_context, extract_pdf_text, extract_html_text,
# ensure_papers_parsed, get_parsed_papers_content, read_problem_context (filesystem variant).


def get_paper_text_from_database(problem_id: int) -> str:
    """Load paper content from database (round 0, file_type='paper') via sync client."""
    if not problem_id or not DatabaseService:
        return ""
    from .database_integration import get_database_integration
    db_integration = get_database_integration()
    if not db_integration or not db_integration.db_client:
        return ""
    try:
        db_client = cast(Any, db_integration.db_client)
        resp = db_client.table('problem_files')\
            .select('file_name, content, metadata, round, file_type')\
            .eq('problem_id', problem_id)\
            .eq('file_type', 'paper')\
            .eq('round', 0)\
            .order('created_at', desc=True)\
            .execute()
        files = getattr(resp, 'data', []) or []
        if not files:
            return ""
        parts = []
        for paper_file in files:
            filename = paper_file.get('file_name', 'unknown')
            content = paper_file.get('content', '')
            metadata = paper_file.get('metadata', {}) or {}
            description = metadata.get('description', '')
            if description:
                parts.append(f"=== Paper Description ({filename}) ===\n{description}\n")
            parts.append(f"=== Paper ({filename}) ===\n{content}\n")
        return "\n".join(parts)
    except Exception as e:
        print(f"Warning: Could not load papers from database: {e}")
        return ""


def read_problem_context_legacy(problem_dir: Path, include_pdfs: bool = True) -> str:
    raise RuntimeError("Legacy filesystem context is not supported in DB-only mode")


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
        import json
        # Synchronous fetch of all files for the problem
        db_client = cast(Any, dbi.db_client)
        resp = db_client.table('problem_files')\
            .select('*')\
            .eq('problem_id', problem_id)\
            .order('created_at', asc=True)\
            .execute()
        files = getattr(resp, 'data', []) or []

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
    except Exception as e:
        print(f"Warning: Could not build DB context: {e}")
        return build_empty_db_context()


# Removed async duplicate: read_problem_context_from_database_async


def build_empty_db_context() -> str:
    """Return a minimal, well-formed empty DB context scaffold used by callers.

    Sections match the structure expected by downstream prompt builders.
    """
    sections = [
        "=== VERIFIER OUTPUT FROM PREVIOUS ROUND ===\nnot applicable",
        "",
        "=== SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS ===\nnot applicable",
        "",
        "=== CURRENT NOTES ===\nnot applicable",
        "",
        "=== CURRENT PROOFS ===\nnot applicable",
        "",
        "=== CURRENT OUTPUT ===\nnot applicable",
        "",
        "=== INPUT PAPERS ===\nnot applicable",
        "",
        "=== TASK ===\nnot applicable",
    ]
    return "\n".join(sections)