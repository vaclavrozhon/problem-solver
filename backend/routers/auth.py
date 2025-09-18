"""
Authentication router with Google OAuth support.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..auth import (
    verify_google_token,
    get_or_create_user,
    create_access_token,
    get_current_user,
    GOOGLE_CLIENT_ID
)
from ..db_models import User

router = APIRouter(prefix="/auth", tags=["authentication"])


class GoogleAuthPayload(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    picture_url: Optional[str]
    credits_balance: float
    is_admin: bool

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.get("/test")
def test_endpoint():
    """Simple test endpoint with no dependencies."""
    return {"status": "auth router working"}

@router.get("/google/config")
def get_google_config():
    """Get Google OAuth configuration for frontend."""
    return {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": "/auth/google/callback"
    }

@router.post("/google/login", response_model=AuthResponse)
async def google_login(payload: GoogleAuthPayload, db: Session = Depends(get_db)):
    """
    Authenticate user with Google ID token.

    Frontend should:
    1. Use Google Sign-In JavaScript library
    2. Get ID token from Google
    3. Send it to this endpoint
    """
    # Verify Google ID token
    google_user_info = await verify_google_token(payload.id_token)
    if not google_user_info:
        raise HTTPException(400, "Invalid Google token")

    # Get or create user
    try:
        user = get_or_create_user(db, google_user_info)
    except Exception as e:
        raise HTTPException(500, f"Failed to create/update user: {str(e)}")

    # Create JWT token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    # Return user info and token
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        picture_url=user.picture_url,
        credits_balance=float(user.credits_balance),
        is_admin=user.is_admin
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        picture_url=current_user.picture_url,
        credits_balance=float(current_user.credits_balance),
        is_admin=current_user.is_admin
    )

@router.get("/credits")
def get_user_credits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's credit balance and recent transactions."""
    from ..db_models import CreditTransaction

    # Get recent transactions
    recent_transactions = (
        db.query(CreditTransaction)
        .filter(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(10)
        .all()
    )

    transactions = []
    for tx in recent_transactions:
        transactions.append({
            "id": tx.id,
            "amount": float(tx.amount),
            "type": tx.transaction_type,
            "description": tx.description,
            "created_at": tx.created_at.isoformat(),
            "tokens_used": tx.tokens_used,
            "model_used": tx.model_used
        })

    return {
        "balance": float(current_user.credits_balance),
        "spent": float(current_user.credits_spent),
        "transactions": transactions
    }

@router.post("/logout")
def logout():
    """
    Logout endpoint (mainly for consistency).
    JWT tokens are stateless, so logout is handled client-side by removing the token.
    """
    return {"message": "Logged out successfully"}

# Development/testing endpoints (remove in production)
@router.post("/dev/create-test-user")
def create_test_user(db: Session = Depends(get_db)):
    """Create a test user for development (remove in production)."""
    test_user_info = {
        "sub": "test_user_123",
        "email": "test@example.com",
        "name": "Test User",
        "picture": "https://via.placeholder.com/150"
    }

    user = get_or_create_user(db, test_user_info)
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "credits_balance": float(user.credits_balance)
        }
    }