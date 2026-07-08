"""Pydantic schemas for all API request/response models."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────
# Zone / Crowd schemas
# ─────────────────────────────────────────

class ZoneBase(BaseModel):
    id: str
    name: str
    zone_type: str
    capacity: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = {"from_attributes": True}


class ZoneWithOccupancy(ZoneBase):
    current_count: int = 0
    occupancy_pct: float = 0.0
    severity: str = "normal"  # normal|watch|alert
    latest_prediction: Optional["CrowdPredictionOut"] = None


class CrowdReadingOut(BaseModel):
    id: str
    zone_id: str
    current_count: int
    recorded_at: datetime

    model_config = {"from_attributes": True}


class CrowdPredictionOut(BaseModel):
    id: str
    zone_id: str
    zone_name: Optional[str] = None
    minutes_until_overcapacity: Optional[int] = None
    recommended_action: Optional[str] = None
    confidence: Optional[float] = None
    severity: str = "normal"
    created_at: datetime

    model_config = {"from_attributes": True}


# Pydantic model for Gemini's structured output
class GeminiPredictionResponse(BaseModel):
    minutes_until_overcapacity: Optional[int] = None
    confidence: float = Field(ge=0.0, le=1.0)
    recommended_action: str
    severity: str = "normal"


# ─────────────────────────────────────────
# Dashboard schemas
# ─────────────────────────────────────────

class DashboardAlert(BaseModel):
    zone_id: str
    zone_name: str
    severity: str
    message: str
    timestamp: datetime


class DashboardSummary(BaseModel):
    total_zones: int
    total_fans_inside: int
    active_alerts: list[DashboardAlert]
    zones: list[ZoneWithOccupancy]
    latest_predictions: list[CrowdPredictionOut]
    match_info: dict
    weather: dict


# ─────────────────────────────────────────
# Chat / Fan Assistant schemas
# ─────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    language: str = "en"


class ChatMessageResponse(BaseModel):
    conversation_id: str
    message_id: str
    reply: str
    language: str


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    original_language: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    conversation_id: str
    messages: list[MessageOut]


# ─────────────────────────────────────────
# i18n schemas
# ─────────────────────────────────────────

class TranslateRequest(BaseModel):
    text: str
    target_language: str  # e.g. "es", "fr", "hi", "ar", "pt"


class TranslateResponse(BaseModel):
    original: str
    translated: str
    target_language: str


# ─────────────────────────────────────────
# Auth schemas
# ─────────────────────────────────────────

class AuthSyncRequest(BaseModel):
    firebase_uid: str
    email: str
    display_name: Optional[str] = None


class AuthSyncResponse(BaseModel):
    user_id: str
    role: str
    email: str
    display_name: Optional[str]
    dashboard_config: dict


# ─────────────────────────────────────────
# WebSocket event schemas
# ─────────────────────────────────────────

class WSEvent(BaseModel):
    event_type: str  # "crowd_update" | "new_prediction" | "alert" | "ping"
    data: dict


# Allow forward references
ZoneWithOccupancy.model_rebuild()
