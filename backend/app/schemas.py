from datetime import datetime

from pydantic import BaseModel, Field


class PositionBase(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=16)
    quantity: float = 0
    avg_price: float = 0
    notes: str = ""


class PositionCreate(PositionBase):
    pass


class PositionUpdate(BaseModel):
    ticker: str | None = Field(default=None, min_length=1, max_length=16)
    quantity: float | None = None
    avg_price: float | None = None
    notes: str | None = None


class PositionRead(PositionBase):
    id: int
    portfolio_id: int

    model_config = {"from_attributes": True}


class PortfolioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class PortfolioCreate(PortfolioBase):
    user_id: int


class PortfolioUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)


class PortfolioRead(PortfolioBase):
    id: int
    user_id: int
    positions: list[PositionRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class PortfolioListResponse(BaseModel):
    items: list[PortfolioRead]


class UserRead(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class ChartPointRead(BaseModel):
    timestamp: datetime
    close: float


class ChartResponse(BaseModel):
    ticker: str
    range: str
    points: list[ChartPointRead]


class NewsItemRead(BaseModel):
    ticker: str
    title: str
    summary: str
    source: str
    url: str
    tags: list[str] = Field(default_factory=list)
    published_at: datetime


class PortfolioNewsResponse(BaseModel):
    portfolio_id: int
    grouped_news: dict[str, list[NewsItemRead]]


class BriefRead(BaseModel):
    id: int
    portfolio_id: int
    generated_at: datetime
    content: str
    metadata_json: str

    model_config = {"from_attributes": True}
