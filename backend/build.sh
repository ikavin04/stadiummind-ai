#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Render Build Script — StadiumMind AI Backend
#
# Render runs this once before starting the server (set as "Build Command" in
# the Render dashboard). Sequence matters:
#   1. Install Python deps
#   2. Run Alembic migrations (creates schema + enables pgcrypto)
#   3. Seed zones + knowledge chunks + rebuild FAISS index
#
# The FAISS index is intentionally NOT committed to git (see .gitignore).
# It is rebuilt from knowledge_chunks in the DB on every deploy using the
# Gemini Embedding API. Set GEMINI_API_KEY in Render env vars.
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

echo "=== [1/3] Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== [2/3] Running Alembic migrations ==="
# This creates all tables and enables the pgcrypto extension (gen_random_uuid()).
# pgcrypto is already included in 0001_initial.py — no manual setup needed.
alembic upgrade head

echo "=== [3/3] Seeding data and rebuilding FAISS index ==="
# --no-init-db flag skips init_db() since Alembic already owns the schema.
# FAISS index is only built if GEMINI_API_KEY is set (safe to skip in mock mode).
python seed_data.py --no-init-db

echo "=== Build complete — starting server ==="
