"""Basic API route smoke tests."""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock, MagicMock


@pytest.fixture
async def client():
    """Create test client with DB and simulation mocked out."""
    with (
        patch("app.core.database.init_db", new_callable=AsyncMock),
        patch("app.services.fan_assistant.load_faiss_index"),
        patch("app.services.simulator.run_simulation", new_callable=AsyncMock),
        patch("app.core.security.init_firebase"),
    ):
        from app.main import app
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    assert resp.json()["name"] == "StadiumMind AI"


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_demo_login(client):
    resp = await client.post("/api/auth/demo-login?role=manager")
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "manager"
    assert "dashboard_config" in data


@pytest.mark.asyncio
async def test_translate_english_passthrough(client):
    """Translating to 'en' should return original text without calling Gemini."""
    resp = await client.post("/api/i18n/translate", json={"text": "Hello", "target_language": "en"})
    assert resp.status_code == 200
    assert resp.json()["translated"] == "Hello"


@pytest.mark.asyncio
async def test_translate_unsupported_language(client):
    resp = await client.post("/api/i18n/translate", json={"text": "Hello", "target_language": "zz"})
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_supported_languages(client):
    resp = await client.get("/api/i18n/languages")
    assert resp.status_code == 200
    codes = [l["code"] for l in resp.json()]
    assert "en" in codes
    assert "ar" in codes
    assert "hi" in codes
