"""
Fan Assistant service — RAG pipeline using FAISS + Gemini.
Handles knowledge base embedding, retrieval, and conversation management.
"""
import logging
import os
import json
import asyncio
import numpy as np
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.gemini_client import gemini_client
from app.models.conversation import Conversation, Message
from app.models.knowledge_chunk import KnowledgeChunk
import google.generativeai as genai
from app.core.config import get_settings

logger = logging.getLogger(__name__)

FAISS_INDEX_PATH = "faiss_index/stadium.index"
FAISS_METADATA_PATH = "faiss_index/metadata.json"

# Lazy-loaded FAISS index
_faiss_index = None
_faiss_metadata: list[dict] = []  # list of {id, content, topic}


def _ensure_faiss_dir():
    os.makedirs("faiss_index", exist_ok=True)


def _get_embedding(text: str, task_type: str = "RETRIEVAL_QUERY") -> np.ndarray:
    """Get Gemini text embedding using gemini-embedding-001 with custom dimensionality."""
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type=task_type,
        output_dimensionality=768,
    )
    return np.array(result["embedding"], dtype=np.float32)


def load_faiss_index():
    """Load FAISS index from disk if it exists."""
    global _faiss_index, _faiss_metadata
    try:
        import faiss
        _ensure_faiss_dir()
        if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(FAISS_METADATA_PATH):
            _faiss_index = faiss.read_index(FAISS_INDEX_PATH)
            with open(FAISS_METADATA_PATH, "r", encoding="utf-8") as f:
                _faiss_metadata = json.load(f)
            logger.info(f"FAISS index loaded: {len(_faiss_metadata)} chunks")
        else:
            logger.info("No FAISS index found on disk — will build on first query or after seeding")
    except Exception as e:
        logger.error(f"Failed to load FAISS index: {e}")


async def build_faiss_index():
    """
    Build FAISS index from knowledge_chunks in DB.
    Embeds each chunk and saves index to disk.
    """
    import faiss
    settings = get_settings()
    if not settings.gemini_api_key:
        logger.warning("No Gemini API key — FAISS index build skipped")
        return

    _ensure_faiss_dir()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(KnowledgeChunk))
        chunks = result.scalars().all()

    if not chunks:
        logger.warning("No knowledge chunks found — FAISS index not built")
        return

    logger.info(f"Building FAISS index for {len(chunks)} chunks...")
    embeddings = []
    metadata = []

    for chunk in chunks:
        try:
            embedding = await asyncio.to_thread(_get_embedding, chunk.content, "RETRIEVAL_DOCUMENT")
            embeddings.append(embedding)
            metadata.append({
                "id": str(chunk.id),
                "content": chunk.content,
                "topic": chunk.topic,
            })
        except Exception as e:
            logger.error(f"Failed to embed chunk {chunk.id}: {e}")

    if not embeddings:
        return

    dim = len(embeddings[0])
    index = faiss.IndexFlatIP(dim)  # Inner product (cosine similarity with normalized vectors)

    # Normalize
    matrix = np.vstack(embeddings)
    faiss.normalize_L2(matrix)
    index.add(matrix)

    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(FAISS_METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f)

    global _faiss_index, _faiss_metadata
    _faiss_index = index
    _faiss_metadata = metadata
    logger.info(f"FAISS index built with {len(embeddings)} vectors (dim={dim})")


# ── Relevance thresholds for mock-mode keyword retrieval ──────────────────
# MIN_MOCK_SCORE: minimum keyword-overlap score the TOP chunk must reach for the
# query to be considered "in scope". A score of 0 means no query word appeared
# in ANY chunk → clearly out of scope → return [] so the caller can issue the
# graceful fallback instead of surfacing a random irrelevant chunk.
MIN_MOCK_SCORE: int = 1

# SECONDARY_RATIO: the second chunk is only appended when its score is at least
# this fraction of the top chunk's score. This prevents weakly-related chunks
# from being glued onto every response with "Additionally: …".
# Example: top_score=5, ratio=0.6 → second chunk must score ≥ 3.
SECONDARY_RATIO: float = 0.6

# STOP_WORDS: common English function words that appear in virtually every
# sentence. Counting them as matching keywords would give spurious scores to
# out-of-scope queries (e.g. "what is the stock price" scores 1 because "is"
# and "the" appear in stadium chunks). Filtering them before scoring means
# MIN_MOCK_SCORE=1 reliably requires at least one *content* word to match.
STOP_WORDS: frozenset[str] = frozenset({
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "i", "you", "he", "she",
    "it", "we", "they", "me", "him", "her", "us", "them", "my", "your",
    "his", "its", "our", "their", "this", "that", "these", "those",
    "what", "which", "who", "how", "when", "where", "why", "not", "no",
    "so", "if", "as", "up", "out", "about", "into", "than", "then",
    "there", "here", "get", "any", "all", "just", "like", "also",
})


async def retrieve_relevant_chunks(query: str, top_k: int = 4) -> list[str]:
    """
    Embed query and retrieve top-k relevant knowledge chunks via FAISS.

    INTENTIONAL DESIGN — Mock mode (USE_MOCK_GEMINI=true):
    --------------------------------------------------------
    In mock mode we skip the Gemini Embedding API call (which costs quota)
    and instead score chunks with simple keyword overlap. This keeps FAISS
    retrieval functional at zero cost so chat() can return context-relevant
    answers without a real API key.

    Relevance gates (mock mode only):
    • Top-match minimum  — if the best keyword-overlap score is below
      MIN_MOCK_SCORE the query is out of scope; we return [] so the
      caller issues a graceful fallback instead of a random chunk.
    • Secondary-chunk delta — the second chunk is only included when its
      score is ≥ SECONDARY_RATIO × top_score, preventing loosely-related
      chunks from being appended to every response.
    """
    global _faiss_index, _faiss_metadata

    if _faiss_index is None or not _faiss_metadata:
        logger.warning("FAISS index not available — returning empty context")
        return []

    settings = get_settings()

    # ——— Mock path: keyword-based retrieval (no Gemini API call) ———
    if settings.use_mock_gemini:
        # Strip punctuation and remove stop-words so common function words
        # ("is", "the", "at", "of" …) don't produce false-positive scores for
        # queries that share no real content words with the knowledge base.
        import re
        query_tokens = re.sub(r"[^\w\s]", "", query.lower()).split()
        query_words = {w for w in query_tokens if w not in STOP_WORDS}
        # Score each chunk by how many query words appear in it
        scored = [
            (
                sum(1 for w in query_words if w in chunk["content"].lower()),
                chunk["content"],
            )
            for chunk in _faiss_metadata
        ]
        scored.sort(key=lambda x: x[0], reverse=True)

        top_score = scored[0][0] if scored else 0

        # ── Minimum relevance gate ──────────────────────────────────────────
        # If even the best match scores below MIN_MOCK_SCORE the question is
        # genuinely out of scope for the knowledge base.  Return [] so the
        # caller can surface the graceful "I don't have info on that" reply
        # instead of a random, unrelated chunk.
        if top_score < MIN_MOCK_SCORE:
            logger.info(
                "Mock retrieval: top score %d < MIN_MOCK_SCORE %d — query is out of scope",
                top_score, MIN_MOCK_SCORE,
            )
            return []

        # ── Build result list with secondary-chunk delta gate ───────────────
        results: list[str] = [scored[0][1]]  # always include the top match

        secondary_threshold = top_score * SECONDARY_RATIO
        added = 1
        for score, content in scored[1:]:
            if added >= top_k:
                break
            if score >= secondary_threshold:
                results.append(content)
                added += 1
            else:
                # Remaining chunks are sorted descending — none will qualify
                break

        logger.info(
            "Mock retrieval: top_score=%d, threshold=%.1f → returning %d chunk(s)",
            top_score, secondary_threshold, len(results),
        )
        return results

    # ——— Real path: Gemini embedding + FAISS ANN search ———
    import faiss
    try:
        query_embedding = await asyncio.to_thread(_get_embedding, query, "RETRIEVAL_QUERY")
        query_vec = query_embedding.reshape(1, -1)
        faiss.normalize_L2(query_vec)

        distances, indices = _faiss_index.search(query_vec, top_k)
        results = []
        for idx in indices[0]:
            if 0 <= idx < len(_faiss_metadata):
                results.append(_faiss_metadata[idx]["content"])
        return results
    except Exception as e:
        logger.error(f"FAISS retrieval failed: {e}")
        return []


async def get_or_create_conversation(
    session, conversation_id: str | None, user_id: str | None, language: str
) -> Conversation:
    if conversation_id:
        result = await session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conv = result.scalar_one_or_none()
        if conv:
            return conv

    conv = Conversation(user_id=user_id, language=language)
    session.add(conv)
    await session.flush()
    return conv


async def get_conversation_history(session, conversation_id: str, limit: int = 10) -> list[dict]:
    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))
    return [{"sender": m.sender, "content": m.content} for m in messages]


async def chat(
    conversation_id: str | None,
    user_message: str,
    language: str,
    user_id: str | None = None,
) -> dict:
    """
    Full RAG pipeline:
    1. Retrieve relevant chunks via FAISS
    2. Build system prompt
    3. Call Gemini
    4. Persist messages
    5. Optionally translate response
    """
    async with AsyncSessionLocal() as session:
        # Get or create conversation
        conv = await get_or_create_conversation(session, conversation_id, user_id, language)

        # Get recent history
        history = await get_conversation_history(session, conv.id, limit=8)

        # Retrieve context
        context_chunks = await retrieve_relevant_chunks(user_message, top_k=4)

        # Build system prompt
        system_prompt = gemini_client.build_fan_assistant_prompt(context_chunks)

        # Call Gemini (or use mock path in chat_completion)
        reply = await gemini_client.chat_completion(
            system_prompt=system_prompt,
            history=history,
            user_message=user_message,
            context_chunks=context_chunks,  # passed so mock mode can format a relevant answer
        )

        # Translate if not English
        if language != "en":
            reply = await gemini_client.translate(reply, _language_name(language))

        # Persist user message
        user_msg = Message(
            conversation_id=conv.id,
            sender="user",
            content=user_message,
            original_language=language,
        )
        session.add(user_msg)

        # Persist assistant message
        assistant_msg = Message(
            conversation_id=conv.id,
            sender="assistant",
            content=reply,
            original_language=language,
        )
        session.add(assistant_msg)
        await session.commit()
        await session.refresh(assistant_msg)

        return {
            "conversation_id": str(conv.id),
            "message_id": str(assistant_msg.id),
            "reply": reply,
            "language": language,
        }


def _language_name(code: str) -> str:
    names = {
        "es": "Spanish",
        "fr": "French",
        "hi": "Hindi",
        "ar": "Arabic",
        "pt": "Portuguese",
        "en": "English",
    }
    return names.get(code, code)
