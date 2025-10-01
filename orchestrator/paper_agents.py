"""
Paper writing agent functions for the orchestrator system.

This module contains functions for calling AI agents used in paper writing mode:
- Paper suggester agents that provide advice and priority items
- Paper fixer agents that modify and improve LaTeX documents
"""

from pathlib import Path


def call_paper_suggester(problem_dir: Path, round_idx: int):
    raise RuntimeError("Paper agents are disabled in DB-only mode")


def call_paper_fixer(problem_dir: Path, round_idx: int, suggester_output):
    raise RuntimeError("Paper agents are disabled in DB-only mode")