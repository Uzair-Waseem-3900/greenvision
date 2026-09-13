import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import Page, PageParams
from app.schemas.tree import TreeCreate, TreeRead, TreeUpdate, TreeWithLatestStatus
from app.selectors import tree_selector
from app.services import tree_service

router = APIRouter(prefix="/trees", tags=["trees"])


@router.post("", response_model=TreeRead, status_code=201)
async def create_tree(
    payload: TreeCreate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await tree_service.create_tree(db, payload)


@router.get("", response_model=Page[TreeWithLatestStatus])
async def list_trees(
    park_id: uuid.UUID | None = Query(default=None),
    search: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    params = PageParams(page=page, page_size=page_size)
    rows, total = await tree_selector.list_trees(db, params.offset, params.page_size, park_id, search)
    items = [
        TreeWithLatestStatus.model_validate(row["tree"], from_attributes=True).model_copy(
            update={
                "latest_level": row["latest_level"],
                "latest_confidence": row["latest_confidence"],
                "latest_scanned_at": row["latest_scanned_at"],
            }
        )
        for row in rows
    ]
    return Page.create(items, total, params)


@router.get("/{tree_id}", response_model=TreeRead)
async def get_tree(
    tree_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    tree = await tree_selector.get_by_id(db, tree_id)
    if not tree:
        raise NotFoundError("Tree not found")
    return tree


@router.patch("/{tree_id}", response_model=TreeRead)
async def update_tree(
    tree_id: uuid.UUID,
    payload: TreeUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return await tree_service.update_tree(db, tree_id, payload)


@router.delete("/{tree_id}", status_code=204)
async def delete_tree(
    tree_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    await tree_service.delete_tree(db, tree_id)
