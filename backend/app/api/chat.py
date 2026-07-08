"""Chat / Fan Assistant API router."""
import logging
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.conversation import Conversation, Message
from app.schemas import ChatMessageRequest, ChatMessageResponse, ChatHistoryResponse, MessageOut
from app.services import fan_assistant

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(request: ChatMessageRequest):
    """Send a message to the Fan AI Assistant and get a response."""
    try:
        result = await fan_assistant.chat(
            conversation_id=request.conversation_id,
            user_message=request.message,
            language=request.language,
            user_id=None,
        )
        return result
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Assistant unavailable. Please try again.")


@router.get("/history")
async def get_history(conversation_id: str = Query(...)):
    """Retrieve chat history for a conversation."""
    async with AsyncSessionLocal() as session:
        conv = await session.execute(select(Conversation).where(Conversation.id == conversation_id))
        conv = conv.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        msgs_result = await session.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        )
        messages = msgs_result.scalars().all()

        return {
            "conversation_id": conversation_id,
            "messages": [
                {
                    "id": m.id,
                    "conversation_id": m.conversation_id,
                    "sender": m.sender,
                    "content": m.content,
                    "original_language": m.original_language,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                }
                for m in messages
            ],
        }
