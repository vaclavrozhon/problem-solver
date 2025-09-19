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
    f"Database configured: {is_database_configured()} with URL: {SUPABASE_URL} and publishable key: {SUPABASE_PUBLISHABLE_KEY}"
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

        # Verifies signature & expiry via the project's JWKS, then returns claims
        claims_response = sb.auth.get_claims(jwt=token)
        logger.info(f"Claims response: {claims_response} from Token: {token}")

        # Extract the actual claims from the nested structure
        claims = claims_response.get("claims", {})
        if not claims:
            raise HTTPException(
                status_code=401, detail="Invalid token: no claims found"
            )

        # Extract user information from claims
        user_id = claims.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401, detail="Invalid token: missing user ID"
            )

        logger.debug(
            f"User authenticated successfully: {user_id}",
            extra={
                "event_type": "auth_success",
                "user_id": user_id,
                "email": claims.get("email"),
            },
        )

        r = AuthedUser(
            sub=user_id,
            email=claims.get("email"),
            role=claims.get("role"),
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
        claims_response = sb.auth.get_claims(jwt=token)
        
        # Extract the actual claims from the nested structure
        claims = claims_response.get("claims", {})
        if not claims:
            return None

        user_id = claims.get("sub")
        if not user_id:
            return None

        return AuthedUser(
            sub=user_id,
            email=claims.get("email"),
            role=claims.get("role"),
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


# Export key functions and objects
__all__ = [
    "AuthedUser",
    "get_current_user",
    "get_optional_user",
    "supabase_as_user",
    "get_db_client",
    "security",
]
