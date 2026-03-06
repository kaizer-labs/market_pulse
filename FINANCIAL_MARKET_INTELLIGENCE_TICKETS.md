# V1 Build Tickets — Financial Market Intelligence Platform

This breaks the POC into phased tickets so Codex can build in controlled increments instead of one broad pass.

---

## Phase 0 — Repo and Local Development Setup

### T0.1 — Monorepo Scaffold
**Goal**
Create project structure:
- `/frontend`
- `/backend`
- `/docs`
- `/scripts`

**Acceptance Criteria**
- frontend and backend boot independently
- root README explains structure
- local dev commands are documented

### T0.2 — Docker Compose Setup
**Goal**
Create docker-compose for:
- frontend
- backend
- postgres

**Acceptance Criteria**
- `docker-compose up --build` starts all core services
- backend can connect to postgres
- frontend can connect to backend through env config

### T0.3 — Environment Configuration
**Goal**
Create `.env.example` files for frontend and backend.

**Acceptance Criteria**
- required env vars documented
- app runs with mock providers if keys are missing

---

## Phase 1 — Backend Core Domain

### T1.1 — Database Models
**Goal**
Implement models for:
- User
- Portfolio
- PortfolioPosition
- NewsItem
- DailyBrief
- PricePoint

**Acceptance Criteria**
- migrations or schema creation works
- relationships are valid
- seed script can populate demo data

### T1.2 — Portfolio CRUD API
**Goal**
Build endpoints for portfolio creation and management.

**Acceptance Criteria**
- create portfolio
- list portfolios
- update portfolio
- delete portfolio
- add/edit/delete positions

### T1.3 — Provider Interfaces
**Goal**
Define service interfaces:
- `MarketDataProvider`
- `NewsProvider`
- `BriefGenerator`

**Acceptance Criteria**
- mock implementations exist
- backend services depend on interfaces, not concrete providers

---

## Phase 2 — Market Data and News

### T2.1 — Mock Market Data Provider
**Goal**
Return deterministic price history and latest values for seeded tickers.

**Acceptance Criteria**
- supports ranges: 1D, 1W, 1M, 3M, 1Y
- usable for both charts and portfolio calculations

### T2.2 — Mock News Provider
**Goal**
Return seeded news per ticker.

**Acceptance Criteria**
- grouped by ticker
- sorted by published date
- includes title, summary, source, url, tags

### T2.3 — Portfolio News Endpoint
**Goal**
Expose an endpoint to fetch news relevant to all holdings in a portfolio.

**Acceptance Criteria**
- returns news grouped by ticker
- supports empty portfolio gracefully

---

## Phase 3 — Daily Brief Generation

### T3.1 — Brief Generation Service
**Goal**
Build a service that generates a structured daily brief from portfolio + relevant news.

**Acceptance Criteria**
- output sections:
  - Overview
  - Portfolio Movers
  - Key News
  - Risks / Themes to Watch
- works with mock summarizer if no LLM key exists

### T3.2 — Daily Brief API
**Goal**
Expose endpoints to generate and fetch a daily brief.

**Acceptance Criteria**
- `POST /portfolios/{id}/brief/generate`
- `GET /portfolios/{id}/brief`
- stores generated brief in database

### T3.3 — Prompt / Brief Logic Documentation
**Goal**
Document how the brief is assembled.

**Acceptance Criteria**
- docs include input sources
- docs explain fallback behavior

---

## Phase 4 — Frontend Experience

### T4.1 — App Shell and Navigation
**Goal**
Create minimal but polished layout.

**Acceptance Criteria**
- top-level dashboard page
- responsive layout
- sections for summary, holdings, news, brief, charts

### T4.2 — Portfolio Management UI
**Goal**
Allow user to add/edit/remove holdings.

**Acceptance Criteria**
- ticker input
- quantity / avg price / notes support
- data persisted through backend API

### T4.3 — Portfolio Summary Dashboard
**Goal**
Show user portfolio health.

**Acceptance Criteria**
- total portfolio value
- daily gain/loss
- per-position performance
- simple allocation visualization

### T4.4 — Relevant News Section
**Goal**
Display relevant news by ticker.

**Acceptance Criteria**
- grouped by holding
- recent first
- links open article source
- empty states handled

### T4.5 — Daily Brief Panel
**Goal**
Render the AI-generated brief clearly.

**Acceptance Criteria**
- shows structured sections
- supports loading / regenerate state
- works with mock or real provider

### T4.6 — Interactive Chart Mode
**Goal**
Provide chart exploration per ticker.

**Acceptance Criteria**
- selectable ticker
- ranges: 1D, 1W, 1M, 3M, 1Y
- chart is interactive and readable

---

## Phase 5 — Seed Data and Demo Polish

### T5.1 — Seed Demo Portfolio
**Goal**
Create one seeded user and one meaningful seeded portfolio.

**Acceptance Criteria**
- includes 5–8 recognizable tickers
- includes seeded price history and news
- enough data to demonstrate the brief and dashboard

### T5.2 — Demo-Ready UX Polish
**Goal**
Make the product presentation-ready.

**Acceptance Criteria**
- loading states
- empty states
- error states
- consistent typography and spacing

### T5.3 — README and Architecture Doc
**Goal**
Document setup and design.

**Acceptance Criteria**
- root README complete
- `/docs/architecture.md` created
- future roadmap section added

---

## Phase 6 — Optional V1.1 Stretch Goals
Only build if all above is complete.

### T6.1 — News Tagging Improvements
Add better tagging for:
- earnings
- macro
- analyst
- company update

### T6.2 — Brief History
Store and browse prior daily briefs.

### T6.3 — Notes per Ticker
Allow the user to save research notes.

### T6.4 — Relevance Scoring
Rank news relevance based on holdings and recency.

---

## Explicit Non-Goals for This Ticket Set
Do not build yet:
- blog publishing
- comments
- Twitter/X ingestion
- trend prediction
- alerts/notifications
- agent planner loops
- social/community features
- full auth

These are future roadmap items, not V1 tasks.
