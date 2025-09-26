"""
Database integration shim for orchestrator.

Holds a per-process reference to an authenticated Supabase client
and to the current problem context so agents can persist artifacts
to the database via backend DatabaseService methods.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from pathlib import Path
import sys

# Add backend to path for DatabaseService and authentication helpers
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from services.database import DatabaseService
    from authentication import get_db_client_with_token
except Exception:
    DatabaseService = None  # type: ignore
    get_db_client_with_token = None  # type: ignore


@dataclass
class _DbIntegration:
    db_client: object | None
    problem_id: int | None

    def save_prover_prompt(self, round_num: int, prover_idx: int, prompt_text: str, model: str | None = None) -> bool:
        """Persist a prover prompt as a round artifact in problem_files.

        Stores as file_type='prover_prompt' with filename 'prover-XX.prompt.txt'.
        Works in both sync and async contexts.
        """
        if not self.db_client or not DatabaseService or self.problem_id is None:
            print("[DBI] save_prover_prompt: missing db_client/DatabaseService/problem_id; skipping")
            return False
        metadata = {"phase": "prompt", "prover_index": prover_idx}
        if model:
            metadata["model"] = model

        async def _save_async():
            try:
                print(f"[DBI] Saving prompt: problem_id={self.problem_id}, round={round_num}, prover={prover_idx}, len={len(prompt_text)}")
                ok = await DatabaseService.create_problem_file(  # type: ignore
                    db=self.db_client,
                    problem_id=self.problem_id,
                    round_num=round_num,
                    file_type="prover_prompt",
                    filename=f"prover-{prover_idx:02d}.prompt.txt",
                    content=prompt_text,
                    metadata=metadata,
                )
                print(f"[DBI] Save result: {ok}")
                return ok
            except Exception as e:
                print(f"[DBI] Error saving prompt: {e}")
                return False

        try:
            import asyncio
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Schedule task; cannot block here
                asyncio.create_task(_save_async())
                print("[DBI] Scheduled async prompt save task")
                return True
            else:
                # No running loop; run synchronously
                result = loop.run_until_complete(_save_async())
                return bool(result)
        except RuntimeError:
            # No loop set; create one
            import asyncio
            result = asyncio.run(_save_async())
            return bool(result)


_integration: Optional[_DbIntegration] = None


def initialize_database_integration(problem_id: int, user_token: str, user_id: str) -> None:
    """Create a Supabase client authenticated as the user and set context."""
    global _integration
    if get_db_client_with_token is None:
        _integration = _DbIntegration(db_client=None, problem_id=None)
        return
    db_client = get_db_client_with_token(user_token, user_id)
    _integration = _DbIntegration(db_client=db_client, problem_id=problem_id)


def get_database_integration() -> Optional[_DbIntegration]:
    return _integration


def get_current_problem_id() -> Optional[int]:
    return _integration.problem_id if _integration else None


