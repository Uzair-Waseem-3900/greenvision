import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.search import search_ilike
from app.models.park import Park
from app.models.tree import Tree


async def get_by_id(db: AsyncSession, park_id: uuid.UUID) -> Park | None:
    result = await db.execute(select(Park).where(Park.id == park_id))
    return result.scalar_one_or_none()


async def list_parks(
    db: AsyncSession,
    offset: int,
    limit: int,
    search: str | None = None,
) -> tuple[list[dict], int]:
    """
    Returns parks with a tree_count, computed in a single aggregated query
    (no N+1) via a LEFT JOIN + GROUP BY.
    """
    base_query = select(
        Park,
        func.count(Tree.id).label("tree_count"),
    ).outerjoin(Tree, Tree.park_id == Park.id)

    count_query = select(func.count()).select_from(Park)

    clause = search_ilike(search, Park.name, Park.address)
    if clause is not None:
        base_query = base_query.where(clause)
        count_query = count_query.where(clause)

    base_query = base_query.group_by(Park.id)
    paged_query = base_query.order_by(Park.created_at.desc()).offset(offset).limit(limit)

    rows_result = await db.execute(paged_query)
    total_result = await db.execute(count_query)

    rows = rows_result.all()
    items = [{"park": park, "tree_count": count} for park, count in rows]
    return items, total_result.scalar_one()
