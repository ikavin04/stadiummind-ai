"""
conftest.py for the RAG relevance test suite.

Patches the SQLAlchemy async engine and google.generativeai at the session
level BEFORE any app module is imported, so the engine does not attempt a
real Postgres connection during tests.
"""
import sys
import pytest
from unittest.mock import MagicMock, patch, AsyncMock


# ---------------------------------------------------------------------------
# Block real DB and google-generativeai connections for the entire test session
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def mock_db_engine():
    """
    Patch create_async_engine so SQLAlchemy never tries to connect to Postgres.
    Must run before any app.* import, so it is session-scoped and autouse=True.
    """
    mock_engine = MagicMock()
    mock_engine.begin = AsyncMock()
    mock_engine.dispose = AsyncMock()

    mock_session = MagicMock()
    mock_session.__aenter__ = AsyncMock(return_value=MagicMock())
    mock_session.__aexit__ = AsyncMock(return_value=False)

    with (
        patch("sqlalchemy.ext.asyncio.create_async_engine", return_value=mock_engine),
        patch("sqlalchemy.ext.asyncio.async_sessionmaker", return_value=MagicMock()),
    ):
        yield mock_engine


@pytest.fixture(scope="session", autouse=True)
def mock_genai():
    """Prevent google.generativeai from needing a real API key."""
    mock_module = MagicMock()
    mock_module.embed_content.return_value = {"embedding": [0.0] * 768}
    mock_module.configure = MagicMock()
    mock_module.GenerativeModel.return_value = MagicMock()
    mock_module.types = MagicMock()

    with patch.dict(sys.modules, {"google.generativeai": mock_module, "google": MagicMock()}):
        yield mock_module
