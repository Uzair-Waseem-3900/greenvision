from fastapi import APIRouter

from app.api.v1.endpoints import ai, auth, parks, reports, trees, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(parks.router)
api_router.include_router(trees.router)
api_router.include_router(reports.router)
api_router.include_router(ai.router)
