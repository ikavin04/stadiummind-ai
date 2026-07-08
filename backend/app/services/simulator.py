"""
Crowd simulation service.
Runs as a background asyncio task, generates synthetic crowd readings
using a random walk + time-of-day multiplier, then triggers crowd prediction.
"""
import asyncio
import logging
import random
from datetime import datetime, timezone
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.config import get_settings
from app.models.zone import Zone
from app.models.crowd_reading import CrowdReading

logger = logging.getLogger(__name__)

# Zone state: zone_id -> current simulated count
_zone_state: dict[str, int] = {}
_running = False


def _time_of_day_multiplier() -> float:
    """
    Return a crowd multiplier based on time of day.
    Pre-match (kick-off ~18:00): high surge. Half-time: moderate surge.
    """
    hour = datetime.now(timezone.utc).hour
    # Simulate UTC match scenario: peak at 17-19h UTC (local evening kickoff)
    if 15 <= hour <= 20:
        return random.uniform(1.2, 1.6)
    elif 21 <= hour <= 23:
        return random.uniform(0.8, 1.1)
    else:
        return random.uniform(0.4, 0.7)


async def _load_zones() -> list[Zone]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Zone))
        return result.scalars().all()


async def _write_reading(zone_id: str, count: int):
    async with AsyncSessionLocal() as session:
        reading = CrowdReading(zone_id=zone_id, current_count=count)
        session.add(reading)
        await session.commit()


async def tick_once() -> dict[str, int]:
    """
    Advance the simulation by one tick.
    Returns dict of zone_id -> new_count.
    """
    zones = await _load_zones()
    if not zones:
        return {}

    multiplier = _time_of_day_multiplier()
    updates = {}

    for zone in zones:
        if zone.id not in _zone_state:
            # Initialize to 30-50% capacity
            _zone_state[zone.id] = int(zone.capacity * random.uniform(0.3, 0.5))

        current = _zone_state[zone.id]

        # Random walk: ±5% of capacity per tick, biased by time multiplier
        delta_pct = random.gauss(0.02 * (multiplier - 1.0), 0.04)
        delta = int(zone.capacity * delta_pct)
        new_count = max(0, min(zone.capacity + 200, current + delta))

        _zone_state[zone.id] = new_count
        updates[zone.id] = new_count
        await _write_reading(zone.id, new_count)

    logger.debug(f"Simulation tick complete: {len(updates)} zones updated")
    return updates


async def run_simulation():
    """
    Continuous background simulation loop.
    Runs a tick every SIMULATION_INTERVAL_SECONDS, then triggers predictions.
    """
    global _running
    _running = True
    settings = get_settings()
    interval = settings.simulation_interval_seconds

    logger.info(f"Crowd simulation started (interval: {interval}s)")

    # Give DB a moment to initialize
    await asyncio.sleep(3)

    while _running:
        try:
            updates = await tick_once()
            if updates:
                # Import here to avoid circular imports at module level
                from app.services.crowd_predictor import run_local_updates_for_simulation
                await run_local_updates_for_simulation(updates)
        except Exception as e:
            logger.error(f"Simulation tick error: {e}", exc_info=True)

        await asyncio.sleep(interval)


def stop_simulation():
    global _running
    _running = False
