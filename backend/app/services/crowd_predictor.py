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

        occupancy_pct = zone_summary["occupancy_pct"]
        trend = zone_summary["trend"]

        # Smart Rate-Limit Guard: If occupancy is normal (< 70%) and not rising, skip Gemini call
        if occupancy_pct < 70.0 and trend != "rising":
            gemini_result = {
                "minutes_until_overcapacity": None,
                "confidence": 1.0,
                "recommended_action": "Traffic flow is normal. Standard monitoring in progress.",
                "severity": "normal"
            }
        else:
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


import uuid

async def predict_for_zones_batch(updates: dict[str, int]) -> list[dict]:
    """
    Predict for multiple zones at once by batching Gemini calls.
    Returns list of prediction result dicts. Supports USE_MOCK_GEMINI.
    """
    if not updates:
        return []

    async with AsyncSessionLocal() as session:
        # Fetch all relevant zones
        result = await session.execute(select(Zone).where(Zone.id.in_([uuid.UUID(k) if isinstance(k, str) else k for k in updates.keys()])))
        zones = {str(z.id): z for z in result.scalars().all()}

        predictions_to_save = {}  # zone_id -> prediction_data (dict)
        gemini_batch_input = []   # list of summaries to send to Gemini

        for zone_id, current_count in updates.items():
            zone = zones.get(zone_id)
            if not zone:
                continue

            readings = await _get_recent_readings(session, zone_id, limit=10)
            occupancy_pct = round((current_count / zone.capacity) * 100, 1)
            trend = _compute_trend(readings)

            # Format recent readings with count and minutes_ago
            recent_readings_formatted = []
            for r in readings:
                minutes_ago = int((datetime.now(timezone.utc) - r.recorded_at).total_seconds() / 60) if r.recorded_at else 0
                recent_readings_formatted.append({
                    "count": r.current_count,
                    "minutes_ago": max(0, minutes_ago)
                })

            zone_summary = {
                "zone_id": zone_id,
                "zone_name": zone.name,
                "capacity": zone.capacity,
                "recent_readings": recent_readings_formatted,
            }

            # Smart Rate-Limit Guard: Low occupancy and stable trend -> local prediction directly
            if occupancy_pct < 70.0 and trend != "rising":
                predictions_to_save[zone_id] = {
                    "minutes_until_overcapacity": None,
                    "confidence": 1.0,
                    "recommended_action": f"Traffic flow normal in {zone.name}.",
                    "severity": "normal",
                    "current_count": current_count,
                    "occupancy_pct": occupancy_pct,
                    "zone_name": zone.name,
                    "capacity": zone.capacity,
                }
            else:
                gemini_batch_input.append(zone_summary)

        # Execute Gemini batch call
        gemini_predictions = []
        if gemini_batch_input:
            batch_result = await gemini_client.generate_crowd_predictions_batch(gemini_batch_input)
            if batch_result:
                gemini_predictions = batch_result

        # Map Gemini predictions by zone_id
        gemini_by_zone = {p["zone_id"]: p for p in gemini_predictions if "zone_id" in p}

        for item in gemini_batch_input:
            zone_id = item["zone_id"]
            zone = zones[zone_id]
            current_count = updates[zone_id]
            occupancy_pct = round((current_count / zone.capacity) * 100, 1)

            gemini_res = gemini_by_zone.get(zone_id)
            if gemini_res is None:
                # Fallback to cache/rule-based
                logger.warning(f"Gemini batch prediction missing/failed for zone {zone.name}, using cache/rule-based fallback")
                cached = _prediction_cache.get(zone_id)
                if cached:
                    predictions_to_save[zone_id] = cached
                    continue
                # Rule-based fallback
                gemini_res = {
                    "minutes_until_overcapacity": max(0, int((100 - occupancy_pct) * 2)) if occupancy_pct > 70 else None,
                    "confidence": 0.5,
                    "recommended_action": "Monitor zone carefully. AI prediction temporarily unavailable.",
                    "severity": "alert" if occupancy_pct > 90 else ("watch" if occupancy_pct > 70 else "normal"),
                }

            predictions_to_save[zone_id] = {
                "minutes_until_overcapacity": gemini_res.get("minutes_until_overcapacity"),
                "confidence": gemini_res.get("confidence", 0.8),
                "recommended_action": gemini_res.get("recommended_action"),
                "severity": gemini_res.get("severity", "normal"),
                "current_count": current_count,
                "occupancy_pct": occupancy_pct,
                "zone_name": zone.name,
                "capacity": zone.capacity,
            }

        # Persist all predictions
        results = []
        for zone_id, pred_data in predictions_to_save.items():
            minutes = pred_data.get("minutes_until_overcapacity")
            predicted_at = None
            if minutes is not None:
                predicted_at = datetime.now(timezone.utc) + timedelta(minutes=minutes)

            prediction = CrowdPrediction(
                zone_id=uuid.UUID(zone_id) if isinstance(zone_id, str) else zone_id,
                predicted_overcapacity_at=predicted_at,
                minutes_until_overcapacity=minutes,
                recommended_action=pred_data.get("recommended_action"),
                confidence=pred_data.get("confidence"),
                severity=pred_data.get("severity", "normal"),
            )
            session.add(prediction)
            await session.flush()

            result_dict = {
                "id": str(prediction.id),
                "zone_id": zone_id,
                "zone_name": pred_data["zone_name"],
                "minutes_until_overcapacity": prediction.minutes_until_overcapacity,
                "recommended_action": prediction.recommended_action,
                "confidence": float(prediction.confidence) if prediction.confidence else None,
                "severity": prediction.severity,
                "current_count": pred_data["current_count"],
                "occupancy_pct": pred_data["occupancy_pct"],
                "capacity": pred_data["capacity"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            _prediction_cache[zone_id] = result_dict
            results.append(result_dict)

        await session.commit()
        return results


async def run_predictions_for_updates(updates: dict[str, int]):
    """
    Called after a simulation tick. Runs batched predictions for all updated zones
    and broadcasts results over WebSocket.
    """
    try:
        predictions = await predict_for_zones_batch(updates)
        for prediction in predictions:
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
                        "zone_id": prediction["zone_id"],
                        "zone_name": prediction["zone_name"],
                        "severity": prediction["severity"],
                        "message": prediction.get("recommended_action", "Monitor this zone."),
                        "timestamp": prediction.get("created_at"),
                    },
                })
    except Exception as e:
        logger.error(f"Batch prediction run failed: {e}", exc_info=True)


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


async def run_local_updates_for_simulation(updates: dict[str, int]):
    """
    Called during the background simulation tick. Broadcasts new zone counts,
    occupancies, and severities, but does NOT trigger Gemini or save new predictions.
    """
    async with AsyncSessionLocal() as session:
        # Fetch relevant zones
        result = await session.execute(select(Zone).where(Zone.id.in_([uuid.UUID(k) if isinstance(k, str) else k for k in updates.keys()])))
        zones = {str(z.id): z for z in result.scalars().all()}

        for zone_id, current_count in updates.items():
            zone = zones.get(zone_id)
            if not zone:
                continue

            occupancy_pct = round((current_count / zone.capacity) * 100, 1)
            cached = _prediction_cache.get(zone_id)
            
            # Local rule-based severity evaluation for simulation counts
            severity = "alert" if occupancy_pct > 90 else ("watch" if occupancy_pct > 70 else "normal")

            payload = {
                "id": cached.get("id") if cached else str(uuid.uuid4()),
                "zone_id": zone_id,
                "zone_name": zone.name,
                "minutes_until_overcapacity": cached.get("minutes_until_overcapacity") if cached else None,
                "recommended_action": cached.get("recommended_action") if cached else f"Traffic flow normal in {zone.name}.",
                "confidence": cached.get("confidence") if cached else 1.0,
                "severity": severity,
                "current_count": current_count,
                "occupancy_pct": occupancy_pct,
                "capacity": zone.capacity,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            # Broadcast
            await ws_manager.broadcast({
                "event_type": "crowd_update",
                "data": payload,
            })
