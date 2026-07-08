"""Crowd API router — zones, predictions, simulation trigger."""
import logging
from fastapi import APIRouter, Query, HTTPException
from sqlalchemy import select, desc, func
from app.core.database import AsyncSessionLocal
from app.models.zone import Zone
from app.models.crowd_reading import CrowdReading
from app.models.crowd_prediction import CrowdPrediction

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/crowd", tags=["crowd"])


@router.get("/zones")
async def get_zones():
    """List all zones with current occupancy percentage."""
    async with AsyncSessionLocal() as session:
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

        result = []
        for z in zones:
            count = readings.get(z.id, 0)
            occ = round((count / z.capacity) * 100, 1) if z.capacity else 0
            result.append({
                "id": z.id,
                "name": z.name,
                "zone_type": z.zone_type,
                "capacity": z.capacity,
                "current_count": count,
                "occupancy_pct": occ,
                "severity": "alert" if occ > 90 else ("watch" if occ > 70 else "normal"),
                "latitude": z.latitude,
                "longitude": z.longitude,
            })
        return result


@router.get("/predictions")
async def get_predictions(zone_id: str | None = Query(None), limit: int = Query(10)):
    """Latest prediction(s) for a zone or all zones."""
    async with AsyncSessionLocal() as session:
        q = select(CrowdPrediction, Zone.name.label("zone_name")).join(Zone, Zone.id == CrowdPrediction.zone_id)
        if zone_id:
            q = q.where(CrowdPrediction.zone_id == zone_id)
        q = q.order_by(desc(CrowdPrediction.created_at)).limit(limit)
        result = await session.execute(q)
        rows = result.all()

        return [
            {
                "id": row[0].id,
                "zone_id": row[0].zone_id,
                "zone_name": row[1],
                "minutes_until_overcapacity": row[0].minutes_until_overcapacity,
                "recommended_action": row[0].recommended_action,
                "confidence": float(row[0].confidence) if row[0].confidence else None,
                "severity": row[0].severity,
                "created_at": row[0].created_at.isoformat() if row[0].created_at else None,
            }
            for row in rows
        ]


@router.get("/history")
async def get_zone_history(zone_id: str, limit: int = Query(50)):
    """Get historical crowd readings for a zone (for chart rendering)."""
    async with AsyncSessionLocal() as session:
        zone_result = await session.execute(select(Zone).where(Zone.id == zone_id))
        zone = zone_result.scalar_one_or_none()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")

        readings_result = await session.execute(
            select(CrowdReading)
            .where(CrowdReading.zone_id == zone_id)
            .order_by(desc(CrowdReading.recorded_at))
            .limit(limit)
        )
        readings = list(reversed(readings_result.scalars().all()))

        return {
            "zone_id": zone_id,
            "zone_name": zone.name,
            "capacity": zone.capacity,
            "readings": [
                {
                    "count": r.current_count,
                    "occupancy_pct": round((r.current_count / zone.capacity) * 100, 1),
                    "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
                }
                for r in readings
            ],
        }


@router.post("/simulate-tick")
async def manual_simulate_tick():
    """
    Demo/dev endpoint: manually advance simulation by one tick and trigger predictions.
    """
    try:
        from app.services.simulator import tick_once
        from app.services.crowd_predictor import run_predictions_for_updates
        updates = await tick_once()
        await run_predictions_for_updates(updates)
        return {"status": "ok", "zones_updated": len(updates)}
    except Exception as e:
        logger.error(f"Manual tick failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
