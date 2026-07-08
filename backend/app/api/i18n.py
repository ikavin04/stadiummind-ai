"""Multi-language translation API router."""
import logging
from fastapi import APIRouter, HTTPException
from app.core.gemini_client import gemini_client
from app.schemas import TranslateRequest, TranslateResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/i18n", tags=["i18n"])

LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "hi": "Hindi",
    "ar": "Arabic",
    "pt": "Portuguese",
}

SUPPORTED_LANGUAGES = list(LANGUAGE_NAMES.keys())


@router.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """Translate text to the target language using Gemini."""
    if request.target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {SUPPORTED_LANGUAGES}",
        )

    if request.target_language == "en":
        # No translation needed
        return TranslateResponse(
            original=request.text,
            translated=request.text,
            target_language="en",
        )

    language_name = LANGUAGE_NAMES[request.target_language]
    translated = await gemini_client.translate(request.text, language_name)

    return TranslateResponse(
        original=request.text,
        translated=translated,
        target_language=request.target_language,
    )


@router.get("/languages")
async def get_supported_languages():
    """Return list of supported languages."""
    return [{"code": code, "name": name} for code, name in LANGUAGE_NAMES.items()]
