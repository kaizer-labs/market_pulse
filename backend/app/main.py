from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.intelligence import router as intelligence_router
from app.api.portfolios import router as portfolio_router
from app.api.providers import router as providers_router
from app.api.users import router as users_router
from app.core.config import settings
from app.core.database import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(portfolio_router)
app.include_router(providers_router)
app.include_router(users_router)
app.include_router(intelligence_router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "environment": settings.app_env,
        "message": "Backend bootstrap complete",
    }
