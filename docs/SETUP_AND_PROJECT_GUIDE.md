# Setup and Project Reading Guide

## 1) What This Project Is

Financial Market Intelligence Platform is a monorepo with:
- `frontend/`: Next.js UI
- `backend/`: FastAPI API + SQLAlchemy models
- `docs/`: architecture and setup docs
- `scripts/`: helper scripts

## 2) How To Read the Project (Suggested Order)

1. `README.md`
- High-level setup and ticket progress.

2. `docs/architecture.md`
- Service/module boundaries and data model overview.

3. Backend entrypoint
- `backend/app/main.py`
- See app startup, router registration, and schema bootstrap.

4. Backend domain + API
- `backend/app/models.py` (DB models)
- `backend/app/api/portfolios.py` (portfolio/position CRUD)
- `backend/app/api/health.py` and `backend/app/api/providers.py`

5. Provider abstraction layer
- `backend/app/providers/interfaces.py`
- `backend/app/providers/mock.py`
- `backend/app/core/providers.py`

6. Seed data
- `backend/scripts/seed_demo.py`

7. Frontend shell
- `frontend/app/page.tsx`
- `frontend/app/layout.tsx`

## 3) Local Setup (Docker)

From repo root:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

Seed demo data:

```bash
docker compose exec backend python -m scripts.seed_demo
```

Open:
- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- Backend health: `http://localhost:8000/health`

## 4) Local Setup (Without Docker)

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 5) Push to GitHub

If this folder is not a git repo yet:

```bash
cd /Users/kaizer/Desktop/financial_market_intelligence
git init
git add .
git commit -m "Bootstrap financial market intelligence platform"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

If repo already exists locally:

```bash
cd /Users/kaizer/Desktop/financial_market_intelligence
git add .
git commit -m "Add setup and project reading guide"
git push
```

## 6) Recommended Files To Keep Updated

- `README.md` for quickstart
- `docs/architecture.md` for technical structure
- `docs/SETUP_AND_PROJECT_GUIDE.md` for onboarding and contribution setup
