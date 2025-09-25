"""
Authentication middleware for JWT token verification and database client creation.

This module provides middleware for:
- JWT token extraction and verification
- Authenticated user context creation
- Per-request database client creation with proper authentication
"""

import os
from typing import Optional

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from supabase import Client, create_client

from .logging_config import get_logger

logger = get_logger("auth_middleware")


class AuthedUser(BaseModel):
    """Authenticated user model with JWT claims."""

    sub: str  # User ID (UUID)
    email: Optional[str] = None
    role: Optional[str] = None
    token: str  # JWT token for database operations


# Get Supabase configuration from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")


def is_database_configured() -> bool:
    """Check if database is properly configured."""
    return bool(SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY)


logger.info(
    f"Database configured: {is_database_configured()} with URL: {SUPABASE_URL} and publishable key present: {bool(SUPABASE_PUBLISHABLE_KEY)}"
)


# Security scheme for JWT tokens
security = HTTPBearer()

# Global Supabase client (holds config + publishable key)
# This is used for JWT verification only
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get the global Supabase client for JWT verification."""
    global _supabase_client

    if _supabase_client is None:
        if not is_database_configured():
            raise HTTPException(status_code=503, detail="Database not configured")

        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
            logger.info("Global Supabase client initialized for JWT verification")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Database initialization failed"
            )

    logger.info(f"Global Supabase client initialized for JWT verification: {_supabase_client}")
    return _supabase_client


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(security),
) -> AuthedUser:
    """
    Extract and verify JWT token, returning authenticated user context.

    Args:
        creds: HTTP Authorization credentials containing JWT token

    Returns:
        AuthedUser: Authenticated user with claims and token

    Raises:
        HTTPException: If token is invalid, expired, or verification fails
    """
    token = creds.credentials

    try:
        # Get the global client for JWT verification
        sb = get_supabase_client()

        # Verify signature & expiry via project's JWKS and load user
        user_resp = sb.auth.get_user(jwt=token)
        logger.info("User validated", extra={"event_type": "auth_user_validated"})

        user_obj = getattr(user_resp, "user", None)
        if not user_obj or not getattr(user_obj, "id", None):
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user_id = user_obj.id

        logger.debug(
            f"User authenticated successfully: {user_id}",
            extra={
                "event_type": "auth_success",
                "user_id": user_id,
                "email": getattr(user_obj, "email", None),
            },
        )

        r = AuthedUser(
            sub=user_id,
            email=getattr(user_obj, "email", None),
            role=getattr(user_obj, "role", None),
            token=token,
        )
        logger.info(f"User authenticated successfully: {r}")
        return r

    except HTTPException:
        # Re-raise HTTP exceptions (like 401, 503)
        raise
    except Exception as e:
        logger.warning(
            f"Authentication failed: {str(e)}",
            extra={
                "event_type": "auth_failed",
                "error_type": type(e).__name__,
                "error_details": str(e),
            },
        )
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_optional_user(request: Request) -> Optional[AuthedUser]:
    """
    Extract user from request if Authorization header is present.
    Used for endpoints that can work with or without authentication.

    Args:
        request: FastAPI request object

    Returns:
        AuthedUser if token is present and valid, None otherwise
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    try:
        token = auth_header.split(" ")[1]
        sb = get_supabase_client()
        user_resp = sb.auth.get_user(jwt=token)
        user_obj = getattr(user_resp, "user", None)
        if not user_obj or not getattr(user_obj, "id", None):
            return None

        return AuthedUser(
            sub=user_obj.id,
            email=getattr(user_obj, "email", None),
            role=getattr(user_obj, "role", None),
            token=token,
        )
    except Exception:
        # If verification fails, return None (unauthenticated)
        return None


def supabase_as_user(user: AuthedUser) -> Client:
    """
    Create a per-request Supabase client authenticated as the given user.

    This client will have the user's JWT token attached to all requests,
    ensuring RLS (Row Level Security) policies are enforced correctly.

    Args:
        user: Authenticated user context

    Returns:
        Client: Supabase client authenticated as the user
    """
    try:
        # Create a new client instance for this request
        client = create_client(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

        # Attach the user's JWT token to ensure RLS runs as this user
        client.postgrest.auth(user.token)

        logger.debug(
            f"Created authenticated Supabase client for user: {user.sub}",
            extra={"event_type": "db_client_created", "user_id": user.sub},
        )

        return client

    except Exception as e:
        logger.error(
            f"Failed to create authenticated Supabase client: {str(e)}",
            extra={
                "event_type": "db_client_error",
                "user_id": user.sub,
                "error_type": type(e).__name__,
                "error_details": str(e),
            },
        )
        raise HTTPException(status_code=500, detail="Failed to create database client")


def get_db_client(user: AuthedUser = Depends(get_current_user)) -> Client:
    """
    Dependency that provides an authenticated Supabase client.

    This is the main dependency to use in endpoint functions that need
    database access with proper user authentication.

    Args:
        user: Authenticated user (injected by FastAPI)

    Returns:
        Client: Authenticated Supabase client
    """
    return supabase_as_user(user)


def get_db_client_with_token(user_token: str, user_id: str) -> Client:
    """
    Create an authenticated Supabase client for background tasks using user JWT token.

    This creates a client using the user's JWT token, maintaining Row Level Security
    for background operations.

    Args:
        user_token: User's JWT token
        user_id: User ID for context (used in logging)

    Returns:
        Client: Supabase client authenticated as the user
    """
    try:
        # Create client with user's JWT token to maintain RLS
        client = create_client(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

        # Attach the user's JWT token to ensure RLS runs as this user
        client.postgrest.auth(user_token)

        logger.debug(
            f"Created user-authenticated Supabase client for background task (user: {user_id})",
            extra={"event_type": "db_client_created_background", "user_id": user_id},
        )

        return client

    except Exception as e:
        logger.error(
            f"Failed to create user-authenticated Supabase client: {str(e)}",
            extra={
                "event_type": "db_client_background_error",
                "user_id": user_id,
                "error_type": type(e).__name__,
                "error_details": str(e),
            },
        )
        raise Exception(f"Failed to create database client: {str(e)}")


# Export key functions and objects
__all__ = [
    "AuthedUser",
    "get_current_user",
    "get_optional_user",
    "supabase_as_user",
    "get_db_client",
    "get_db_client_with_token",
    "security",
]
