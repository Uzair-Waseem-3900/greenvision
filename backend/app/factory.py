"""
Application factory. `backend/main.py` just imports `create_app()` from here.

Migrations are NOT run automatically on startup — see
`backend/scripts/migrate.py` (or `alembic upgrade head` directly) to apply
them manually before starting the app.
"""
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.error_handlers import register_exception_handlers

logger = logging.getLogger(__name__)

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
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
