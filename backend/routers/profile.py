"""
Profile router: exposes current user's credits info.

Adheres to centralized auth and DatabaseService access patterns.
"""

from fastapi import APIRouter, Depends, HTTPException

from ..authentication import get_current_user, AuthedUser
from ..authentication import get_db_client
from ..services.database import DatabaseService
from ..logging_config import get_logger

router = APIRouter(prefix="/profile", tags=["profile"])
logger = get_logger("automatic_researcher.routers.profile")


@router.get("/credits")
async def get_credits(user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)):
    """
    Return the current user's credits usage and limit.
    """
    try:
        profile = await DatabaseService.get_user_profile(db, user.sub)  # type: ignore
        if not profile:
            logger.error(
                "Profile not found",
                extra={"event_type": "profile_not_found", "user_id": user.sub},
            )
            raise HTTPException(404, detail={"code": "PROFILE_NOT_FOUND", "message": "User profile not found"})

        used = float(profile.get("credits_used") or 0)
        limit = float(profile.get("credits_limit") or 0)
        available = max(0.0, limit - used)
        return {"credits_used": used, "credits_limit": limit, "credits_available": available}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Failed to fetch credits: {e}",
            extra={"event_type": "credits_fetch_error", "user_id": user.sub, "error_type": type(e).__name__},
        )
        raise HTTPException(500, detail={"code": "CREDITS_FETCH_ERROR", "message": "Failed to fetch credits"})


