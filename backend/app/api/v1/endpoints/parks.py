import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import Page, PageParams
from app.schemas.park import ParkCreate, ParkRead, ParkUpdate, ParkWithTreeCount
from app.selectors import park_selector
from app.services import park_service

router = APIRouter(prefix="/parks", tags=["parks"])


@router.post("", response_model=ParkRead, status_code=201)
async def create_park(
    payload: ParkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await park_service.create_park(db, payload, current_user.id)


@router.get("", response_model=Page[ParkWithTreeCount])
async def list_parks(
    search: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    params = PageParams(page=page, page_size=page_size)
    rows, total = await park_selector.list_parks(db, params.offset, params.page_size, search)
    items = [
        ParkWithTreeCount.model_validate(row["park"], from_attributes=True).model_copy(
            update={"tree_count": row["tree_count"]}
        )
        for row in rows
    ]
    return Page.create(items, total, params)


@router.get("/{park_id}", response_model=ParkRead)
async def get_park(
    park_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    park = await park_selector.get_by_id(db, park_id)
    if not park:
        raise NotFoundError("Park not found")
    return park


@router.patch("/{park_id}", response_model=ParkRead)
async def update_park(
    park_id: uuid.UUID,
    payload: ParkUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await park_service.update_park(db, park_id, payload)


@router.delete("/{park_id}", status_code=204)
async def delete_park(
    park_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    await park_service.delete_park(db, park_id)
