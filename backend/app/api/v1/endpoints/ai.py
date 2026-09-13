import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundError, ValidationAppError
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai_analysis import AIAnalysisRead, AIAnalysisUpdate
from app.schemas.common import Page, PageParams
from app.selectors import ai_selector
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai-analysis"])


@router.post("/analyze/{tree_id}", response_model=AIAnalysisRead, status_code=201)
async def analyze_photo(
    tree_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type:
        raise ValidationAppError("File is missing a content type")

    file_bytes = await file.read()
    return await ai_service.analyze_tree_photo(
        db, tree_id, file_bytes, file.content_type, current_user.id
    )


@router.get("/dashboard-summary", response_model=dict)
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await ai_selector.get_dashboard_aggregates(db)


@router.get("", response_model=Page[AIAnalysisRead])
async def list_analyses(
    park_id: uuid.UUID | None = Query(default=None),
    tree_id: uuid.UUID | None = Query(default=None),
    level: Literal["healthy", "mild", "high"] | None = Query(default=None),
    min_confidence: int | None = Query(default=None, ge=0, le=100),
    reviewed: bool | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    params = PageParams(page=page, page_size=page_size)
    items, total = await ai_selector.list_analyses(
        db,
        params.offset,
        params.page_size,
        park_id=park_id,
        tree_id=tree_id,
        level=level,
        min_confidence=min_confidence,
        reviewed=reviewed,
        date_from=date_from,
        date_to=date_to,
    )
    return Page.create(items, total, params)


@router.get("/{analysis_id}", response_model=AIAnalysisRead)
async def get_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    analysis = await ai_selector.get_by_id(db, analysis_id)
    if not analysis:
        raise NotFoundError("AI analysis not found")
    return analysis


@router.patch("/{analysis_id}", response_model=AIAnalysisRead)
async def update_analysis(
    analysis_id: uuid.UUID,
    payload: AIAnalysisUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await ai_service.update_analysis(db, analysis_id, payload)


@router.delete("/{analysis_id}", status_code=204)
async def delete_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    await ai_service.delete_analysis(db, analysis_id)
