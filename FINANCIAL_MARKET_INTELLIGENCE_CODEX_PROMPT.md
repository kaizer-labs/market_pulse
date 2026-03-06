# Codex Build Prompt — Financial Market Intelligence Platform

You are a senior full-stack engineer. Build a production-style POC for a product called **Financial Market Intelligence Platform**.

## Product Goal
Build a personalized market intelligence dashboard for retail investors / active market followers.

The main job-to-be-done:
> Given a user’s portfolio or watchlist, show what matters today through portfolio performance, relevant news, interactive charts, and an AI-generated daily brief.

This is a **workflow platform**, not a chatbot.

---

## V1 Scope (must build)

Build only these features:

1. **Portfolio / Watchlist Input**
   - User can add/edit/remove stock tickers
   - Optional fields: quantity, average price, notes
   - Persist portfolio in database

2. **Portfolio Dashboard**
   - Show total portfolio value
   - Show daily gain/loss
   - Show per-position performance
   - Show simple allocation breakdown

3. **Relevant News Feed**
   - Fetch or mock news per ticker
   - Group news by ticker
   - Sort news by recency
   - Add lightweight tags if possible:
     - earnings
     - macro
     - analyst
     - company update

4. **AI Daily Brief**
   - Generate one daily brief based on portfolio + news
   - The brief should answer:
     - what matters today
     - which holdings are affected
     - what themes are driving movement
   - Keep this grounded and structured
   - Implement through a service abstraction so the LLM provider can be swapped later
   - If no real LLM key is configured, use a deterministic mock summarizer

5. **Interactive Chart Mode**
   - User can open a chart view for each ticker
   - Support time ranges: 1D, 1W, 1M, 3M, 1Y
   - Use a clean interactive chart library
   - Mock market price data if API keys are absent

---

## Out of Scope for V1 (do not build now)
- blog publishing
- comments
- Twitter/X ingestion
- predictions
- multi-agent workflows
- complex authentication
- public user profiles
- payments
- notifications

Leave clean TODOs for future versions where useful.

---

## Product Principles
- Clean, minimal UI
- Fast local setup
- Modular backend
- Production-minded architecture
- Strong separation of concerns
- Easy to extend later into a larger platform

---

## Tech Stack
### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Component-based UI
- Interactive chart library (lightweight and modern)

### Backend
- FastAPI
- Python
- SQLAlchemy or equivalent ORM
- PostgreSQL
- Simple background job / scheduler support
- Service-based architecture

### Dev / Infra
- Docker + docker-compose for local development
- .env support
- Seed script for demo data

---

## Architecture Requirements
Use a monorepo or clearly separated frontend/backend structure.

Preferred structure:
- `/frontend`
- `/backend`
- `/docs`
- `/scripts`

Backend should be organized into:
- portfolio service
- market data service
- news service
- brief generation service
- chart data service

Design with interfaces so real providers can be swapped later:
- `MarketDataProvider`
- `NewsProvider`
- `BriefGenerator`

If real APIs are unavailable, implement mock adapters with seeded data.

---

## Data Model
At minimum include:

### User
- id
- name
- email (can be mocked for now)

### Portfolio
- id
- user_id
- name

### PortfolioPosition
- id
- portfolio_id
- ticker
- quantity
- avg_price
- notes

### NewsItem
- id
- ticker
- title
- summary
- source
- url
- published_at
- tags

### DailyBrief
- id
- portfolio_id
- generated_at
- content
- metadata_json

### PricePoint
- id
- ticker
- timestamp
- open
- high
- low
- close
- volume

You may refine names and relationships if needed.

---

## UX Requirements
Landing/dashboard should include:
- top portfolio summary
- list of holdings
- relevant news by ticker
- daily brief card/panel
- chart modal or chart page for selected ticker

The UI should feel like:
- a working investor dashboard
- not a generic admin panel
- not a toy demo

---

## API Requirements
Create clear REST endpoints for:
- portfolio CRUD
- positions CRUD
- news retrieval by portfolio/ticker
- chart data by ticker/range
- daily brief generation/fetch

Document endpoints in backend README or OpenAPI.

---

## AI / Brief Requirements
The daily brief should be structured, not a wall of text.

Suggested format:
- Overview
- Portfolio Movers
- Key News
- Risks / Themes to Watch

If no LLM provider is configured:
- generate a deterministic mock summary from news/positions

Make the implementation easy to replace with a real LLM later.

---

## Quality Requirements
- Strong typing
- Reasonable error handling
- Clean component structure
- Clear service boundaries
- Comments only where useful
- No unnecessary complexity
- Avoid fake enterprise boilerplate

---

## Deliverables
Build:
1. working frontend
2. working backend
3. database models
4. sample seeded data
5. local docker setup
6. README with setup instructions
7. clear TODO/roadmap for future features

Also include:
- a short architecture note in `/docs/architecture.md`
- a sample screenshots section placeholder in README
- a seed portfolio for a demo user

---

## Important Implementation Guidance
- Start with mocked providers if external APIs slow down delivery
- Favor completeness of workflow over external API perfection
- Make the app demoable locally
- Do not overbuild authentication
- Do not add features outside V1
- Keep the codebase clean enough for later expansion into:
  - publishing
  - case studies
  - social signals
  - alerts
  - agentic research workflows

---

## Final Output Expectation
When done, provide:
- final project structure
- setup commands
- key design decisions
- next recommended steps for V1.5 and V2
