"""
Configuration settings for the Automatic Researcher backend.
"""

import os
from pathlib import Path

# Data storage paths
DATA_ROOT = Path(os.environ.get("AR_DATA_ROOT", "./data")).resolve()
DATA_ROOT.mkdir(parents=True, exist_ok=True)

# Repository paths for public dev UI (no auth required)
REPO_ROOT = Path(__file__).resolve().parent.parent
REPO_PROBLEMS_ROOT = REPO_ROOT / "problems"
REPO_DRAFTS_ROOT = REPO_ROOT / "drafts"

# Create directories if they don't exist
REPO_PROBLEMS_ROOT.mkdir(exist_ok=True)
REPO_DRAFTS_ROOT.mkdir(exist_ok=True)

def user_dir(user_id: str) -> Path:
    """Get user-specific data directory"""
    d = DATA_ROOT / user_id
    d.mkdir(parents=True, exist_ok=True)
    return d