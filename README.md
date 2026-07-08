# StadiumMind AI 🏟️

> **The Intelligent Operating System for FIFA World Cup 2026 Stadiums**
> Built for PromptWars Challenge 4 — Smart Stadiums & Tournament Operations

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Python 3.11](https://img.shields.io/badge/Python-3.11-blue)
![React 18](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-teal)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-orange)

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
