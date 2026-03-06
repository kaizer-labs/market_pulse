from app.core.config import settings
from app.providers import (
    BriefGenerator,
    MarketDataProvider,
    MockBriefGenerator,
    MockMarketDataProvider,
    MockNewsProvider,
    NewsProvider,
)


def get_market_data_provider() -> MarketDataProvider:
    # TODO: add real adapters for production providers.
    if settings.market_data_provider == "mock":
        return MockMarketDataProvider()
    return MockMarketDataProvider()


def get_news_provider() -> NewsProvider:
    # TODO: add real adapters for production providers.
    if settings.news_provider == "mock":
        return MockNewsProvider()
    return MockNewsProvider()


def get_brief_generator() -> BriefGenerator:
    # TODO: wire real LLM provider adapter when API keys are configured.
    if settings.llm_provider == "mock" or not settings.llm_api_key:
        return MockBriefGenerator()
    return MockBriefGenerator()
