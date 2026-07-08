"""Gemini AI client — wraps google-generativeai SDK with structured output and retry logic."""
import json
import logging
import asyncio
from typing import AsyncIterator
import google.generativeai as genai
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _init_genai():
    settings = get_settings()
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)


_init_genai()

CROWD_PREDICTION_PROMPT = """You are an AI crowd management system for a FIFA World Cup 2026 stadium.
Analyze the following zone data and predict crowd overcapacity risks.

Zone data:
{zone_summary}
"""

BATCH_CROWD_PREDICTION_PROMPT = """You are an AI crowd management system for a FIFA World Cup 2026 stadium.
Analyze the following telemetry data for multiple stadium zones and generate crowd overcapacity predictions for each zone.

Zones telemetry data:
{zones_data}
"""

FAN_ASSISTANT_SYSTEM_PROMPT = """You are StadiumMind, the official AI assistant for FIFA World Cup 2026 stadiums.
You help fans with seating, facilities, food, beverages, parking, schedules, policies, and general navigation.

Use ONLY the provided context to answer. If the answer is not in the context, say:
"I don't have that specific information right now. Please visit the nearest information kiosk or ask a volunteer — they're wearing bright orange vests!"

Be warm, enthusiastic, and concise. You're at a World Cup — fans are excited!

Context from stadium knowledge base:
{context}
"""

TRANSLATE_PROMPT = """Translate the following text to {target_language}.
Preserve any proper nouns (stadium names, gate labels like "Gate A", "Gate B", etc.) exactly as-is.
Respond with ONLY the translated text — no explanation, no quotation marks.

Text to translate:
{text}
"""


class GeminiClient:
    def __init__(self):
        settings = get_settings()
        self.prediction_model_name = settings.gemini_prediction_model
        self.chat_model_name = settings.gemini_chat_model
        self._prediction_model = None
        self._chat_model = None

    def _get_prediction_model(self):
        if self._prediction_model is None:
            self._prediction_model = genai.GenerativeModel(self.prediction_model_name)
        return self._prediction_model

    def _get_chat_model(self):
        if self._chat_model is None:
            self._chat_model = genai.GenerativeModel(self.chat_model_name)
        return self._chat_model

    async def generate_crowd_prediction(self, zone_summary: dict) -> dict | None:
        """
        Send zone data to Gemini and get a structured crowd prediction.
        Retries once on malformed JSON response. Supports USE_MOCK_GEMINI.
        """
        settings = get_settings()
        if settings.use_mock_gemini:
            import random
            occ = zone_summary.get("occupancy_pct", 50.0)
            if occ < 70.0:
                return {
                    "minutes_until_overcapacity": None,
                    "confidence": round(random.uniform(0.9, 0.99), 2),
                    "recommended_action": f"Traffic flow normal in {zone_summary.get('zone_name')}.",
                    "severity": "normal"
                }
            elif occ < 90.0:
                return {
                    "minutes_until_overcapacity": random.randint(15, 30),
                    "confidence": round(random.uniform(0.75, 0.88), 2),
                    "recommended_action": f"Staff presence increased in {zone_summary.get('zone_name')}. Monitoring flow.",
                    "severity": "watch"
                }
            else:
                return {
                    "minutes_until_overcapacity": random.randint(5, 12),
                    "confidence": round(random.uniform(0.85, 0.95), 2),
                    "recommended_action": f"Redirect traffic from {zone_summary.get('zone_name')} to adjacent areas.",
                    "severity": "alert"
                }

        from app.schemas import GeminiPredictionResponse
        prompt = CROWD_PREDICTION_PROMPT.format(zone_summary=json.dumps(zone_summary, indent=2))
        model = self._get_prediction_model()

        for attempt in range(2):
            try:
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=2048,
                        response_mime_type="application/json",
                        response_schema=GeminiPredictionResponse,
                    ),
                )
                raw = response.text.strip()
                result = json.loads(raw)
                # Validate required keys
                required = {"minutes_until_overcapacity", "confidence", "recommended_action", "severity"}
                if not required.issubset(result.keys()):
                    raise ValueError(f"Missing keys: {required - result.keys()}")
                return result
            except Exception as e:
                raw_resp = response.text if 'response' in locals() else 'None'
                logger.warning(f"Gemini prediction attempt {attempt + 1} failed: {e}. Raw response: {raw_resp}")
                if attempt == 1:
                    return None
        return None

    async def generate_crowd_predictions_batch(self, zones_data: list[dict]) -> list[dict] | None:
        """
        Send telemetry for multiple zones to Gemini in one prompt, returning a list of predictions.
        Supports USE_MOCK_GEMINI.
        """
        settings = get_settings()
        if settings.use_mock_gemini:
            import random
            mock_preds = []
            for z in zones_data:
                occ = z.get("occupancy_pct", 50.0)
                if occ < 70.0:
                    pred = {
                        "zone_id": z["zone_id"],
                        "minutes_until_overcapacity": None,
                        "confidence": round(random.uniform(0.9, 0.99), 2),
                        "recommended_action": f"Traffic flow normal in {z['zone_name']}.",
                        "severity": "normal"
                    }
                elif occ < 90.0:
                    pred = {
                        "zone_id": z["zone_id"],
                        "minutes_until_overcapacity": random.randint(15, 30),
                        "confidence": round(random.uniform(0.75, 0.88), 2),
                        "recommended_action": f"Surge alert in {z['zone_name']}. Direct flow to adjacent concourse.",
                        "severity": "watch"
                    }
                else:
                    pred = {
                        "zone_id": z["zone_id"],
                        "minutes_until_overcapacity": random.randint(5, 12),
                        "confidence": round(random.uniform(0.85, 0.95), 2),
                        "recommended_action": f"CRITICAL: Redirect traffic from {z['zone_name']} to avoid bottleneck.",
                        "severity": "alert"
                    }
                mock_preds.append(pred)
            return mock_preds

        from app.schemas import GeminiBatchPredictionResponse
        prompt = BATCH_CROWD_PREDICTION_PROMPT.format(zones_data=json.dumps(zones_data, indent=2))
        model = self._get_prediction_model()

        for attempt in range(2):
            try:
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=2048,
                        response_mime_type="application/json",
                        response_schema=GeminiBatchPredictionResponse,
                    ),
                )
                raw = response.text.strip()
                result = json.loads(raw)
                return result.get("predictions", [])
            except Exception as e:
                raw_resp = response.text if 'response' in locals() else 'None'
                logger.warning(f"Gemini batch prediction attempt {attempt + 1} failed: {e}. Raw response: {raw_resp}")
                if attempt == 1:
                    return None
        return None

    async def chat_completion(
        self,
        system_prompt: str,
        history: list[dict],
        user_message: str,
    ) -> str:
        """
        Non-streaming chat completion for fan assistant.
        Returns full response text.
        """
        model = self._get_chat_model()
        try:
            # Build conversation history for Gemini
            gemini_history = []
            for msg in history:
                role = "user" if msg["sender"] == "user" else "model"
                gemini_history.append({"role": role, "parts": [msg["content"]]})

            full_prompt = f"{system_prompt}\n\nUser question: {user_message}"
            
            if gemini_history:
                chat = model.start_chat(history=gemini_history)
                response = await asyncio.to_thread(
                    chat.send_message,
                    full_prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=1024,
                    ),
                )
            else:
                response = await asyncio.to_thread(
                    model.generate_content,
                    full_prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=1024,
                    ),
                )
            return response.text
        except Exception as e:
            logger.error(f"Gemini chat completion failed: {e}")
            return "I'm having a moment — please try again shortly! 🏟️"

    async def translate(self, text: str, target_language: str) -> str:
        """Translate text using Gemini for nuanced stadium-context translation."""
        model = self._get_chat_model()
        prompt = TRANSLATE_PROMPT.format(target_language=target_language, text=text)
        try:
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=2048,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini translation failed: {e}")
            return text  # Return original on failure

    def build_fan_assistant_prompt(self, context_chunks: list[str]) -> str:
        context = "\n\n---\n\n".join(context_chunks)
        return FAN_ASSISTANT_SYSTEM_PROMPT.format(context=context)


# Singleton
gemini_client = GeminiClient()
