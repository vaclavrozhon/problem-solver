"""
Prompt builder utilities: construct stage prompts and the common base context.

This module builds:
- Common base context from database (notes, proofs, output, papers, task,
  and previous outputs) used by all stages
- Stage-specific prompts for prover, verifier, summarizer

No model calls or DB writes happen here; only DB reads and string assembly.
"""

from __future__ import annotations

from typing import Optional, Tuple, Any, cast

from .utils import load_prompt
from .database_integration import get_database_integration, get_run_parameters
from .agents import load_prover_focus_prompts


def _select_all_problem_files(problem_id: int):
    dbi = get_database_integration()
    if not dbi or not dbi.db_client:
        raise RuntimeError("Database integration unavailable for context build")
    db_client = cast(Any, dbi.db_client)
    resp = db_client.table('problem_files')\
        .select('*')\
        .eq('problem_id', problem_id)\
        .order('created_at')\
        .execute()
    return getattr(resp, 'data', []) or []


def build_common_base_context(problem_id: int, round_idx: int) -> str:
    """Build the shared DB-backed problem context used by all stages.

    Sections:
      - VERIFIER OUTPUT FROM PREVIOUS ROUND (if round_idx > 1)
      - SUMMARIZER OUTPUTS FROM PREVIOUS ROUNDS (if round_idx > 1)
      - CURRENT NOTES / PROOFS / OUTPUT (round 0 base files)
      - INPUT PAPERS (round 0 paper files)
      - TASK (round 0 task; required)
    """
    if not isinstance(problem_id, int):
        raise RuntimeError("No problem_id available for DB context")

    files = _select_all_problem_files(problem_id)

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

    # Previous round verifier output (latest < round_idx)
    prev_feedback_text = ""
    prev_summary_text = ""
    if round_idx and round_idx > 1:
        import json
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
    all_summaries: list[tuple[int, str]] = []
    if round_idx and round_idx > 1:
        import json
        prior_rounds_sorted = sorted({f.get('round') for f in files if (f.get('round') or 0) > 0 and (f.get('round') or 0) < round_idx})
        for r in prior_rounds_sorted:
            sf = next((f for f in files if f.get('round') == r and f.get('file_type') == 'summarizer_output'), None)
            if sf and sf.get('content'):
                try:
                    sj = json.loads(sf['content'])
                    summary_txt = sj.get('summary') or sj.get('summary_md') or ""
                except Exception:
                    summary_txt = sf['content']
                all_summaries.append((int(r), summary_txt))

    # Build sections
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

    # Papers from same dataset (round 0, file_type=paper)
    paper_blobs: list[str] = []
    for f in files:
        if (f.get('round') or 0) == 0 and f.get('file_type') == 'paper':
            filename = f.get('file_name', 'unknown')
            content = f.get('content', '') or ''
            metadata = f.get('metadata', {}) or {}
            description = metadata.get('description', '') or ''
            if description:
                paper_blobs.append(f"=== Paper Description ({filename}) ===\n{description}\n")
            paper_blobs.append(f"=== Paper ({filename}) ===\n{content}\n")

    parts.append("")
    parts.append("=== INPUT PAPERS ===")
    parts.append("\n".join(paper_blobs) if paper_blobs else "not applicable")

    parts.append("")
    parts.append("=== TASK ===")
    if str(task).strip():
        parts.append(task)
    else:
        raise RuntimeError(f"DB context missing TASK content for problem_id={problem_id}")

    return "\n".join(parts)


def build_prompt_prover(problem_id: int, round_idx: int, prover_idx: int, prover_config: dict | None, focus_description: Optional[str]) -> Tuple[str, str]:
    """Build (system_prompt, user_message) for the prover stage."""
    system_prompt = load_prompt("prover")
    prover_config = prover_config or {}
    has_calculator = bool(prover_config.get("calculator", False))
    focus_prompts = load_prover_focus_prompts()
    focus_type = prover_config.get("focus", prover_config.get("directive", "default"))
    if focus_type in focus_prompts and focus_prompts[focus_type]["prompt"]:
        system_prompt = system_prompt + "\n\n" + focus_prompts[focus_type]["prompt"].strip()

    # Run parameters provide user_specification and per-prover directives
    params = get_run_parameters()
    run_user_spec = params.get('user_specification') or params.get('focus_description')
    run_prover_directives = params.get('prover_directives') or params.get('prover_configs') or []

    user_parts: list[str] = []
    user_parts.append("=== USER SPECIFICATION ===")
    effective_user_spec = (focus_description or run_user_spec or "").strip() if (focus_description or run_user_spec) else ""
    user_parts.append(effective_user_spec if effective_user_spec else "not applicable")

    user_parts.append("")
    user_parts.append("=== SPECIAL INSTRUCTIONS ===")
    special_bits: list[str] = []
    if isinstance(run_prover_directives, list) and 1 <= prover_idx <= len(run_prover_directives):
        directive = run_prover_directives[prover_idx - 1]
        if isinstance(directive, dict):
            directive_text = directive.get('directive') or directive.get('focus') or ""
            if directive_text:
                special_bits.append(f"directive: {directive_text}")
            if directive.get('calculator'):
                special_bits.append("tools: code_interpreter enabled")
        elif isinstance(directive, str) and directive.strip():
            special_bits.append(f"directive: {directive.strip()}")
    special_bits.append(f"prover_focus: {focus_type}")
    if has_calculator:
        special_bits.append("tools: code_interpreter enabled")
    if effective_user_spec:
        special_bits.append("user_focus: provided")
    user_parts.append("\n".join(special_bits) if special_bits else "not applicable")

    # Append shared base context
    base_ctx = build_common_base_context(problem_id, round_idx)
    if base_ctx:
        user_parts.append("")
        user_parts.append(base_ctx)

    return system_prompt, "\n".join(user_parts).strip()


def build_prompt_verifier(problem_id: int, round_idx: int, focus_description: Optional[str]) -> Tuple[str, str]:
    """Build (system_prompt, user_message) for the verifier stage."""
    system_prompt = load_prompt("verifier")
    if focus_description:
        system_prompt += "\n\n### User's Request\n" + focus_description.strip() + "\n"

    base_ctx = build_common_base_context(problem_id, round_idx)
    user_parts: list[str] = [base_ctx]

    # Append all current-round prover outputs
    dbi = get_database_integration()
    if not dbi or not dbi.db_client:
        raise RuntimeError("Database integration unavailable for verifier prompt")
    db_client = cast(Any, dbi.db_client)
    resp = db_client.table('problem_files')\
        .select('file_name, content')\
        .eq('problem_id', problem_id)\
        .eq('round', round_idx)\
        .eq('file_type', 'prover_output')\
        .order('file_name')\
        .execute()
    files = getattr(resp, 'data', []) or []
    for f in files:
        idx_label = f.get('file_name', '')
        content = f.get('content', '')
        user_parts.append(f"\n\n=== Prover Output ({idx_label}) ===\n")
        user_parts.append(content)

    return system_prompt, "\n".join(user_parts)


def build_prompt_summarizer(problem_id: int, round_idx: int) -> Tuple[str, str]:
    """Build (system_prompt, user_message) for the summarizer stage."""
    system_prompt = load_prompt("summarizer")
    base_ctx = build_common_base_context(problem_id, round_idx)
    user_parts: list[str] = [base_ctx]

    # Append current-round verifier summary
    dbi = get_database_integration()
    if not dbi or not dbi.db_client:
        raise RuntimeError("Database integration unavailable for summarizer prompt")
    db_client = cast(Any, dbi.db_client)
    resp = db_client.table('problem_files')\
        .select('content')\
        .eq('problem_id', problem_id)\
        .eq('round', round_idx)\
        .eq('file_type', 'verifier_output')\
        .limit(1)\
        .execute()
    vf = (getattr(resp, 'data', []) or [])
    if vf:
        content = vf[0].get('content', '')
        try:
            import json
            data = json.loads(content)
            summary_md = data.get('summary_md') or data.get('summary') or ''
        except Exception:
            summary_md = content
        if summary_md:
            user_parts.append("\n\n=== Verifier Summary ===\n")
            user_parts.append(summary_md)

    return system_prompt, "\n".join(user_parts)



