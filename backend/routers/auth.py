"""
Authentication router for the database-only backend API.

This module handles Supabase authentication using JWT tokens.
All filesystem-based authentication has been removed.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional

from ..db import get_current_user_id, is_database_configured

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_authenticated_user(authorization: str = Header(...)) -> str:
    """
    Dependency to get authenticated user ID from Authorization header.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        User ID

    Raises:
        HTTPException: If not authenticated or database not configured
    """
    if not is_database_configured():
        raise HTTPException(503, "Database not configured")

    # Extract token from "Bearer <token>" format
    token = None
    if authorization.startswith("Bearer "):
        token = authorization[7:]  # Remove "Bearer " prefix

    user_id = await get_current_user_id(token)
    if not user_id:
        raise HTTPException(401, "Authentication required")

    return user_id


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
async def signup(request: SignupRequest):
    """
    User signup endpoint using Supabase authentication.
    """
    if not is_database_configured():
        raise HTTPException(503, "Database not configured")

    try:
        from ..db import supabase
        if not supabase:
            raise HTTPException(503, "Database client not available")

        # Create user account with Supabase Auth
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if response.user:
            return {
                "message": "Account created successfully. Please check your email for verification.",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "email_confirmed": response.user.email_confirmed_at is not None
                }
            }
        else:
            raise HTTPException(400, "Failed to create account")

    except Exception as e:
        print(f"Signup error: {e}")
        # Handle common Supabase errors
        error_msg = str(e)
        if "already registered" in error_msg.lower():
            raise HTTPException(400, "Email already registered")
        elif "password" in error_msg.lower():
            raise HTTPException(400, "Password does not meet requirements")
        else:
            raise HTTPException(500, f"Signup failed: {str(e)}")


@router.post("/login")
async def login(request: LoginRequest):
    """
    User login endpoint using Supabase authentication.
    """
    if not is_database_configured():
        raise HTTPException(503, "Database not configured")

    try:
        from ..db import supabase
        if not supabase:
            raise HTTPException(503, "Database client not available")

        # Authenticate with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if response.user and response.session:
            return {
                "message": "Login successful",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "email_confirmed": response.user.email_confirmed_at is not None
                },
                "session": {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "expires_at": response.session.expires_at
                }
            }
        else:
            raise HTTPException(401, "Invalid email or password")

    except Exception as e:
        print(f"Login error: {e}")
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(401, "Invalid email or password")
        else:
            raise HTTPException(500, f"Login failed: {str(e)}")


@router.post("/logout")
async def logout():
    """
    Logout endpoint - client should handle token removal.
    """
    if not is_database_configured():
        raise HTTPException(503, "Database not configured")

    # Note: Supabase logout is typically handled client-side by removing tokens
    # The backend doesn't need to maintain session state since we use JWTs
    return {
        "message": "Logout successful. Please remove tokens from client storage."
    }


@router.get("/me")
async def get_current_user(user_id: str = Depends(get_authenticated_user)):
    """
    Get current authenticated user information.
    """
    return {
        "user_id": user_id,
        "authenticated": True
    }


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if authentication endpoints are available."""
    return {
        "status": "healthy" if is_database_configured() else "database_unavailable",
        "database_configured": is_database_configured()
    }