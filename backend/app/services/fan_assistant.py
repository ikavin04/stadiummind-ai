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


async def retrieve_relevant_chunks(query: str, top_k: int = 4) -> list[str]:
    """Embed query and retrieve top-k relevant knowledge chunks via FAISS."""
    global _faiss_index, _faiss_metadata

    if _faiss_index is None or not _faiss_metadata:
        logger.warning("FAISS index not available — returning empty context")
        return []

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

        # Call Gemini
        reply = await gemini_client.chat_completion(
            system_prompt=system_prompt,
            history=history,
            user_message=user_message,
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
            "conversation_id": conv.id,
            "message_id": assistant_msg.id,
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
