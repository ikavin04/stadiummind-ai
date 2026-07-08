"""Auth API router — Firebase token sync and user role management."""
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from app.core.database import AsyncSessionLocal
from app.core.security import verify_firebase_token
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])

ROLE_DASHBOARD_CONFIG = {
    "fan": {"modules": ["fan_assistant", "schedule"], "default_view": "fan_assistant"},
    "manager": {"modules": ["dashboard", "crowd", "fan_assistant", "reports"], "default_view": "dashboard"},
    "security": {"modules": ["dashboard", "crowd", "alerts"], "default_view": "dashboard"},
    "medical": {"modules": ["dashboard", "alerts", "medical_log"], "default_view": "dashboard"},
    "volunteer": {"modules": ["dashboard", "fan_assistant", "task_queue"], "default_view": "dashboard"},
}


@router.post("/sync")
async def sync_user(decoded_token: dict = Depends(verify_firebase_token)):
    """
    Sync Firebase user to local DB. Returns role-based dashboard config.
    Can also accept explicit role via query param for demo purposes.
    """
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Authentication required")

    firebase_uid = decoded_token.get("uid", "demo-user")
    email = decoded_token.get("email", "demo@stadiummind.ai")
    display_name = decoded_token.get("name")

    async with AsyncSessionLocal() as session:
        # Check if user exists
        result = await session.execute(select(User).where(User.firebase_uid == firebase_uid))
        user = result.scalar_one_or_none()

        if user is None:
            user = User(
                firebase_uid=firebase_uid,
                email=email,
                display_name=display_name,
                role="manager",  # Demo default: manager gets full dashboard
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        elif display_name and user.display_name != display_name:
            user.display_name = display_name
            await session.commit()

        config = ROLE_DASHBOARD_CONFIG.get(user.role, ROLE_DASHBOARD_CONFIG["manager"])

        return {
            "user_id": user.id,
            "role": user.role,
            "email": user.email,
            "display_name": user.display_name,
            "dashboard_config": config,
        }


@router.post("/demo-login")
async def demo_login(role: str = "manager"):
    """Demo endpoint for judges — returns a mock auth response without Firebase."""
    valid_roles = list(ROLE_DASHBOARD_CONFIG.keys())
    if role not in valid_roles:
        role = "manager"

    config = ROLE_DASHBOARD_CONFIG[role]
    return {
        "user_id": f"demo-{role}",
        "role": role,
        "email": f"demo-{role}@stadiummind.ai",
        "display_name": f"Demo {role.capitalize()}",
        "dashboard_config": config,
        "demo_token": f"demo-token-{role}",
    }
