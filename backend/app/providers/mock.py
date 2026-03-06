from datetime import datetime, timedelta

from app.providers.interfaces import (
    BriefGenerator,
    MarketDataProvider,
    MarketPricePoint,
    NewsProvider,
    NewsRecord,
    RangeLiteral,
)


class MockMarketDataProvider(MarketDataProvider):
    _range_to_points = {"1D": 24, "1W": 7, "1M": 30, "3M": 90, "1Y": 365}

    def get_price_history(self, ticker: str, time_range: RangeLiteral) -> list[MarketPricePoint]:
        points = self._range_to_points[time_range]
        now = datetime.utcnow()
        base = (sum(ord(char) for char in ticker.upper()) % 200) + 50
        return [
            {
                "timestamp": now - timedelta(days=points - i),
                "close": round(base + (i * 0.4), 2),
            }
            for i in range(points)
        ]


class MockNewsProvider(NewsProvider):
    def get_news(self, tickers: list[str]) -> dict[str, list[NewsRecord]]:
        now = datetime.utcnow()
        grouped: dict[str, list[NewsRecord]] = {}
        for index, ticker in enumerate(tickers):
            grouped[ticker] = [
                {
                    "ticker": ticker,
                    "title": f"{ticker} quarterly updates remain in focus",
                    "summary": f"Mock headline set for {ticker} to keep local development deterministic.",
                    "source": "MockWire",
                    "url": f"https://example.com/news/{ticker.lower()}",
                    "tags": ["company update", "earnings"],
                    "published_at": now - timedelta(hours=index),
                }
            ]
        return grouped


class MockBriefGenerator(BriefGenerator):
    def generate(self, portfolio_name: str, holdings: list[str], headlines: list[str]) -> str:
        top_holdings = ", ".join(holdings[:5]) if holdings else "No holdings"
        top_headline = headlines[0] if headlines else "No relevant headlines"
        return (
            "Overview:\n"
            f"Portfolio '{portfolio_name}' is being tracked with mock intelligence providers.\n\n"
            "Portfolio Movers:\n"
            f"Primary symbols in focus: {top_holdings}.\n\n"
            "Key News:\n"
            f"Top headline: {top_headline}.\n\n"
            "Risks / Themes to Watch:\n"
            "Monitor earnings timing, macro volatility, and liquidity conditions."
        )
