# Architecture

## Service Layout
- `frontend`: Next.js dashboard shell and portfolio UI.
- `backend`: FastAPI API with SQLAlchemy domain models and provider abstraction layer.
- `postgres`: primary relational datastore.

## Backend Modules
- `app/api`: HTTP routes (`health`, `portfolios`, `providers`).
- `app/core`: configuration, DB session management, provider selection.
- `app/models.py`: core relational entities.
- `app/providers`: abstract interfaces and mock implementations.
- `scripts/seed_demo.py`: deterministic demo data seeding.

## Domain Models
- `User`
- `Portfolio`
- `PortfolioPosition`
- `NewsItem`
- `DailyBrief`
- `PricePoint`

Relationships:
- one `User` has many `Portfolio`
- one `Portfolio` has many `PortfolioPosition`
- one `Portfolio` has many `DailyBrief`

## Provider Interfaces
- `MarketDataProvider`
- `NewsProvider`
- `BriefGenerator`

The app uses interface-based factories in `app/core/providers.py`, currently backed by deterministic mock adapters. This keeps calling services decoupled from concrete providers.

## Persistence Strategy (Current)
- Schema bootstrapped via `Base.metadata.create_all()` in FastAPI lifespan.
- Demo dataset seeded with `python -m scripts.seed_demo`.
- Migration tooling is a follow-up task for later phases.
