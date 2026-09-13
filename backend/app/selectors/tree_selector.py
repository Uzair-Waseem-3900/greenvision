import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_analysis import AIAnalysis
from app.models.tree import Tree


async def get_by_id(db: AsyncSession, tree_id: uuid.UUID) -> Tree | None:
    result = await db.execute(select(Tree).where(Tree.id == tree_id))
    return result.scalar_one_or_none()


def _latest_analysis_subquery():
    """
    One row per tree_id holding its most recent AI analysis, built with a
    window function so listing trees with their latest status is a single
    query instead of one extra query per tree.
    """
    ranked = (
        select(
            AIAnalysis.tree_id,
            AIAnalysis.level,
            AIAnalysis.confidence,
            AIAnalysis.created_at,
            func.row_number()
            .over(partition_by=AIAnalysis.tree_id, order_by=AIAnalysis.created_at.desc())
            .label("rn"),
        )
    ).subquery()

    return (
        select(
            ranked.c.tree_id,
            ranked.c.level,
            ranked.c.confidence,
            ranked.c.created_at,
        )
        .where(ranked.c.rn == 1)
        .subquery()
    )


async def list_trees(
    db: AsyncSession,
    offset: int,
    limit: int,
    park_id: uuid.UUID | None = None,
) -> tuple[list[dict], int]:
    latest = _latest_analysis_subquery()

    query = (
        select(Tree, latest.c.level, latest.c.confidence, latest.c.created_at)
        .outerjoin(latest, latest.c.tree_id == Tree.id)
    )
    count_query = select(func.count()).select_from(Tree)

    if park_id:
        query = query.where(Tree.park_id == park_id)
        count_query = count_query.where(Tree.park_id == park_id)

    query = query.order_by(Tree.created_at.desc()).offset(offset).limit(limit)

    rows_result = await db.execute(query)
    total_result = await db.execute(count_query)

    items = [
        {
            "tree": tree,
            "latest_level": level.value if level else None,
            "latest_confidence": confidence,
            "latest_scanned_at": scanned_at,
        }
        for tree, level, confidence, scanned_at in rows_result.all()
    ]
    return items, total_result.scalar_one()
