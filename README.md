# StadiumMind AI 🏟️

> **The Intelligent Operating System for FIFA World Cup 2026 Stadiums**
> Built for PromptWars Challenge 4 — Smart Stadiums & Tournament Operations

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue)
![React 18](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal)
![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-orange)

---

## What Is StadiumMind AI?

StadiumMind AI is a unified AI-powered command-center platform that serves stadium managers, security teams, medical staff, volunteers, and fans during FIFA World Cup 2026. It provides:

| Module | Description |
|--------|-------------|
| 🏟️ **Operations Dashboard** | Live crowd data, AI alerts, zone occupancy — role-specific views per staff type |
| 🧠 **Crowd Prediction AI** | Gemini-powered forecasting of overcapacity events with recommended actions |
| 💬 **Fan AI Assistant** | RAG-powered conversational assistant (FAISS + Gemini) for seating, facilities, food, parking |
| 🌍 **Multi-language Layer** | Real-time translation via Gemini in EN, ES, FR, HI, AR, PT |

---

## Architecture

```
React 18 + TypeScript + Tailwind CSS (Vercel)
         │ REST + WebSocket
FastAPI + Python 3.10 (Render)
    ├── PostgreSQL 15 (ops data, chat history)
    ├── Google Gemini 2.5 Flash (crowd prediction, chat, translation)
    ├── FAISS (vector retrieval for Fan Assistant RAG)
    └── Firebase Auth (production) / Demo JWT (development)
```

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15 (or Docker)
- A Google Gemini API key (free tier works with budget guard)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/your-username/stadiummind-ai.git
cd stadiummind-ai

# Backend
cd backend
cp .env.example .env
# Edit .env — add GEMINI_API_KEY at minimum
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```

### 2. Start PostgreSQL (via Docker)

```bash
docker-compose up db -d
```

### 3. Run Database Migrations & Seed Data

```bash
cd backend
alembic upgrade head
python seed_data.py   # seeds zones, knowledge chunks, and FAISS index
```

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend API docs: http://localhost:8000/docs

---

## Gemini AI — Mock Mode vs Real Mode

StadiumMind uses a `USE_MOCK_GEMINI` flag to control whether real Gemini API calls are made. This is an **intentional design choice** for quota management during development.

### Mock Mode (`USE_MOCK_GEMINI=true`) — default
- **Crowd predictions**: Generated from occupancy thresholds with realistic random confidence scores. No API call.
- **Fan Assistant chat**: FAISS vector retrieval still runs (keyword-based scoring, zero cost), and the top retrieved knowledge chunks are returned directly as the answer — so responses are **question-relevant**, not a static placeholder.
- **Translation**: Returns original text unchanged.

### Real Mode (`USE_MOCK_GEMINI=false`)
- **Crowd predictions**: Gemini 2.5 Flash analyzes zone telemetry and returns severity, confidence, and recommended action.
- **Fan Assistant chat**: Full RAG pipeline — FAISS retrieval with Gemini embeddings + Gemini chat completion for natural language answers.
- **Translation**: Gemini translates with stadium-context awareness (preserves gate labels, proper nouns).

### To Enable Real Gemini
```bash
# In backend/.env
USE_MOCK_GEMINI=false
GEMINI_API_KEY=your_key_here
```

### Budget Guard
A daily call counter (`gemini_call_budget.json`) limits API calls to `GEMINI_BUDGET_LIMIT` per day (default: 15). When exhausted, the system automatically falls back to mock mode. Check usage at:
```
GET http://localhost:8000/api/admin/gemini-usage
```

---

## User Roles

Five roles are defined, each with a distinct dashboard view:

| Role | Login ID | What They See |
|------|----------|---------------|
| **Stadium Manager** | `manager` | Full ops: all zones, crowd stats, alerts, match info, weather, simulate-tick |
| **Security** | `security` | Crowd monitoring, gate alerts, incident tracking, zone occupancy |
| **Medical Staff** | `medical` | Incident alerts, zone monitoring, emergency coordination view |
| **Volunteer** | `volunteer` | Task assignments, Fan Assistant access, zone status overview |
| **Fan** | `fan` | Fan Hub (hero + match info + quick AI queries) → Fan Assistant chat |

Fans are routed to `/fan-hub`; all staff roles go to `/dashboard`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (asyncpg dialect) |
| `GEMINI_API_KEY` | ✅ for real mode | Google Gemini API key |
| `GEMINI_PREDICTION_MODEL` | optional | Default: `gemini-2.5-flash` |
| `GEMINI_CHAT_MODEL` | optional | Default: `gemini-2.5-flash` |
| `USE_MOCK_GEMINI` | optional | `true` (default) or `false` |
| `GEMINI_BUDGET_LIMIT` | optional | Daily API call cap (default: `15`) |
| `FIREBASE_PROJECT_ID` | optional | Enables Firebase auth; omit for demo mode |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | optional | Path to service account JSON |
| `SECRET_KEY` | ✅ | Random secret for JWT signing |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins (include your Vercel URL) |
| `SIMULATION_INTERVAL_SECONDS` | optional | Crowd sim tick interval (default: `60`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend HTTP URL (e.g. `https://your-app.onrender.com`) |
| `VITE_WS_BASE_URL` | Backend WebSocket URL — **must use `wss://` in production over HTTPS** |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## Deployment

### Frontend → Vercel
1. Connect `frontend/` directory in Vercel dashboard
2. Set all `VITE_*` environment variables — point `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` to your Render backend URL
3. **Important**: Use `wss://` (not `ws://`) for `VITE_WS_BASE_URL` in production

### Backend → Render
1. Connect `backend/` directory, set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. Set all environment variables listed above
3. Add `CORS_ORIGINS` including your Vercel frontend URL
4. **FAISS index**: The `faiss_index/` folder must be present. Either commit it to the repo or run `python seed_data.py` as a build command on Render.

### Database → Render Managed Postgres or Supabase
- Run `alembic upgrade head` as a deploy hook
- Run `python seed_data.py` once after first deploy to seed zones and FAISS knowledge base

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| State | React Query (server), Zustand (UI) |
| Charts | Recharts |
| Backend | Python 3.10+, FastAPI, Uvicorn |
| Database | PostgreSQL 15, SQLAlchemy (async), Alembic |
| AI | Google Gemini 2.5 Flash |
| Vector Search | FAISS (IndexFlatIP, 768-dim embeddings) |
| Auth | Firebase Authentication (demo mode available without Firebase) |
| Realtime | WebSockets (FastAPI native) |

---

## License

MIT — see [LICENSE](LICENSE)


---

## What Is StadiumMind AI?

StadiumMind AI is a unified AI-powered command-center platform that serves stadium managers, security teams, medical staff, volunteers, and fans during FIFA World Cup 2026. It provides:

| Module | Description |
|--------|-------------|
| 🏟️ **Operations Dashboard** | Live crowd data, AI alerts, zone occupancy heatmaps |
| 🧠 **Crowd Prediction AI** | Gemini-powered forecasting of overcapacity events with recommended actions |
| 💬 **Fan AI Assistant** | RAG-powered conversational assistant (seating, facilities, food, parking) |
| 🌍 **Multi-language Layer** | Real-time translation in EN, ES, FR, HI, AR, PT |

---

## Architecture

```
React 18 + TypeScript + Tailwind (Vercel)
         │ REST + WebSocket
FastAPI + Python 3.11 (Render)
    ├── PostgreSQL 15 (ops data)
    ├── Google Gemini API (AI reasoning)
    ├── FAISS (vector retrieval for Fan Assistant)
    └── Firebase Auth
```

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15 (or Docker)
- A Google Gemini API key
- A Firebase project with Auth enabled

### 1. Clone & Setup Environment

```bash
git clone https://github.com/your-username/stadiummind-ai.git
cd stadiummind-ai

# Backend
cd backend
cp .env.example .env
# Edit .env with your API keys
pip install -r requirements.txt

# Frontend
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your Firebase config
npm install
```

### 2. Start PostgreSQL (via Docker)

```bash
# From repo root
docker-compose up db -d
```

### 3. Run Database Migrations & Seed Data

```bash
cd backend
alembic upgrade head
python seed_data.py
```

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend API docs: http://localhost:8000/docs

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql+asyncpg://stadiummind:stadiummind_dev@localhost:5432/stadiummind
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
SECRET_KEY=your_random_secret_key
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
SIMULATION_INTERVAL_SECONDS=15
```

### Frontend (`frontend/.env.local`)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Deployment

- **Frontend:** Deploy `frontend/` to [Vercel](https://vercel.com) — set `VITE_*` env vars in Vercel dashboard
- **Backend:** Deploy `backend/` to [Render](https://render.com) — set all env vars in Render environment
- **Database:** Use Render Managed Postgres or [Supabase](https://supabase.com)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| State | React Query (server), Zustand (UI) |
| Charts | Recharts |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | PostgreSQL 15, SQLAlchemy, Alembic |
| AI | Google Gemini API (gemini-1.5-pro) |
| Vector Search | FAISS |
| Auth | Firebase Authentication |
| Realtime | WebSockets (FastAPI native) |

---

## Project Structure

```
stadiummind-ai/
├── frontend/src/
│   ├── components/      # GlassCard, AlertCard, CrowdChart, ChatBubble, etc.
│   ├── pages/           # Dashboard, FanAssistant, Login, CrowdDetail
│   ├── hooks/           # useDashboardSocket, useChat, useAuth
│   ├── lib/             # api, firebase, i18n
│   └── types/           # TypeScript interfaces
├── backend/app/
│   ├── api/             # FastAPI routers
│   ├── core/            # Config, Gemini client, WebSocket manager
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   └── services/        # Simulator, crowd predictor, fan assistant
└── docs/
    ├── MDD.md
    └── blog-notes.md
```

---

## License

MIT — see [LICENSE](LICENSE)
