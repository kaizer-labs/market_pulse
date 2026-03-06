from fastapi import APIRouter

from app.core.providers import get_brief_generator, get_market_data_provider, get_news_provider

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("/status")
def provider_status() -> dict[str, str]:
    market_provider = get_market_data_provider().__class__.__name__
    news_provider = get_news_provider().__class__.__name__
    brief_generator = get_brief_generator().__class__.__name__

    return {
        "market_data_provider": market_provider,
        "news_provider": news_provider,
        "brief_generator": brief_generator,
    }
