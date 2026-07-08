"""Firebase token verification and security utilities."""
import logging
from typing import Optional
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import HTTPException, Header
from app.core.config import get_settings
import os

logger = logging.getLogger(__name__)

_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    settings = get_settings()
    try:
        if settings.firebase_service_account_path and os.path.exists(settings.firebase_service_account_path):
            cred = credentials.Certificate(settings.firebase_service_account_path)
            firebase_admin.initialize_app(cred)
        elif settings.firebase_project_id:
            # Use default credentials (works on GCP / with GOOGLE_APPLICATION_CREDENTIALS)
            firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
        else:
            logger.warning("Firebase not configured — auth verification will be skipped (demo mode)")
            _firebase_initialized = True
            return
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized")
    except Exception as e:
        logger.error(f"Firebase init failed: {e}")


async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """
    Dependency: verifies Firebase ID token from Authorization: Bearer <token>.
    Returns decoded token dict or None if Firebase is not configured (demo mode).
    Raises 401 if token is present but invalid.
    """
    settings = get_settings()
    if not settings.firebase_project_id:
        # Demo mode — no auth enforcement
        return {"uid": "demo-user", "email": "demo@stadiummind.ai"}

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split("Bearer ")[1]
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def optional_auth(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Optional auth — for public/demo endpoints. Returns decoded token or None."""
    if not authorization:
        return None
    try:
        return await verify_firebase_token(authorization)
    except HTTPException:
        return None
