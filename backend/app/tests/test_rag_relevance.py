"""
Tests for mock-mode RAG relevance thresholds.

These tests validate the two new relevance gates WITHOUT importing the full
FastAPI app (which would try to connect to Postgres at collection time).

Instead they:
  1. Test the pure keyword-scoring logic directly (extracted into a helper
     that mirrors retrieve_relevant_chunks exactly).
  2. Test GeminiClient.chat_completion mock path in isolation, with the
     FAISS state injected via unittest.mock.patch.

Run:
    pytest app/tests/test_rag_relevance.py -v
"""
import sys
import pytest
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# Block DB + google.generativeai BEFORE any app.* import
# This must happen at module import time, before pytest collects fixtures.
# ---------------------------------------------------------------------------

_mock_engine = MagicMock()
_mock_sessionmaker = MagicMock()
_mock_genai = MagicMock()
_mock_genai.embed_content.return_value = {"embedding": [0.0] * 768}
_mock_genai.configure = MagicMock()
_mock_genai.GenerativeModel.return_value = MagicMock()
_mock_genai.types = MagicMock()
_mock_google = MagicMock()
_mock_google.generativeai = _mock_genai

sys.modules.setdefault("google", _mock_google)
sys.modules.setdefault("google.generativeai", _mock_genai)

# Patch SQLAlchemy engine creation before any app.core.database import
_sa_patcher = patch("sqlalchemy.ext.asyncio.create_async_engine", return_value=_mock_engine)
_sm_patcher = patch("sqlalchemy.ext.asyncio.async_sessionmaker", return_value=_mock_sessionmaker)
_sa_patcher.start()
_sm_patcher.start()

# ---------------------------------------------------------------------------
# Synthetic knowledge base used across all tests
# ---------------------------------------------------------------------------
MOCK_METADATA = [
    {
        "id": "1",
        "topic": "parking",
        "content": (
            "Parking is available in lots A, B, and C near the stadium. "
            "Lot A is closest to Gate A. Arrive early to avoid congestion."
        ),
    },
    {
        "id": "2",
        "topic": "food",
        "content": (
            "Food and beverage stands are open on every concourse level. "
            "Local cuisine options include tacos, empanadas, and grilled corn."
        ),
    },
    {
        "id": "3",
        "topic": "gates",
        "content": (
            "Stadium gates open 2.5 hours before kickoff. "
            "Gate B is the main entrance for VIP and accessibility needs."
        ),
    },
    {
        "id": "4",
        "topic": "restrooms",
        "content": (
            "Restrooms are located at the end of each concourse section. "
            "Family restrooms are near Gates A and C."
        ),
    },
    {
        "id": "5",
        "topic": "seating",
        "content": (
            "All seats are assigned. Check your ticket for section, row, and seat number. "
            "Seat upgrades may be available at the Fan Services desk at Gate B."
        ),
    },
]

# ---------------------------------------------------------------------------
# Pure keyword-scoring helper (mirrors retrieve_relevant_chunks mock path)
# This lets us test the logic without the async FAISS index dependency.
# ---------------------------------------------------------------------------

def _score_chunks(query: str, metadata: list[dict]) -> list[tuple[int, str]]:
    """
    Score each chunk by keyword overlap with query.
    Mirrors the production logic: strip punctuation + remove stop-words.
    Returns sorted (score, content) pairs.
    """
    import re
    from app.services.fan_assistant import STOP_WORDS

    query_tokens = re.sub(r"[^\w\s]", "", query.lower()).split()
    query_words = {w for w in query_tokens if w not in STOP_WORDS}

    scored = [
        (
            sum(1 for w in query_words if w in chunk["content"].lower()),
            chunk["content"],
        )
        for chunk in metadata
    ]
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored


def _mock_retrieve(query: str, top_k: int = 4) -> list[str]:
    """
    Pure Python reimplementation of the mock path in retrieve_relevant_chunks.
    Uses the same MIN_MOCK_SCORE, SECONDARY_RATIO, and STOP_WORDS constants.
    """
    from app.services.fan_assistant import MIN_MOCK_SCORE, SECONDARY_RATIO

    scored = _score_chunks(query, MOCK_METADATA)
    top_score = scored[0][0] if scored else 0

    if top_score < MIN_MOCK_SCORE:
        return []

    results: list[str] = [scored[0][1]]
    secondary_threshold = top_score * SECONDARY_RATIO
    added = 1
    for score, content in scored[1:]:
        if added >= top_k:
            break
        if score >= secondary_threshold:
            results.append(content)
            added += 1
        else:
            break

    return results


# ---------------------------------------------------------------------------
# In-scope queries -- must return at least one relevant chunk
# ---------------------------------------------------------------------------

def test_parking_query_returns_chunk():
    """'Where can I park?' should surface the parking chunk."""
    results = _mock_retrieve("where can I park near the stadium")
    assert len(results) >= 1, "Expected at least one chunk for an in-scope parking question"
    assert any("parking" in r.lower() or "lot" in r.lower() for r in results), (
        f"Expected parking-related content, got: {results}"
    )


def test_food_query_returns_chunk():
    """'Is there food available?' should surface the food chunk."""
    results = _mock_retrieve("food beverage options stadium concourse")
    assert len(results) >= 1, "Expected at least one chunk for a food-related question"
    assert any("food" in r.lower() or "beverage" in r.lower() for r in results)


def test_gates_query_returns_chunk():
    """'When do the gates open?' should surface the gates chunk."""
    results = _mock_retrieve("when do the gates open")
    assert len(results) >= 1, "Expected at least one chunk for a gate-hours question"
    assert any("gate" in r.lower() or "kickoff" in r.lower() for r in results)


def test_seating_query_returns_chunk():
    """'How do I find my seat?' should surface the seating chunk."""
    results = _mock_retrieve("how do I find my seat section row")
    assert len(results) >= 1, "Expected seating info for an in-scope seating question"
    assert any("seat" in r.lower() for r in results)


def test_restroom_query_returns_chunk():
    """'Where are the restrooms?' should surface the restrooms chunk."""
    results = _mock_retrieve("where are the restrooms located")
    assert len(results) >= 1, "Expected at least one chunk for a restrooms question"
    assert any("restroom" in r.lower() for r in results)


# ---------------------------------------------------------------------------
# Out-of-scope queries -- must return an empty list
# ---------------------------------------------------------------------------

def test_meta_system_question_is_out_of_scope():
    """
    Questions about the AI system itself have no overlap with stadium knowledge.
    Retrieval must return [] so the caller issues the graceful fallback.
    """
    # Words like 'chatbot', 'llm', 'trained', 'neural', 'weights' don't appear in KB
    results = _mock_retrieve("chatbot llm neural weights trained transformer")
    assert results == [], (
        f"Meta/system question should return [] (out of scope), got: {results}"
    )


def test_chit_chat_is_out_of_scope():
    """General chit-chat with no KB-overlap words should return []."""
    results = _mock_retrieve("haha funny lol rofl joke meme")
    assert results == [], (
        f"Chit-chat should return [] (out of scope), got: {results}"
    )


def test_completely_off_topic_is_out_of_scope():
    """Clearly off-topic query (baking recipe) should return []."""
    # 'sourdough', 'bake', 'bread', 'yeast', 'flour' don't appear in stadium KB
    results = _mock_retrieve("sourdough bake yeast flour knead fermentation")
    assert results == [], (
        f"Off-topic query should return [] (out of scope), got: {results}"
    )


def test_stock_market_question_is_out_of_scope():
    """Finance/stock question has zero overlap with stadium KB -- must return []."""
    # 'stock', 'price', 'ticker', 'nasdaq', 'portfolio' don't appear in KB
    results = _mock_retrieve("stock price ticker nasdaq portfolio dividend")
    assert results == [], (
        f"Finance question should return [] (out of scope), got: {results}"
    )


def test_pure_gibberish_is_out_of_scope():
    """Random gibberish should not match any chunk."""
    results = _mock_retrieve("xkcd qwerty zzzz blorp fnord")
    assert results == [], (
        f"Gibberish should return [] (out of scope), got: {results}"
    )


# ---------------------------------------------------------------------------
# Secondary-chunk gate -- second chunk only when closely related
# ---------------------------------------------------------------------------

def test_single_keyword_match_returns_one_chunk():
    """
    A query that strongly matches only ONE chunk should not drag in a second.
    'empanadas' is very specific to the food chunk -- no other chunk has it.
    """
    results = _mock_retrieve("where can I get empanadas")
    assert len(results) == 1, (
        f"Specific single-topic query should return exactly 1 chunk, got {len(results)}: {results}"
    )
    assert "empanadas" in results[0].lower()


def test_multi_keyword_match_can_return_multiple_chunks():
    """
    A broad query touching multiple topics may legitimately pull several chunks,
    but every returned chunk must independently clear MIN_MOCK_SCORE.
    """
    from app.services.fan_assistant import MIN_MOCK_SCORE
    results = _mock_retrieve("gate entrance access seating")
    assert len(results) >= 1
    query_words = set("gate entrance access seating".lower().split())
    for chunk in results:
        score = sum(1 for w in query_words if w in chunk.lower())
        assert score >= MIN_MOCK_SCORE, (
            f"Returned chunk scored {score} < MIN_MOCK_SCORE={MIN_MOCK_SCORE}: {chunk[:60]}"
        )


def test_secondary_chunk_score_is_within_ratio():
    """
    When two chunks are returned, the second chunk's score must be >= SECONDARY_RATIO
    times the top chunk's score.
    """
    from app.services.fan_assistant import SECONDARY_RATIO
    # 'gate' matches gates, restrooms, parking, AND seating chunks -- broad enough
    # to potentially return multiple chunks.
    results = _mock_retrieve("gate B VIP entrance open")
    if len(results) >= 2:
        scored = _score_chunks("gate B VIP entrance open", MOCK_METADATA)
        top_score = scored[0][0]
        secondary_threshold = top_score * SECONDARY_RATIO
        # Verify the second returned chunk's score clears the threshold
        second_content = results[1]
        second_score = next(s for s, c in scored if c == second_content)
        assert second_score >= secondary_threshold, (
            f"Second chunk score {second_score} < threshold {secondary_threshold:.1f}"
        )


# ---------------------------------------------------------------------------
# Fallback message content (GeminiClient.chat_completion mock path)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_out_of_scope_triggers_graceful_fallback():
    """
    End-to-end check: when context_chunks=[] AND the FAISS index is loaded,
    chat_completion must return the graceful 'I don't have specific information'
    reply -- NOT the generic offline/power-saver message.
    """
    from app.core.gemini_client import GeminiClient

    client = GeminiClient()
    client.budget_guard.is_exhausted = MagicMock(return_value=False)

    mock_index = MagicMock()

    with (
        patch("app.core.config.get_settings") as mock_settings,
        patch("app.services.fan_assistant._faiss_index", mock_index),
        patch("app.services.fan_assistant._faiss_metadata", MOCK_METADATA),
    ):
        settings = MagicMock()
        settings.use_mock_gemini = True
        settings.gemini_budget_limit = 100
        mock_settings.return_value = settings

        reply = await client.chat_completion(
            system_prompt="You are StadiumMind.",
            history=[],
            user_message="what is the meaning of life",
            context_chunks=[],  # retrieval returned [] for out-of-scope query
        )

    assert "I don't have specific information" in reply, (
        f"Expected graceful fallback for OOS query, got: {reply}"
    )
    assert "Gate B" in reply or "volunteer" in reply, (
        f"Fallback should mention volunteer or Gate B, got: {reply}"
    )
    assert "power-saver" not in reply.lower(), (
        "OOS fallback should not say 'power-saver' (that's for when the index is offline)"
    )


@pytest.mark.asyncio
async def test_in_scope_does_not_trigger_fallback():
    """A clearly in-scope query must NOT produce the out-of-scope fallback message."""
    from app.core.gemini_client import GeminiClient

    client = GeminiClient()
    client.budget_guard.is_exhausted = MagicMock(return_value=False)

    with patch("app.core.config.get_settings") as mock_settings:
        settings = MagicMock()
        settings.use_mock_gemini = True
        mock_settings.return_value = settings

        parking_chunk = MOCK_METADATA[0]["content"]
        reply = await client.chat_completion(
            system_prompt="You are StadiumMind.",
            history=[],
            user_message="where do I park",
            context_chunks=[parking_chunk],
        )

    assert "I don't have specific information" not in reply, (
        f"In-scope query should NOT trigger the OOS fallback, got: {reply}"
    )
    assert "parking" in reply.lower() or "lot" in reply.lower(), (
        f"Expected parking info in reply, got: {reply}"
    )


@pytest.mark.asyncio
async def test_no_index_triggers_offline_fallback():
    """
    When the FAISS index is not loaded (None), chat_completion with empty
    context_chunks should return the generic offline/power-saver message.
    """
    from app.core.gemini_client import GeminiClient

    client = GeminiClient()
    client.budget_guard.is_exhausted = MagicMock(return_value=False)

    with (
        patch("app.core.config.get_settings") as mock_settings,
        patch("app.services.fan_assistant._faiss_index", None),
        patch("app.services.fan_assistant._faiss_metadata", []),
    ):
        settings = MagicMock()
        settings.use_mock_gemini = True
        mock_settings.return_value = settings

        reply = await client.chat_completion(
            system_prompt="You are StadiumMind.",
            history=[],
            user_message="test",
            context_chunks=[],
        )

    assert "power-saver" in reply.lower() or "offline" in reply.lower(), (
        f"When index is absent, should see offline/power-saver message, got: {reply}"
    )
    assert "I don't have specific information" not in reply, (
        "Offline fallback should not say 'I don't have specific information'"
    )

