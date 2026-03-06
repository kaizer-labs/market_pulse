# Financial Market Intelligence Platform

A personalized market intelligence platform that connects a user portfolio/watchlist with market data, relevant news, and a structured daily brief.

## Repository Structure

- `frontend/`: Next.js (TypeScript + Tailwind)
- `backend/`: FastAPI (Python + SQLAlchemy)
- `docs/`: architecture and design notes
- `scripts/`: helper scripts for setup/seed/maintenance

## Ticket Progress

Completed in this workspace:
- `T0.1` Monorepo scaffold
- `T0.2` Docker Compose setup
- `T0.3` Environment configuration
- `T1.1` Database models + schema creation + seed script
- `T1.2` Portfolio/Position CRUD API
- `T1.3` Provider interfaces + mock adapters
- `T2.1` Mock market data provider + chart endpoint
- `T2.2` Mock news provider + grouped ticker payloads
- `T2.3` Portfolio news endpoint
- `T3.1` Brief generation service logic (mock/structured)
- `T3.2` Daily brief generate/fetch API
- `T4.2` Portfolio management UI (create/edit/delete positions)
- `T4.3` Portfolio summary dashboard
- `T4.4` Relevant news section
- `T4.5` Daily brief panel + regenerate
- `T4.6` Interactive chart mode

## Prerequisites

- Docker + Docker Compose
- (Optional for non-Docker local runs)
  - Node.js 20+
  - Python 3.11+

## Environment Setup

1. Copy example env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Start all services:

```bash
docker compose up --build
```

3. Seed demo data:

```bash
docker compose exec backend python -m scripts.seed_demo
```

4. Open apps:

- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`
- Backend health: `http://localhost:8000/health`

## Run Frontend Independently

```bash
cd frontend
npm install
npm run dev
```

## Run Backend Independently

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
python -m scripts.seed_demo
```

## Core Environment Variables

### Backend (`backend/.env`)

- `DATABASE_URL`: PostgreSQL SQLAlchemy URL
- `LLM_PROVIDER`: defaults to `mock`
- `LLM_API_KEY`: optional
- `MARKET_DATA_PROVIDER`: defaults to `mock`
- `NEWS_PROVIDER`: defaults to `mock`

### Frontend (`frontend/.env`)

- `NEXT_PUBLIC_API_BASE_URL`: backend URL, default `http://localhost:8000`

## Implemented Backend API (Current)

### Portfolio
- `GET /portfolios`
- `POST /portfolios`
- `GET /portfolios/{id}`
- `PUT /portfolios/{id}`
- `DELETE /portfolios/{id}`

### Positions
- `POST /portfolios/{id}/positions`
- `PUT /positions/{id}`
- `DELETE /positions/{id}`

### Health / Infra
- `GET /health`
- `GET /health/db`
- `GET /providers/status`
- `POST /users/bootstrap-demo`

### Intelligence
- `GET /charts/{ticker}?range=1D|1W|1M|3M|1Y`
- `GET /portfolios/{id}/news`
- `GET /portfolios/{id}/brief`
- `POST /portfolios/{id}/brief/generate`

## Current Frontend Experience

- Portfolio creation and selection
- Position add/edit/delete
- Summary cards: total value, daily P/L, daily %
- Relevant news grouped by ticker
- Daily brief retrieval/generation
- Interactive ticker chart with selectable ranges
- Allocation visualization

## Notes

- App currently defaults to deterministic mock providers so it runs without external API keys.
- Use `docker compose down -v` to reset local database state.
- Remaining major scope is UI polish, stronger testing, and migration tooling.
