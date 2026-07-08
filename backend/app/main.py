"""
StadiumMind AI — FastAPI Application Entry Point
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.core.security import init_firebase
from app.api import dashboard, crowd, chat, i18n, auth

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

_simulation_task: asyncio.Task | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    global _simulation_task
    logger.info("🏟️ StadiumMind AI starting up...")

    # Initialize Firebase
    init_firebase()

    # Initialize DB (create tables)
    await init_db()
    logger.info("Database initialized")

    # Load FAISS index
    try:
        from app.services.fan_assistant import load_faiss_index
        load_faiss_index()
    except Exception as e:
        logger.warning(f"FAISS index load skipped: {e}")

    # Log Gemini Daily call budget status
    try:
        from app.core.gemini_client import gemini_client
        guard = gemini_client.budget_guard
        logger.info(f"Gemini budget guard status: {guard.get_count()} / {guard.threshold} calls used today (remaining: {guard.get_remaining()})")
    except Exception as e:
        logger.warning(f"Could not load Gemini budget: {e}")

    # Start background crowd simulation
    from app.services.simulator import run_simulation
    _simulation_task = asyncio.create_task(run_simulation())
    logger.info("Crowd simulation task started")

    yield  # Application running

    # Shutdown
    logger.info("🏟️ StadiumMind AI shutting down...")
    from app.services.simulator import stop_simulation
    stop_simulation()
    if _simulation_task:
        _simulation_task.cancel()
        try:
            await _simulation_task
        except asyncio.CancelledError:
            pass


settings = get_settings()

app = FastAPI(
    title="StadiumMind AI",
    description="Intelligent Operating System for FIFA World Cup 2026 Stadiums",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router)
app.include_router(crowd.router)
app.include_router(chat.router)
app.include_router(i18n.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "name": "StadiumMind AI",
        "version": "1.0.0",
        "status": "operational",
        "tagline": "The Intelligent Operating System for FIFA World Cup 2026",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/admin/gemini-usage")
async def get_gemini_usage():
    from app.core.gemini_client import gemini_client
    guard = gemini_client.budget_guard
    settings = get_settings()
    return {
        "used": guard.get_count(),
        "limit": guard.threshold,
        "remaining": guard.get_remaining(),
        "use_mock_gemini": settings.use_mock_gemini,
        "exhausted": guard.is_exhausted()
    }
