"""
Central application configuration.

This is the SINGLE place environment variables are read from. Every other
module imports `settings` from here instead of calling os.getenv directly,
so there is exactly one source of truth for configuration values.
"""
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- App ----
    APP_NAME: str = "GreenVision API"
    ENVIRONMENT: str = "development"  # development | staging | production
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # ---- Security / JWT ----
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---- CORS ----
    # Comma separated list in .env, e.g.
    # ALLOWED_ORIGINS=http://localhost:5173,https://greenvision-coral.vercel.app
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def _validate_origins(cls, v: str) -> str:
        if v.strip() == "*":
            raise ValueError(
                "ALLOWED_ORIGINS must not be '*'. List explicit origins, "
                "comma separated, e.g. http://localhost:5173,https://yourapp.com"
            )
        return v

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # ---- Database (Supabase Postgres via SQLAlchemy async) ----
    # Use the "Transaction pooler" or "Session pooler" connection string from
    # Supabase > Project Settings > Database, rewritten to the asyncpg scheme:
    # postgresql+asyncpg://postgres:<password>@<host>:5432/postgres
    DATABASE_URL: str
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 5
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = False

    # ---- Supabase (Storage) ----
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "tree-photos"
    SUPABASE_SIGNED_URL_EXPIRY_SECONDS: int = 3600

    # ---- Gemini / LangGraph agent ----
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"
    # Used only as an immediate same-attempt fallback when the primary model
    # returns a 429 (quota) or 503 (overloaded) — not a general-purpose model.
    GEMINI_FALLBACK_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com"
    AGENT_MAX_RETRIES: int = 2
    AGENT_REQUEST_TIMEOUT_SECONDS: int = 30

    # ---- Uploads ----
    MAX_UPLOAD_SIZE_MB: int = 8
    ALLOWED_IMAGE_CONTENT_TYPES: str = "image/jpeg,image/png,image/webp"

    @property
    def allowed_image_types_list(self) -> List[str]:
        return [t.strip() for t in self.ALLOWED_IMAGE_CONTENT_TYPES.split(",") if t.strip()]

    # ---- Pagination defaults ----
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100


@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is only parsed once per process."""
    return Settings()


settings = get_settings()
