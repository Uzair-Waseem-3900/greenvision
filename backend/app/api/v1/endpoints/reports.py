import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import Page, PageParams
from app.schemas.report import ReportCreate, ReportRead, ReportUpdate
from app.selectors import report_selector
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportRead, status_code=201)
async def create_report(
    payload: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await report_service.create_report(db, payload, current_user.id)


@router.get("", response_model=Page[ReportRead])
async def list_reports(
    park_id: uuid.UUID | None = Query(default=None),
    tree_id: uuid.UUID | None = Query(default=None),
    severity: Literal["healthy", "mild", "high"] | None = Query(default=None),
    status: Literal["open", "in_progress", "resolved"] | None = Query(default=None),
    has_ai_analysis: bool | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    sort_by: Literal["created_at", "updated_at", "severity", "status"] = Query(default="created_at"),
    sort_dir: Literal["asc", "desc"] = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    params = PageParams(page=page, page_size=page_size)
    items, total = await report_selector.list_reports(
        db,
        params.offset,
        params.page_size,
        park_id=park_id,
        tree_id=tree_id,
        severity=severity,
        status=status,
        has_ai_analysis=has_ai_analysis,
        date_from=date_from,
        date_to=date_to,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return Page.create(items, total, params)


@router.get("/status-counts", response_model=dict)
async def status_counts(
    park_id: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await report_selector.get_status_counts(db, park_id)


@router.get("/{report_id}", response_model=ReportRead)
async def get_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    report = await report_selector.get_by_id(db, report_id)
    if not report:
        raise NotFoundError("Report not found")
    return report


@router.patch("/{report_id}", response_model=ReportRead)
async def update_report(
    report_id: uuid.UUID,
    payload: ReportUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await report_service.update_report(db, report_id, payload)


@router.delete("/{report_id}", status_code=204)
async def delete_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    await report_service.delete_report(db, report_id)
