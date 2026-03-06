from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Portfolio, PortfolioPosition, User
from app.schemas import (
    PortfolioCreate,
    PortfolioListResponse,
    PortfolioRead,
    PortfolioUpdate,
    PositionCreate,
    PositionRead,
    PositionUpdate,
)

router = APIRouter(tags=["portfolios"])


@router.get("/portfolios", response_model=PortfolioListResponse)
def list_portfolios(db: Session = Depends(get_db)) -> PortfolioListResponse:
    portfolios = db.query(Portfolio).options(joinedload(Portfolio.positions)).order_by(Portfolio.id.asc()).all()
    return PortfolioListResponse(items=portfolios)


@router.post("/portfolios", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_portfolio(payload: PortfolioCreate, db: Session = Depends(get_db)) -> Portfolio:
    user = db.get(User, payload.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    portfolio = Portfolio(name=payload.name, user_id=payload.user_id)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.get("/portfolios/{portfolio_id}", response_model=PortfolioRead)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)) -> Portfolio:
    portfolio = (
        db.query(Portfolio)
        .options(joinedload(Portfolio.positions))
        .filter(Portfolio.id == portfolio_id)
        .first()
    )
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return portfolio


@router.put("/portfolios/{portfolio_id}", response_model=PortfolioRead)
def update_portfolio(portfolio_id: int, payload: PortfolioUpdate, db: Session = Depends(get_db)) -> Portfolio:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    if payload.name is not None:
        portfolio.name = payload.name

    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.delete("/portfolios/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)) -> None:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    db.delete(portfolio)
    db.commit()


@router.post(
    "/portfolios/{portfolio_id}/positions", response_model=PositionRead, status_code=status.HTTP_201_CREATED
)
def add_position(portfolio_id: int, payload: PositionCreate, db: Session = Depends(get_db)) -> PortfolioPosition:
    portfolio = db.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    position = PortfolioPosition(
        portfolio_id=portfolio_id,
        ticker=payload.ticker.upper(),
        quantity=payload.quantity,
        avg_price=payload.avg_price,
        notes=payload.notes,
    )
    db.add(position)
    db.commit()
    db.refresh(position)
    return position


@router.put("/positions/{position_id}", response_model=PositionRead)
def update_position(position_id: int, payload: PositionUpdate, db: Session = Depends(get_db)) -> PortfolioPosition:
    position = db.get(PortfolioPosition, position_id)
    if position is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Position not found")

    if payload.ticker is not None:
        position.ticker = payload.ticker.upper()
    if payload.quantity is not None:
        position.quantity = payload.quantity
    if payload.avg_price is not None:
        position.avg_price = payload.avg_price
    if payload.notes is not None:
        position.notes = payload.notes

    db.commit()
    db.refresh(position)
    return position


@router.delete("/positions/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_position(position_id: int, db: Session = Depends(get_db)) -> None:
    position = db.get(PortfolioPosition, position_id)
    if position is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Position not found")
    db.delete(position)
    db.commit()
