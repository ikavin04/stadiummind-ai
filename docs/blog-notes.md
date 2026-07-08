# StadiumMind AI — Technical Blog Notes

> Running log of architecture decisions, trade-offs, and challenges.
> Used to reconstruct the technical blog post on Day 10–11.

---

## Day 1 — Scaffold & Foundation

**Date:** 2026-07-08

### Architecture Decision: In-Process Simulation vs. Celery

**Decision:** Run the crowd simulation as a background `asyncio` task within FastAPI's lifespan, not as a separate Celery worker.

**Rationale:** For a competition with 11 days, adding a separate task queue (Redis + Celery) introduces significant ops overhead with minimal benefit. The async approach is perfectly capable of generating synthetic crowd readings every 15 seconds and triggering Gemini predictions in parallel. We can always swap to Celery for production.

---

### Architecture Decision: FAISS In-Process vs. Pinecone/Weaviate

**Decision:** Use FAISS CPU index loaded at startup, persisted to disk.

**Rationale:** Avoids external service cost and complexity for a competition demo. Knowledge base is small (<1000 chunks), so in-process FAISS is fast enough. We document the path to a managed vector DB in the roadmap.

---

### Architecture Decision: SQLite for local dev, PostgreSQL for prod

**Decision:** Use SQLite (via `aiosqlite`) for local development, switchable to PostgreSQL via `DATABASE_URL`.

**Rationale:** Removes the requirement for Docker/Postgres for first-run experience. Render-hosted Postgres is still the production target.

---

### Gemini Model Choice

Using `gemini-1.5-pro` for crowd prediction (structured JSON output) and `gemini-1.5-flash` for fan assistant chat (faster streaming, lower cost). Both behind the same `GeminiClient` abstraction.

---

## Challenges & Resolutions

*(Fill in as they happen)*

---

## What We'd Build Next (Roadmap Notes)

- **Indoor Navigation AI:** Computer vision + floor plan graph traversal; wayfinding via shortest path from sensor-tagged anchor points
- **Volunteer Copilot:** Role-specific task queue AI, shift coverage recommendations
- **Medical Assistant:** Symptom triage (rule-based + LLM escalation), AED/defibrillator nearest-point routing
- **Vendor Intelligence:** Real-time sales data → AI restocking recommendations per concession stand
- **Sustainability Dashboard:** Energy & water consumption telemetry + AI efficiency recommendations
- **Accessibility Assistant:** Mobility-aware indoor routing, ASL interpretation request queue
