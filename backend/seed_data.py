from app.core.config import get_settings
from app.core.database import init_db, AsyncSessionLocal
from app.core.gemini_client import gemini_client
from app.models import Zone, KnowledgeChunk
from sqlalchemy import select
import asyncio
import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# Stadium zones seed data
# ─────────────────────────────────────────
ZONES = [
    {"name": "Gate A — South Entrance", "zone_type": "gate", "capacity": 3500, "latitude": 40.8136, "longitude": -74.0742},
    {"name": "Gate B — North Entrance", "zone_type": "gate", "capacity": 3500, "latitude": 40.8148, "longitude": -74.0742},
    {"name": "Gate C — East Entrance", "zone_type": "gate", "capacity": 2800, "latitude": 40.8142, "longitude": -74.0730},
    {"name": "Gate D — West Entrance", "zone_type": "gate", "capacity": 2800, "latitude": 40.8142, "longitude": -74.0754},
    {"name": "North Concourse", "zone_type": "concourse", "capacity": 8000, "latitude": 40.8150, "longitude": -74.0742},
    {"name": "South Concourse", "zone_type": "concourse", "capacity": 8000, "latitude": 40.8130, "longitude": -74.0742},
    {"name": "East Concourse", "zone_type": "concourse", "capacity": 6000, "latitude": 40.8142, "longitude": -74.0728},
    {"name": "West Concourse", "zone_type": "concourse", "capacity": 6000, "latitude": 40.8142, "longitude": -74.0756},
    {"name": "Section 100 — Lower Bowl", "zone_type": "section", "capacity": 4200, "latitude": 40.8140, "longitude": -74.0742},
    {"name": "Section 200 — Club Level", "zone_type": "section", "capacity": 3800, "latitude": 40.8141, "longitude": -74.0742},
    {"name": "Section 300 — Upper Bowl", "zone_type": "section", "capacity": 5500, "latitude": 40.8142, "longitude": -74.0742},
    {"name": "Food Court — Level 1", "zone_type": "facility", "capacity": 1200, "latitude": 40.8135, "longitude": -74.0745},
    {"name": "Medical Center", "zone_type": "facility", "capacity": 150, "latitude": 40.8138, "longitude": -74.0748},
    {"name": "Parking Lot A", "zone_type": "facility", "capacity": 5000, "latitude": 40.8120, "longitude": -74.0760},
]

# ─────────────────────────────────────────
# Knowledge base seed data (for FAISS RAG)
# ─────────────────────────────────────────
KNOWLEDGE_CHUNKS = [
    # Facilities
    {
        "topic": "facilities",
        "content": "MetLife Stadium has four main entrances: Gate A (South), Gate B (North), Gate C (East), and Gate D (West). Each gate has dedicated ticket scanning lanes. Gates open 2.5 hours before kickoff.",
    },
    {
        "topic": "facilities",
        "content": "Restrooms are located at every gate entrance and at 50-meter intervals along each concourse. Accessible restrooms with baby-changing facilities are available at the North and South Concourse hubs.",
    },
    {
        "topic": "facilities",
        "content": "The Medical Center is located near Gate A on Level 1. It is staffed by paramedics and doctors throughout the event. For emergencies, call the stadium emergency line or approach any orange-vested volunteer.",
    },
    {
        "topic": "facilities",
        "content": "Lost and Found is located at the Fan Services desk near Gate B. If you lose an item during the match, report it during the event or within 24 hours after. Items are kept for 30 days.",
    },
    {
        "topic": "facilities",
        "content": "Baby-changing stations and family restrooms are available on Level 1 near Sections 101 and 115, and on Level 2 near Section 212.",
    },
    # Seating
    {
        "topic": "seating",
        "content": "Seating sections are divided into three levels: Lower Bowl (Sections 100–150), Club Level (Sections 200–250), and Upper Bowl (Sections 300–350). Each section number corresponds to a specific area of the stadium. The first digit indicates the level.",
    },
    {
        "topic": "seating",
        "content": "If you cannot find your seat, look for the section number printed on the nearest column or overhead sign. Ushers in yellow vests are stationed at every section entrance and can direct you to your specific row and seat.",
    },
    {
        "topic": "seating",
        "content": "Accessible seating areas are located in Sections 103, 125, 203, 225, 303, and 325. Companion seating is available adjacent to each accessible position. Contact Fan Services at Gate B for assistance.",
    },
    # Food & Beverages
    {
        "topic": "food",
        "content": "Food Court on Level 1 features 24 vendors including international cuisine representing all 32 World Cup nations. Open 3 hours before kickoff until 1 hour after the final whistle. Cashless payment only — all major cards and mobile payments accepted.",
    },
    {
        "topic": "food",
        "content": "Concession stands on every concourse level offer hot dogs, burgers, pizza, nachos, pretzels, and non-alcoholic beverages. Specialty stands offer halal, kosher, vegetarian, and vegan options — look for the colored flag icons above each stand.",
    },
    {
        "topic": "food",
        "content": "Alcoholic beverages are available at designated areas on Level 1 and Level 2 for fans aged 21+ with valid ID. Alcohol service stops at 15 minutes before the end of the second half.",
    },
    {
        "topic": "food",
        "content": "Outside food and beverages are not permitted inside the stadium. One factory-sealed water bottle (up to 1 liter) per person is allowed. No outside alcohol is permitted under any circumstances.",
    },
    # Parking
    {
        "topic": "parking",
        "content": "Parking Lot A is the official FIFA World Cup parking area adjacent to the stadium. Capacity is 5,000 vehicles. Pre-purchase parking passes online — no cash parking on match day. Gates open 4 hours before kickoff.",
    },
    {
        "topic": "parking",
        "content": "Public transportation is strongly recommended. NJ Transit operates dedicated express trains to MetLife Stadium from Penn Station (New York) and Secaucus Junction, starting 3 hours before kickoff. No additional ticket required beyond the train fare.",
    },
    {
        "topic": "parking",
        "content": "Ride-share drop-off and pick-up is designated in Lot B (Yellow Zone). Follow the blue signs from the main road. Expect 20-45 minute waits after the match — consider waiting 30 minutes inside before heading to the pick-up zone.",
    },
    # Schedule & match info
    {
        "topic": "schedule",
        "content": "FIFA World Cup 2026 matches at MetLife Stadium: Kickoff times are typically 15:00, 18:00, or 21:00 local time. The stadium schedule is updated daily and displayed on the large screens at each entrance.",
    },
    {
        "topic": "schedule",
        "content": "Half-time lasts 15 minutes. Extra time (if applicable) adds two 15-minute periods. Penalty shootouts follow if scores are level after extra time in knockout rounds. Match duration including stoppages averages 100-110 minutes.",
    },
    {
        "topic": "schedule",
        "content": "Stadium gates open 2.5 hours before kickoff. The pre-match show begins 45 minutes before kickoff. Fan zones outside the stadium open 4 hours before kickoff with live music, food trucks, and interactive experiences.",
    },
    # Policy
    {
        "topic": "policy",
        "content": "Prohibited items include: professional cameras with detachable lenses, tripods, laser pointers, flares, fireworks, drones, weapons, large bags (over 12x6x12 inches), and noise-making devices other than vuvuzelas (limited).",
    },
    {
        "topic": "policy",
        "content": "FIFA's Code of Conduct applies at all times. Racist, discriminatory, or offensive behavior will result in immediate ejection from the stadium without refund, and potential legal action. Report incidents to the nearest security officer or call the fan incident hotline.",
    },
    {
        "topic": "policy",
        "content": "Bags larger than 12x6x12 inches are not permitted. Clear bags are recommended for faster security screening. Stadium security screening opens 2.5 hours before kickoff. Walk-through metal detectors and bag X-ray machines are in use at all gates.",
    },
    {
        "topic": "policy",
        "content": "Photography and video recording for personal use is permitted throughout the match. Commercial photography and broadcasting require FIFA-issued credentials. Selfie sticks are allowed but must not obstruct the view of other fans.",
    },
    # Navigation
    {
        "topic": "navigation",
        "content": "To navigate between levels: escalators and elevators are located at Gate A (Level 1-3), Gate B (Level 1-3), the North Concourse Hub (Level 1-3), and the South Concourse Hub (Level 1-3). Stairwells are at every gate and section entrance.",
    },
    {
        "topic": "navigation",
        "content": "If you are approaching from Parking Lot A or the NJ Transit Station, follow the green pathway signs to Gate A or Gate B. Fans from the bus drop-off zone should follow orange pathway signs to Gate C or Gate D.",
    },
]


async def seed():
    from app.models import user, zone, crowd_reading, crowd_prediction, conversation, knowledge_chunk  # noqa — register models

    await init_db()

    async with AsyncSessionLocal() as session:
        # Seed zones
        existing = await session.execute(select(Zone))
        if not existing.scalars().all():
            for z in ZONES:
                zone = Zone(**z)
                session.add(zone)
            await session.commit()
            print(f"[OK] Seeded {len(ZONES)} zones")
        else:
            print("[INFO] Zones already seeded")

        # Seed knowledge chunks
        existing_chunks = await session.execute(select(KnowledgeChunk))
        has_chunks = len(existing_chunks.scalars().all()) > 0
        if not has_chunks:
            for chunk in KNOWLEDGE_CHUNKS:
                kc = KnowledgeChunk(**chunk)
                session.add(kc)
            await session.commit()
            print(f"[OK] Seeded {len(KNOWLEDGE_CHUNKS)} knowledge chunks")
        else:
            print("[INFO] Knowledge chunks already seeded")

        # Build/Rebuild FAISS index if index file is missing on disk
        import os
        from app.services.fan_assistant import FAISS_INDEX_PATH
        settings = get_settings()
        if settings.gemini_api_key:
            if not os.path.exists(FAISS_INDEX_PATH):
                print("[BUILD] Rebuilding FAISS index from seeded database...")
                from app.services.fan_assistant import build_faiss_index
                await build_faiss_index()
                print("[OK] FAISS index built successfully")
            else:
                print("[INFO] FAISS index already exists on disk")
        else:
            print("[WARN] No Gemini API key — FAISS index build skipped.")

    print("\n[DONE] StadiumMind AI seed complete!")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(seed())
