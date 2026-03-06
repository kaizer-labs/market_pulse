from datetime import datetime, timedelta

from app.core.database import SessionLocal, Base, engine
from app.models import DailyBrief, NewsItem, Portfolio, PortfolioPosition, PricePoint, User


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "demo@fmi.local").first():
            print("Seed data already present")
            return

        user = User(name="Demo User", email="demo@fmi.local")
        db.add(user)
        db.flush()

        portfolio = Portfolio(name="Core Growth", user_id=user.id)
        db.add(portfolio)
        db.flush()

        positions = [
            PortfolioPosition(portfolio_id=portfolio.id, ticker="AAPL", quantity=15, avg_price=172.5, notes="Long-term"),
            PortfolioPosition(portfolio_id=portfolio.id, ticker="MSFT", quantity=10, avg_price=378.0, notes="Cloud exposure"),
            PortfolioPosition(portfolio_id=portfolio.id, ticker="NVDA", quantity=5, avg_price=850.0, notes="AI leader"),
            PortfolioPosition(portfolio_id=portfolio.id, ticker="AMZN", quantity=8, avg_price=158.0, notes="Consumer + cloud"),
            PortfolioPosition(portfolio_id=portfolio.id, ticker="GOOGL", quantity=7, avg_price=145.0, notes="Ads + AI"),
        ]
        db.add_all(positions)

        now = datetime.utcnow()
        news_items = [
            NewsItem(
                ticker="AAPL",
                title="Apple supply chain checks stabilize",
                summary="Analysts note improving component lead times into next quarter.",
                source="MockWire",
                url="https://example.com/apple-supply",
                published_at=now - timedelta(hours=2),
                tags="company update,analyst",
            ),
            NewsItem(
                ticker="NVDA",
                title="AI infrastructure demand remains elevated",
                summary="Enterprise orders continue to support data center spending trends.",
                source="MockWire",
                url="https://example.com/nvda-demand",
                published_at=now - timedelta(hours=4),
                tags="macro,company update",
            ),
        ]
        db.add_all(news_items)

        price_points = []
        for ticker, start_price in [("AAPL", 190), ("MSFT", 420), ("NVDA", 920), ("AMZN", 180), ("GOOGL", 170)]:
            for i in range(30):
                close = round(start_price + (i * 0.6), 2)
                price_points.append(
                    PricePoint(
                        ticker=ticker,
                        timestamp=now - timedelta(days=30 - i),
                        open=close - 1.1,
                        high=close + 1.5,
                        low=close - 1.8,
                        close=close,
                        volume=1_000_000 + (i * 1200),
                    )
                )
        db.add_all(price_points)

        brief = DailyBrief(
            portfolio_id=portfolio.id,
            content=(
                "Overview:\nPortfolio momentum remains positive with tech concentration.\n\n"
                "Portfolio Movers:\nNVDA and MSFT drove recent gains.\n\n"
                "Key News:\nSupply chain normalization and AI capex remain key themes.\n\n"
                "Risks / Themes to Watch:\nRate sensitivity and valuation compression risk."
            ),
            metadata_json='{"provider": "mock"}',
        )
        db.add(brief)

        db.commit()
        print("Seeded demo user, portfolio, positions, news, brief, and price points")
    finally:
        db.close()


if __name__ == "__main__":
    run()
