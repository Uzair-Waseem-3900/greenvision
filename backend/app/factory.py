"""
Application factory. `backend/main.py` just imports `create_app()` from here.
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.error_handlers import register_exception_handlers

logger = logging.getLogger(__name__)

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def _run_migrations() -> None:
    """
    Runs `alembic upgrade head` programmatically on startup so tables are
    always in sync without a manual migration step every time the project
    is started. Safe to run repeatedly — Alembic no-ops if already current.
    """
    from alembic import command
    from alembic.config import Config

    alembic_cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("+asyncpg", ""))

    logger.info("Running database migrations...")
    command.upgrade(alembic_cfg, "head")
    logger.info("Migrations complete.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    return app
