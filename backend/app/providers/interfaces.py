from abc import ABC, abstractmethod
from datetime import datetime
from typing import Literal, TypedDict

RangeLiteral = Literal["1D", "1W", "1M", "3M", "1Y"]


class MarketPricePoint(TypedDict):
    timestamp: datetime
    close: float


class NewsRecord(TypedDict):
    ticker: str
    title: str
    summary: str
    source: str
    url: str
    tags: list[str]
    published_at: datetime


class MarketDataProvider(ABC):
    @abstractmethod
    def get_price_history(self, ticker: str, time_range: RangeLiteral) -> list[MarketPricePoint]:
        raise NotImplementedError


class NewsProvider(ABC):
    @abstractmethod
    def get_news(self, tickers: list[str]) -> dict[str, list[NewsRecord]]:
        raise NotImplementedError


class BriefGenerator(ABC):
    @abstractmethod
    def generate(self, portfolio_name: str, holdings: list[str], headlines: list[str]) -> str:
        raise NotImplementedError
