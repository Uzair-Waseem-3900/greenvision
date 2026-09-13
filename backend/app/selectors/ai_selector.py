import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_analysis import AIAnalysis
from app.models.tree import Tree


async def get_by_id(db: AsyncSession, analysis_id: uuid.UUID) -> AIAnalysis | None:
    result = await db.execute(select(AIAnalysis).where(AIAnalysis.id == analysis_id))
    return result.scalar_one_or_none()


def _apply_filters(query, *, park_id, tree_id, level, min_confidence, reviewed, date_from, date_to):
    if park_id:
        query = query.join(Tree, Tree.id == AIAnalysis.tree_id).where(Tree.park_id == park_id)
    if tree_id:
        query = query.where(AIAnalysis.tree_id == tree_id)
    if level:
        query = query.where(AIAnalysis.level == level)
    if min_confidence is not None:
        query = query.where(AIAnalysis.confidence >= min_confidence)
    if reviewed is not None:
        query = query.where(AIAnalysis.reviewed == reviewed)
    if date_from:
        query = query.where(AIAnalysis.created_at >= date_from)
    if date_to:
        query = query.where(AIAnalysis.created_at <= date_to)
    return query


async def list_analyses(
    db: AsyncSession,
    offset: int,
    limit: int,
    park_id: uuid.UUID | None = None,
    tree_id: uuid.UUID | None = None,
    level: str | None = None,
    min_confidence: int | None = None,
    reviewed: bool | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
) -> tuple[list[AIAnalysis], int]:
    base = select(AIAnalysis)
    base = _apply_filters(
        base,
        park_id=park_id,
        tree_id=tree_id,
        level=level,
        min_confidence=min_confidence,
        reviewed=reviewed,
        date_from=date_from,
        date_to=date_to,
    )

    count_query = select(func.count()).select_from(AIAnalysis)
    count_query = _apply_filters(
        count_query,
        park_id=park_id,
        tree_id=tree_id,
        level=level,
        min_confidence=min_confidence,
        reviewed=reviewed,
        date_from=date_from,
        date_to=date_to,
    )

    paged = base.order_by(AIAnalysis.created_at.desc()).offset(offset).limit(limit)

    items_result = await db.execute(paged)
    total_result = await db.execute(count_query)

    return list(items_result.scalars().all()), total_result.scalar_one()


async def get_dashboard_aggregates(db: AsyncSession) -> dict:
    """Single grouped query powering the dashboard's headline numbers."""
    level_counts_result = await db.execute(
        select(AIAnalysis.level, func.count()).group_by(AIAnalysis.level)
    )
    level_counts = {level.value: count for level, count in level_counts_result.all()}

    total_images_result = await db.execute(select(func.count()).select_from(AIAnalysis))
    total_trees_result = await db.execute(select(func.count(func.distinct(AIAnalysis.tree_id))))

    return {
        "images_analyzed": total_images_result.scalar_one(),
        "trees_with_analysis": total_trees_result.scalar_one(),
        "healthy": level_counts.get("healthy", 0),
        "mild": level_counts.get("mild", 0),
        "high": level_counts.get("high", 0),
    }
