"""
Crowd Prediction service.
Aggregates recent readings, calls Gemini for structured predictions,
validates, persists, and broadcasts via WebSocket.
"""
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, desc
from app.core.database import AsyncSessionLocal
from app.core.gemini_client import gemini_client
from app.core.websocket_manager import ws_manager
from app.models.zone import Zone
from app.models.crowd_reading import CrowdReading
from app.models.crowd_prediction import CrowdPrediction

logger = logging.getLogger(__name__)

# Cache: zone_id -> last successful prediction (fallback if Gemini fails)
_prediction_cache: dict[str, dict] = {}


async def _get_zone(session, zone_id: str) -> Zone | None:
    result = await session.execute(select(Zone).where(Zone.id == zone_id))
    return result.scalar_one_or_none()


async def _get_recent_readings(session, zone_id: str, limit: int = 10) -> list[CrowdReading]:
    result = await session.execute(
        select(CrowdReading)
        .where(CrowdReading.zone_id == zone_id)
        .order_by(desc(CrowdReading.recorded_at))
        .limit(limit)
    )
    readings = result.scalars().all()
    return list(reversed(readings))  # chronological order


def _compute_trend(readings: list[CrowdReading]) -> str:
    if len(readings) < 2:
        return "stable"
    delta = readings[-1].current_count - readings[0].current_count
    if delta > 50:
        return "rising"
    elif delta < -50:
        return "falling"
    return "stable"


async def predict_for_zone(zone_id: str, current_count: int) -> dict | None:
    """
    Fetch zone data, call Gemini for prediction, persist and return result.
    Falls back to cached prediction on Gemini failure.
    """
    async with AsyncSessionLocal() as session:
        zone = await _get_zone(session, zone_id)
        if not zone:
            return None

        readings = await _get_recent_readings(session, zone_id, limit=10)

        # Build zone summary for Gemini
        zone_summary = {
            "zone_name": zone.name,
            "zone_type": zone.zone_type,
            "capacity": zone.capacity,
            "current_count": current_count,
            "occupancy_pct": round((current_count / zone.capacity) * 100, 1),
            "trend": _compute_trend(readings),
            "recent_readings": [
                {
                    "count": r.current_count,
                    "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
                    "occupancy_pct": round((r.current_count / zone.capacity) * 100, 1),
                }
                for r in readings
            ],
        }

        # Call Gemini
        gemini_result = await gemini_client.generate_crowd_prediction(zone_summary)

        if gemini_result is None:
            # Fallback to cache
            logger.warning(f"Gemini failed for zone {zone.name}, using cached prediction")
            cached = _prediction_cache.get(zone_id)
            if cached:
                return cached
            # Generate a simple rule-based fallback
            occ = zone_summary["occupancy_pct"]
            gemini_result = {
                "minutes_until_overcapacity": max(0, int((100 - occ) * 2)) if occ > 70 else None,
                "confidence": 0.5,
                "recommended_action": "Monitor zone carefully. AI prediction temporarily unavailable.",
                "severity": "alert" if occ > 90 else ("watch" if occ > 70 else "normal"),
            }

        # Compute predicted_overcapacity_at
        minutes = gemini_result.get("minutes_until_overcapacity")
        predicted_at = None
        if minutes is not None:
            predicted_at = datetime.now(timezone.utc) + timedelta(minutes=minutes)

        # Persist prediction
        prediction = CrowdPrediction(
            zone_id=zone_id,
            predicted_overcapacity_at=predicted_at,
            minutes_until_overcapacity=minutes,
            recommended_action=gemini_result.get("recommended_action"),
            confidence=gemini_result.get("confidence"),
            severity=gemini_result.get("severity", "normal"),
        )
        session.add(prediction)
        await session.commit()
        await session.refresh(prediction)

        result_dict = {
            "id": prediction.id,
            "zone_id": zone_id,
            "zone_name": zone.name,
            "minutes_until_overcapacity": prediction.minutes_until_overcapacity,
            "recommended_action": prediction.recommended_action,
            "confidence": float(prediction.confidence) if prediction.confidence else None,
            "severity": prediction.severity,
            "current_count": current_count,
            "occupancy_pct": zone_summary["occupancy_pct"],
            "capacity": zone.capacity,
            "created_at": prediction.created_at.isoformat() if prediction.created_at else None,
        }

        # Update cache
        _prediction_cache[zone_id] = result_dict

        return result_dict


async def run_predictions_for_updates(updates: dict[str, int]):
    """
    Called after a simulation tick. Runs predictions for each updated zone
    and broadcasts results over WebSocket.
    """
    for zone_id, count in updates.items():
        try:
            prediction = await predict_for_zone(zone_id, count)
            if prediction:
                # Broadcast to WS clients
                await ws_manager.broadcast({
                    "event_type": "crowd_update",
                    "data": prediction,
                })

                # If alert or watch, send a separate alert event
                if prediction.get("severity") in ("alert", "watch"):
                    await ws_manager.broadcast({
                        "event_type": "alert",
                        "data": {
                            "zone_id": zone_id,
                            "zone_name": prediction["zone_name"],
                            "severity": prediction["severity"],
                            "message": prediction.get("recommended_action", "Monitor this zone."),
                            "timestamp": prediction.get("created_at"),
                        },
                    })
        except Exception as e:
            logger.error(f"Prediction failed for zone {zone_id}: {e}", exc_info=True)


async def get_latest_predictions_all() -> list[dict]:
    """Return the most recent prediction for every zone."""
    from sqlalchemy import func
    async with AsyncSessionLocal() as session:
        # Subquery: max created_at per zone
        subq = (
            select(CrowdPrediction.zone_id, func.max(CrowdPrediction.created_at).label("max_created"))
            .group_by(CrowdPrediction.zone_id)
            .subquery()
        )
        result = await session.execute(
            select(CrowdPrediction, Zone.name.label("zone_name"))
            .join(subq, (CrowdPrediction.zone_id == subq.c.zone_id) & (CrowdPrediction.created_at == subq.c.max_created))
            .join(Zone, Zone.id == CrowdPrediction.zone_id)
        )
        rows = result.all()
        predictions = []
        for row in rows:
            pred = row[0]
            predictions.append({
                "id": pred.id,
                "zone_id": pred.zone_id,
                "zone_name": row[1],
                "minutes_until_overcapacity": pred.minutes_until_overcapacity,
                "recommended_action": pred.recommended_action,
                "confidence": float(pred.confidence) if pred.confidence else None,
                "severity": pred.severity,
                "created_at": pred.created_at.isoformat() if pred.created_at else None,
            })
        return predictions
