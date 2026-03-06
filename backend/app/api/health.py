from fastapi import APIRouter

from app.core.config import settings
from app.core.database import check_database_connection

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@router.get("/db")
def database_health_check() -> dict[str, str]:
    check_database_connection()
    return {"status": "ok", "database": "connected"}
