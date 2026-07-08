"""Dashboard API router — summary endpoint and live WebSocket."""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy import select, func, desc
from app.core.database import get_db, AsyncSessionLocal
from app.core.websocket_manager import ws_manager
from app.models.zone import Zone
from app.models.crowd_reading import CrowdReading
from app.models.crowd_prediction import CrowdPrediction
from app.schemas import DashboardSummary, DashboardAlert
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

MATCH_INFO = {
    "match": "Brazil vs Argentina",
    "kickoff": "19:00 UTC",
    "venue": "MetLife Stadium, East Rutherford",
    "date": "2026-07-19",
    "attendance_target": 82500,
    "status": "Pre-match",
}

WEATHER = {
    "condition": "Partly Cloudy",
    "temperature_c": 24,
    "humidity_pct": 58,
    "wind_kph": 12,
    "icon": "⛅",
}


async def _get_dashboard_data() -> dict:
    async with AsyncSessionLocal() as session:
        # All zones
        zones_result = await session.execute(select(Zone))
        zones = zones_result.scalars().all()

        # Latest reading per zone
        subq = (
            select(CrowdReading.zone_id, func.max(CrowdReading.recorded_at).label("max_t"))
            .group_by(CrowdReading.zone_id)
            .subquery()
        )
        readings_result = await session.execute(
            select(CrowdReading)
            .join(subq, (CrowdReading.zone_id == subq.c.zone_id) & (CrowdReading.recorded_at == subq.c.max_t))
        )
        readings = {r.zone_id: r.current_count for r in readings_result.scalars().all()}

        # Latest prediction per zone
        pred_subq = (
            select(CrowdPrediction.zone_id, func.max(CrowdPrediction.created_at).label("max_t"))
            .group_by(CrowdPrediction.zone_id)
            .subquery()
        )
        preds_result = await session.execute(
            select(CrowdPrediction)
            .join(pred_subq, (CrowdPrediction.zone_id == pred_subq.c.zone_id) & (CrowdPrediction.created_at == pred_subq.c.max_t))
        )
        predictions = {p.zone_id: p for p in preds_result.scalars().all()}

        zones_out = []
        total_fans = 0
        alerts = []

        for zone in zones:
            count = readings.get(zone.id, 0)
            total_fans += count
            occ_pct = round((count / zone.capacity) * 100, 1) if zone.capacity else 0
            pred = predictions.get(zone.id)
            severity = pred.severity if pred else ("alert" if occ_pct > 90 else ("watch" if occ_pct > 70 else "normal"))

            zone_data = {
                "id": zone.id,
                "name": zone.name,
                "zone_type": zone.zone_type,
                "capacity": zone.capacity,
                "current_count": count,
                "occupancy_pct": occ_pct,
                "severity": severity,
                "latitude": zone.latitude,
                "longitude": zone.longitude,
                "latest_prediction": {
                    "id": pred.id,
                    "zone_id": pred.zone_id,
                    "minutes_until_overcapacity": pred.minutes_until_overcapacity,
                    "recommended_action": pred.recommended_action,
                    "confidence": float(pred.confidence) if pred.confidence else None,
                    "severity": pred.severity,
                    "created_at": pred.created_at.isoformat() if pred.created_at else None,
                } if pred else None,
            }
            zones_out.append(zone_data)

            if severity in ("alert", "watch") and pred:
                alerts.append({
                    "zone_id": zone.id,
                    "zone_name": zone.name,
                    "severity": severity,
                    "message": pred.recommended_action or f"{zone.name} is at {occ_pct}% capacity",
                    "timestamp": pred.created_at.isoformat() if pred.created_at else datetime.now(timezone.utc).isoformat(),
                })

        # Sort alerts: alert > watch
        alerts.sort(key=lambda a: 0 if a["severity"] == "alert" else 1)

        return {
            "total_zones": len(zones),
            "total_fans_inside": total_fans,
            "active_alerts": alerts,
            "zones": zones_out,
            "latest_predictions": [
                {
                    "id": p.id,
                    "zone_id": p.zone_id,
                    "minutes_until_overcapacity": p.minutes_until_overcapacity,
                    "recommended_action": p.recommended_action,
                    "confidence": float(p.confidence) if p.confidence else None,
                    "severity": p.severity,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                }
                for p in predictions.values()
            ],
            "match_info": MATCH_INFO,
            "weather": WEATHER,
        }


@router.get("/summary")
async def get_dashboard_summary():
    """Aggregated snapshot of the stadium dashboard."""
    data = await _get_dashboard_data()
    return data


@router.websocket("/live")
async def dashboard_live_ws(websocket: WebSocket):
    """WebSocket: pushes live crowd updates and alerts to connected clients."""
    await ws_manager.connect(websocket)
    try:
        # Send initial state on connect
        data = await _get_dashboard_data()
        await ws_manager.send_personal(websocket, {"event_type": "initial_state", "data": data})

        # Keep alive — receive pings
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text('{"event_type":"pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
