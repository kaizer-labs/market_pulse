from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.providers import get_brief_generator, get_market_data_provider, get_news_provider
from app.models import DailyBrief, Portfolio
from app.providers.interfaces import RangeLiteral
from app.schemas import BriefRead, ChartResponse, NewsItemRead, PortfolioNewsResponse

router = APIRouter(tags=["intelligence"])


@router.get("/charts/{ticker}", response_model=ChartResponse)
def get_chart_data(
    ticker: str,
    range: RangeLiteral = Query(default="1M"),
) -> ChartResponse:
    provider = get_market_data_provider()
    points = provider.get_price_history(ticker=ticker.upper(), time_range=range)
    return ChartResponse(ticker=ticker.upper(), range=range, points=points)


@router.get("/portfolios/{portfolio_id}/news", response_model=PortfolioNewsResponse)
def get_portfolio_news(portfolio_id: int, db: Session = Depends(get_db)) -> PortfolioNewsResponse:
    portfolio = (
        db.query(Portfolio)
        .options(joinedload(Portfolio.positions))
        .filter(Portfolio.id == portfolio_id)
        .first()
    )
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    tickers = sorted({position.ticker.upper() for position in portfolio.positions})
    if not tickers:
        return PortfolioNewsResponse(portfolio_id=portfolio.id, grouped_news={})

    provider = get_news_provider()
    grouped = provider.get_news(tickers)

    sorted_grouped = {
        ticker: sorted(
            [NewsItemRead(**item) for item in grouped.get(ticker, [])],
            key=lambda item: item.published_at,
            reverse=True,
        )
        for ticker in tickers
    }
    return PortfolioNewsResponse(portfolio_id=portfolio.id, grouped_news=sorted_grouped)


@router.get("/portfolios/{portfolio_id}/brief", response_model=BriefRead)
def get_latest_brief(portfolio_id: int, db: Session = Depends(get_db)) -> DailyBrief:
    brief = (
        db.query(DailyBrief)
        .filter(DailyBrief.portfolio_id == portfolio_id)
        .order_by(DailyBrief.generated_at.desc())
        .first()
    )
    if brief is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brief not found")
    return brief


@router.post("/portfolios/{portfolio_id}/brief/generate", response_model=BriefRead)
def generate_brief(portfolio_id: int, db: Session = Depends(get_db)) -> DailyBrief:
    portfolio = (
        db.query(Portfolio)
        .options(joinedload(Portfolio.positions))
        .filter(Portfolio.id == portfolio_id)
        .first()
    )
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    tickers = sorted({position.ticker.upper() for position in portfolio.positions})
    news_provider = get_news_provider()
    grouped_news = news_provider.get_news(tickers)
    headlines = [item["title"] for ticker_news in grouped_news.values() for item in ticker_news]

    generator = get_brief_generator()
    content = generator.generate(
        portfolio_name=portfolio.name,
        holdings=tickers,
        headlines=headlines,
    )

    brief = DailyBrief(
        portfolio_id=portfolio.id,
        generated_at=datetime.utcnow(),
        content=content,
        metadata_json='{"generator": "mock"}',
    )
    db.add(brief)
    db.commit()
    db.refresh(brief)
    return brief
