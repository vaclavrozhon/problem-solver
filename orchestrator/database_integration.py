"""
Database integration shim for orchestrator.

Holds a per-process reference to an authenticated Supabase client
and to the current problem context so agents can persist artifacts
to the database via backend DatabaseService methods.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Any

from pathlib import Path
import sys

# Add backend to path for DatabaseService and authentication helpers
backend_path = Path(__file__).parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

# Try both import styles to be resilient
DatabaseService = None  # type: ignore
get_db_client_with_token = None  # type: ignore
_import_error: Optional[Exception] = None
try:
    from services.database import DatabaseService as _DS  # type: ignore
    from authentication import get_db_client_with_token as _get_client  # type: ignore
    DatabaseService = _DS
    get_db_client_with_token = _get_client
except Exception as e1:  # pragma: no cover
    try:
        from backend.services.database import DatabaseService as _DS2  # type: ignore
        from backend.authentication import get_db_client_with_token as _get_client2  # type: ignore
        DatabaseService = _DS2
        get_db_client_with_token = _get_client2
    except Exception as e2:  # pragma: no cover
        _import_error = e2


@dataclass
class _DbIntegration:
    db_client: Any | None
    problem_id: int | None
    run_id: int | None = None

    def save_prover_prompt(self, round_num: int, prover_idx: int, prompt_text: str, model: str | None = None) -> bool:
        """Persist a prover prompt as a round artifact in problem_files.

        Stores as file_type='prover_prompt' with filename 'prover-XX.prompt.txt'.
        Works in both sync and async contexts.
        """
        if not self.db_client or not DatabaseService or self.problem_id is None:
            print(
                f"[DBI] save_prover_prompt: missing components: "
                f"db_client={bool(self.db_client)}, DatabaseService={bool(DatabaseService)}, problem_id_set={self.problem_id is not None}"
            )
            if _import_error:
                print(f"[DBI] Import error detail: {_import_error}")
            return False
        metadata = {"phase": "prompt", "prover_index": prover_idx}
        if model:
            metadata["model"] = model

        # Perform a direct synchronous insert to avoid event loop interactions
        try:
            print(f"[DBI] Saving prompt (sync): problem_id={self.problem_id}, round={round_num}, prover={prover_idx}, len={len(prompt_text)}")
            resp = self.db_client.table('problem_files')\
                .insert({
                    'problem_id': self.problem_id,
                    'round': round_num,
                    'file_type': 'prover_prompt',
                    'file_name': f"prover-{prover_idx:02d}.prompt.txt",
                    'content': prompt_text,
                    'metadata': metadata,
                })\
                .execute()
            ok = bool(getattr(resp, 'data', None))
            print(f"[DBI] Save result (sync): {ok}")
            return ok
        except Exception as e:
            print(f"[DBI] Error saving prompt (sync): {e}")
            return False

    def save_prover_output(self, round_num: int, prover_idx: int, content: str,
                           model: str | None = None, tokens_in: int | None = None,
                           tokens_out: int | None = None, raw_response: dict | None = None) -> bool:
        if not self.db_client or not DatabaseService or self.problem_id is None:
            print("[DBI] save_prover_output: missing db/problem_id/DS")
            return False
        try:
            meta = {"model": model, "tokens_in": tokens_in, "tokens_out": tokens_out, "prover_index": prover_idx}
            # Main output
            self.db_client.table('problem_files')\
                .insert({
                    'problem_id': self.problem_id,
                    'round': round_num,
                    'file_type': 'prover_output',
                    'file_name': f"prover-{prover_idx:02d}.md",
                    'content': content,
                    'metadata': meta,
                })\
                .execute()
            # Raw response
            if raw_response is not None:
                import json
                self.db_client.table('problem_files')\
                    .insert({
                        'problem_id': self.problem_id,
                        'round': round_num,
                        'file_type': 'prover_raw',
                        'file_name': f"prover-{prover_idx:02d}.response.full.json",
                        'content': json.dumps(raw_response, indent=2),
                        'metadata': {"model": model, "prover_index": prover_idx},
                    })\
                    .execute()
            return True
        except Exception as e:
            print(f"[DBI] Error save_prover_output (sync): {e}")
            return False

    def save_verifier_prompt(self, round_num: int, prompt_text: str, model: str | None = None) -> bool:
        """Persist a verifier prompt as a round artifact in problem_files.

        Stores as file_type='verifier_prompt' with filename 'verifier.prompt.txt'.
        """
        if not self.db_client or self.problem_id is None:
            return False
        try:
            meta = {"phase": "prompt"}
            if model:
                meta["model"] = model
            self.db_client.table('problem_files')\
                .insert({
                    'problem_id': self.problem_id,
                    'round': round_num,
                    'file_type': 'verifier_prompt',
                    'file_name': 'verifier.prompt.txt',
                    'content': prompt_text,
                    'metadata': meta,
                })\
                .execute()
            return True
        except Exception:
            return False

    def save_verifier_output(self, round_num: int, feedback: str, summary: str,
                             verdict_data: dict | None, model: str | None = None,
                             raw_response: dict | None = None) -> bool:
        if not self.db_client or not DatabaseService or self.problem_id is None:
            print("[DBI] save_verifier_output: missing db/problem_id/DS")
            return False
        try:
            import json
            payload = verdict_data or {}
            payload.setdefault("feedback_md", feedback)
            payload.setdefault("summary_md", summary)
            self.db_client.table('problem_files')\
                .insert({
                    'problem_id': self.problem_id,
                    'round': round_num,
                    'file_type': 'verifier_output',
                    'file_name': 'verifier.json',
                    'content': json.dumps(payload, indent=2),
                    'metadata': {"model": model},
                })\
                .execute()
            if raw_response is not None:
                self.db_client.table('problem_files')\
                    .insert({
                        'problem_id': self.problem_id,
                        'round': round_num,
                        'file_type': 'verifier_raw',
                        'file_name': 'verifier.response.full.json',
                        'content': json.dumps(raw_response, indent=2),
                        'metadata': {"model": model},
                    })\
                    .execute()
            return True
        except Exception as e:
            print(f"[DBI] Error save_verifier_output (sync): {e}")
            return False

    def save_summarizer_output(self, round_num: int, summary: str,
                               one_line_summary: str | None = None,
                               model: str | None = None,
                               raw_response: dict | None = None) -> bool:
        if not self.db_client or not DatabaseService or self.problem_id is None:
            print("[DBI] save_summarizer_output: missing db/problem_id/DS")
            return False
        try:
            import json
            payload = {"summary": summary, "one_line_summary": one_line_summary}
            self.db_client.table('problem_files')\
                .insert({
                    'problem_id': self.problem_id,
                    'round': round_num,
                    'file_type': 'summarizer_output',
                    'file_name': 'summarizer.json',
                    'content': json.dumps(payload, indent=2),
                    'metadata': {"model": model},
                })\
                .execute()
            if raw_response is not None:
                self.db_client.table('problem_files')\
                    .insert({
                        'problem_id': self.problem_id,
                        'round': round_num,
                        'file_type': 'summarizer_raw',
                        'file_name': 'summarizer.response.full.json',
                        'content': json.dumps(raw_response, indent=2),
                        'metadata': {"model": model},
                    })\
                    .execute()
            return True
        except Exception as e:
            print(f"[DBI] Error save_summarizer_output (sync): {e}")
            return False

    def save_summarizer_prompt(self, round_num: int, prompt_text: str, model: str | None = None) -> bool:
        """Persist a summarizer prompt as a round artifact in problem_files.

        Stores as file_type='summarizer_prompt' with filename 'summarizer.prompt.txt'.
        """
        if not self.db_client or self.problem_id is None:
            return False
        try:
            meta = {"phase": "prompt"}
            if model:
                meta["model"] = model
            self.db_client.table('problem_files')\
                .insert({
                    'problem_id': self.problem_id,
                    'round': round_num,
                    'file_type': 'summarizer_prompt',
                    'file_name': 'summarizer.prompt.txt',
                    'content': prompt_text,
                    'metadata': meta,
                })\
                .execute()
            return True
        except Exception:
            return False


_integration: Optional[_DbIntegration] = None


def initialize_database_integration(problem_id: int, user_token: str, user_id: str) -> None:
    """Create a Supabase client authenticated as the user and set context."""
    global _integration
    if get_db_client_with_token is None:
        print("[DBI] get_db_client_with_token not available; integration disabled")
        _integration = _DbIntegration(db_client=None, problem_id=None)
        return
    db_client = get_db_client_with_token(user_token, user_id)
    _integration = _DbIntegration(db_client=db_client, problem_id=problem_id)


def get_database_integration() -> Optional[_DbIntegration]:
    return _integration


def get_current_problem_id() -> Optional[int]:
    return _integration.problem_id if _integration else None


def set_current_run_id(run_id: int | None) -> None:
    global _integration
    if _integration:
        _integration.run_id = run_id


def get_current_run_id() -> Optional[int]:
    return _integration.run_id if _integration else None


def get_run_parameters() -> dict:
    """Fetch current run parameters from DB, best-effort.
    Returns a dict (possibly empty) with keys like 'user_specification' and 'prover_directives'.
    """
    try:
        if not _integration or not _integration.db_client or not _integration.run_id:
            return {}
        # Perform a direct synchronous query using the Supabase client.
        # This avoids mixing event loops inside a synchronous context.
        resp = _integration.db_client.table('runs')\
            .select('*')\
            .eq('id', int(_integration.run_id))\
            .single()\
            .execute()
        run_row = getattr(resp, 'data', None)
        if not run_row:
            return {}
        params = run_row.get('parameters') or {}
        return params if isinstance(params, dict) else {}
    except Exception:
        return {}


