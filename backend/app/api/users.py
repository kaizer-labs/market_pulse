from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.schemas import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/bootstrap-demo", response_model=UserRead)
def bootstrap_demo_user(db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.email == "demo@fmi.local").first()
    if user is not None:
        return user

    user = User(name="Demo User", email="demo@fmi.local")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
