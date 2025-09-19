"""
Supabase database client configuration and connection management.

This module handles:
- Supabase client initialization
- Database connection management
- Authentication helpers
- Common database utilities
"""

import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Validate required environment variables
if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("⚠️  Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set.")
    print("   Database features will be disabled.")
    supabase: Optional[Client] = None
    supabase_admin: Optional[Client] = None
else:
    # Initialize Supabase clients
    # Regular client uses anon key (respects RLS)
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    # Admin client uses service key (bypasses RLS) - only if available
    if SUPABASE_SERVICE_KEY:
        supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    else:
        supabase_admin = None
        print("ℹ️  SUPABASE_SERVICE_KEY not set. Admin operations disabled.")


def get_db() -> Optional[Client]:
    """
    Get the Supabase client instance.

    Returns:
        Supabase client or None if not configured
    """
    return supabase


def get_admin_db() -> Optional[Client]:
    """
    Get the Supabase admin client instance (bypasses RLS).
    Use with caution - only for administrative operations.

    Returns:
        Supabase admin client or None if not configured
    """
    return supabase_admin


def is_database_configured() -> bool:
    """
    Check if database is properly configured.

    Returns:
        True if database is available, False otherwise
    """
    return supabase is not None


async def get_current_user_id(auth_token: Optional[str] = None) -> Optional[str]:
    """
    Get the current authenticated user ID from JWT token.

    Args:
        auth_token: JWT token from Authorization header

    Returns:
        User ID (UUID string) or None if not authenticated
    """
    if not auth_token or not supabase:
        return None

    try:
        # Verify the JWT and get user info
        user = supabase.auth.get_user(auth_token)
        return user.user.id if user and user.user else None
    except Exception as e:
        print(f"Auth error: {e}")
        return None


# Export key functions and objects
__all__ = [
    'supabase',
    'supabase_admin',
    'get_db',
    'get_admin_db',
    'is_database_configured',
    'get_current_user_id'
]