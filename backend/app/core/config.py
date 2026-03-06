from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Financial Market Intelligence API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    database_url: str = "postgresql+psycopg2://postgres:postgres@postgres:5432/market_intelligence"
    llm_provider: str = "mock"
    llm_api_key: str = ""
    market_data_provider: str = "mock"
    news_provider: str = "mock"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
