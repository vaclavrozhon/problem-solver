"""
Google OAuth authentication service for the automatic researcher application.
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from decimal import Decimal

import httpx
from fastapi import HTTPException, Depends, Header
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from .db_models import User

# OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

async def verify_google_token(id_token: str) -> Optional[dict]:
    """Verify Google ID token and get user info."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            if response.status_code == 200:
                token_info = response.json()
                # Verify the token is for our app
                if token_info.get("aud") == GOOGLE_CLIENT_ID:
                    return token_info
            return None
    except Exception as e:
        print(f"Error verifying Google token: {e}")
        return None

def get_or_create_user(db: Session, google_user_info: dict) -> User:
    """Get existing user or create new one from Google user info."""
    google_id = google_user_info.get("sub")
    email = google_user_info.get("email")
    name = google_user_info.get("name")
    picture = google_user_info.get("picture")

    if not google_id or not email:
        raise ValueError("Invalid Google user info: missing ID or email")

    # Try to find existing user by google_id
    user = db.query(User).filter(User.google_id == google_id).first()

    if user:
        # Update user info in case it changed
        user.email = email
        user.name = name
        user.picture_url = picture
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    # Try to find existing user by email (in case they had an account before OAuth)
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Link existing account to Google
        user.google_id = google_id
        user.name = name
        user.picture_url = picture
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    # Create new user
    user = User(
        google_id=google_id,
        email=email,
        name=name,
        picture_url=picture,
        credits_balance=Decimal("10.00"),  # Default signup bonus
        credits_spent=Decimal("0.00"),
        is_active=True,
        last_login=datetime.utcnow()
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Create signup bonus credit transaction
    from .db_models import CreditTransaction
    bonus_transaction = CreditTransaction(
        user_id=user.id,
        amount=Decimal("10.00"),
        transaction_type="signup_bonus",
        description="Welcome bonus for new user"
    )
    db.add(bonus_transaction)
    db.commit()

    return user

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    if not authorization:
        raise HTTPException(401, "Authorization header missing")

    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(401, "Invalid authentication scheme")
    except ValueError:
        raise HTTPException(401, "Invalid authorization header format")

    # Verify token
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(401, "Invalid or expired token")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(401, "Invalid token payload")

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(401, "User not found")

    if not user.is_active:
        raise HTTPException(401, "User account is disabled")

    return user

def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    try:
        return get_current_user(authorization, db)
    except HTTPException:
        return None

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin privileges."""
    if not current_user.is_admin:
        raise HTTPException(403, "Admin privileges required")
    return current_user

def check_user_credits(user: User, estimated_cost: float) -> bool:
    """Check if user has sufficient credits for an operation."""
    return float(user.credits_balance) >= estimated_cost

def deduct_user_credits(
    db: Session,
    user: User,
    amount: float,
    transaction_type: str,
    description: str,
    **kwargs
) -> None:
    """Deduct credits from user account and create transaction record."""
    from .db_models import CreditTransaction

    amount_decimal = Decimal(str(amount))

    # Update user balance
    user.credits_balance -= amount_decimal
    user.credits_spent += amount_decimal

    # Create transaction record
    transaction = CreditTransaction(
        user_id=user.id,
        amount=-amount_decimal,  # Negative for spent credits
        transaction_type=transaction_type,
        description=description,
        **kwargs
    )

    db.add(transaction)
    db.commit()
    db.refresh(user)

def add_user_credits(
    db: Session,
    user: User,
    amount: float,
    transaction_type: str,
    description: str,
    **kwargs
) -> None:
    """Add credits to user account and create transaction record."""
    from .db_models import CreditTransaction

    amount_decimal = Decimal(str(amount))

    # Update user balance
    user.credits_balance += amount_decimal

    # Create transaction record
    transaction = CreditTransaction(
        user_id=user.id,
        amount=amount_decimal,  # Positive for added credits
        transaction_type=transaction_type,
        description=description,
        **kwargs
    )

    db.add(transaction)
    db.commit()
    db.refresh(user)