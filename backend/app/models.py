from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    portfolios: Mapped[list["Portfolio"]] = relationship(
        "Portfolio", back_populates="user", cascade="all, delete-orphan"
    )


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="portfolios")
    positions: Mapped[list["PortfolioPosition"]] = relationship(
        "PortfolioPosition", back_populates="portfolio", cascade="all, delete-orphan"
    )
    briefs: Mapped[list["DailyBrief"]] = relationship(
        "DailyBrief", back_populates="portfolio", cascade="all, delete-orphan"
    )


class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    ticker: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    avg_price: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")

    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="positions")


class NewsItem(Base):
    __tablename__ = "news_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticker: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(120), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    tags: Mapped[str] = mapped_column(String(255), nullable=False, default="")


class DailyBrief(Base):
    __tablename__ = "daily_briefs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")

    portfolio: Mapped["Portfolio"] = relationship("Portfolio", back_populates="briefs")


class PricePoint(Base):
    __tablename__ = "price_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticker: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[int] = mapped_column(Integer, nullable=False)
