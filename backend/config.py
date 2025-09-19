"""
Configuration settings for the Automatic Researcher backend.

This module handles database configuration. The system now operates
entirely with database storage (Supabase).
"""

import os

# Database configuration - this is now required for all operations
DATABASE_ENABLED = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_ANON_KEY"))

def is_database_configured() -> bool:
    """
    Check if database is properly configured.

    Returns:
        True if database is available
    """
    return DATABASE_ENABLED