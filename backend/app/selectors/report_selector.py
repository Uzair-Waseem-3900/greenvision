import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.models.tree import Tree


async def get_by_id(db: AsyncSession, report_id: uuid.UUID) -> Report | None:
    result = await db.execute(select(Report).where(Report.id == report_id))
    return result.scalar_one_or_none()


def _apply_filters(query, *, park_id, tree_id, severity, status, has_ai_analysis, date_from, date_to):
    if park_id:
        query = query.join(Tree, Tree.id == Report.tree_id).where(Tree.park_id == park_id)
    if tree_id:
        query = query.where(Report.tree_id == tree_id)
    if severity:
        query = query.where(Report.severity == severity)
    if status:
        query = query.where(Report.status == status)
    if has_ai_analysis is not None:
        if has_ai_analysis:
            query = query.where(Report.ai_analysis_id.is_not(None))
        else:
            query = query.where(Report.ai_analysis_id.is_(None))
    if date_from:
        query = query.where(Report.created_at >= date_from)
    if date_to:
        query = query.where(Report.created_at <= date_to)
    return query


async def list_reports(
    db: AsyncSession,
    offset: int,
    limit: int,
    park_id: uuid.UUID | None = None,
    tree_id: uuid.UUID | None = None,
    severity: str | None = None,
    status: str | None = None,
    has_ai_analysis: bool | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
) -> tuple[list[Report], int]:
    sort_column = getattr(Report, sort_by, Report.created_at)
    order_clause = sort_column.desc() if sort_dir == "desc" else sort_column.asc()

    base = select(Report)
    base = _apply_filters(
        base,
        park_id=park_id,
        tree_id=tree_id,
        severity=severity,
        status=status,
        has_ai_analysis=has_ai_analysis,
        date_from=date_from,
        date_to=date_to,
    )

    count_query = select(func.count()).select_from(Report)
    count_query = _apply_filters(
        count_query,
        park_id=park_id,
        tree_id=tree_id,
        severity=severity,
        status=status,
        has_ai_analysis=has_ai_analysis,
        date_from=date_from,
        date_to=date_to,
    )

    paged = base.order_by(order_clause).offset(offset).limit(limit)

    items_result = await db.execute(paged)
    total_result = await db.execute(count_query)

    return list(items_result.scalars().all()), total_result.scalar_one()


async def get_status_counts(db: AsyncSession, park_id: uuid.UUID | None = None) -> dict[str, int]:
    """Powers dashboard aggregates in one grouped query."""
    query = select(Report.severity, func.count()).group_by(Report.severity)
    if park_id:
        query = query.join(Tree, Tree.id == Report.tree_id).where(Tree.park_id == park_id)

    result = await db.execute(query)
    return {severity.value: count for severity, count in result.all()}
