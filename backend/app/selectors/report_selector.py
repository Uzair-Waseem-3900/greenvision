import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.search import search_ilike
from app.models.ai_analysis import AIAnalysis
from app.models.park import Park
from app.models.report import Report
from app.models.tree import Tree

# Columns shared by every enriched report query — kept in one place so the
# global reports list, the get-by-id detail view, and the reusable
# ReportCard frontend component always see exactly the same shape.
_ENRICHED_COLUMNS = (
    Report,
    Tree.label.label("tree_label"),
    Tree.park_id.label("park_id"),
    Park.name.label("park_name"),
    AIAnalysis.image_url.label("image_url"),
    AIAnalysis.confidence.label("confidence"),
)


def _enriched_base_query():
    return (
        select(*_ENRICHED_COLUMNS)
        .join(Tree, Tree.id == Report.tree_id)
        .join(Park, Park.id == Tree.park_id)
        .outerjoin(AIAnalysis, AIAnalysis.id == Report.ai_analysis_id)
    )


def _row_to_enriched_dict(row) -> dict:
    report, tree_label, park_id, park_name, image_url, confidence = row
    return {
        **{c.name: getattr(report, c.name) for c in Report.__table__.columns},
        "tree_label": tree_label,
        "park_id": park_id,
        "park_name": park_name,
        "image_url": image_url,
        "confidence": confidence,
    }


async def get_raw_by_id(db: AsyncSession, report_id: uuid.UUID) -> Report | None:
    """Plain ORM instance — for services that need to mutate/delete it."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, report_id: uuid.UUID) -> dict | None:
    """Enriched (tree/park/image) dict — for the read-facing API endpoint."""
    query = _enriched_base_query().where(Report.id == report_id)
    result = await db.execute(query)
    row = result.first()
    return _row_to_enriched_dict(row) if row else None


def _apply_filters(query, *, park_id, tree_id, severity, status, has_ai_analysis, date_from, date_to, search):
    if park_id:
        query = query.where(Tree.park_id == park_id)
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
    clause = search_ilike(search, Tree.label, Park.name, Report.title)
    if clause is not None:
        query = query.where(clause)
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
    search: str | None = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
) -> tuple[list[dict], int]:
    sort_column = getattr(Report, sort_by, Report.created_at)
    order_clause = sort_column.desc() if sort_dir == "desc" else sort_column.asc()

    base = _enriched_base_query()
    base = _apply_filters(
        base,
        park_id=park_id,
        tree_id=tree_id,
        severity=severity,
        status=status,
        has_ai_analysis=has_ai_analysis,
        date_from=date_from,
        date_to=date_to,
        search=search,
    )

    count_query = select(func.count()).select_from(Report).join(Tree, Tree.id == Report.tree_id).join(
        Park, Park.id == Tree.park_id
    )
    count_query = _apply_filters(
        count_query,
        park_id=park_id,
        tree_id=tree_id,
        severity=severity,
        status=status,
        has_ai_analysis=has_ai_analysis,
        date_from=date_from,
        date_to=date_to,
        search=search,
    )

    paged = base.order_by(order_clause).offset(offset).limit(limit)

    items_result = await db.execute(paged)
    total_result = await db.execute(count_query)

    items = [_row_to_enriched_dict(row) for row in items_result.all()]
    return items, total_result.scalar_one()


async def get_status_counts(db: AsyncSession, park_id: uuid.UUID | None = None) -> dict[str, int]:
    """Powers dashboard aggregates in one grouped query."""
    query = select(Report.severity, func.count()).group_by(Report.severity)
    if park_id:
        query = query.join(Tree, Tree.id == Report.tree_id).where(Tree.park_id == park_id)

    result = await db.execute(query)
    return {severity.value: count for severity, count in result.all()}


def _latest_report_per_tree_subquery():
    """One row per tree_id holding its most recent report, via window fn."""
    ranked = (
        select(
            Report.id.label("report_id"),
            Report.tree_id,
            Report.title,
            Report.severity,
            Report.status,
            Report.ai_analysis_id,
            Report.created_at,
            func.row_number()
            .over(partition_by=Report.tree_id, order_by=Report.created_at.desc())
            .label("rn"),
        )
    ).subquery()

    return (
        select(
            ranked.c.report_id,
            ranked.c.tree_id,
            ranked.c.title,
            ranked.c.severity,
            ranked.c.status,
            ranked.c.ai_analysis_id,
            ranked.c.created_at,
        )
        .where(ranked.c.rn == 1)
        .subquery()
    )


async def list_latest_reports_by_park(
    db: AsyncSession,
    park_id: uuid.UUID,
    offset: int,
    limit: int,
    severity: str | None = None,
    search: str | None = None,
) -> tuple[list[dict], int]:
    """
    One row per tree in the park: its latest report (if any) + scan image.
    Trees with no report yet still appear (via LEFT JOIN), with report_id
    null, so the frontend can offer a "Scan now" action for them. This is
    the single query backing the "view all trees' latest scan" screen.
    """
    latest = _latest_report_per_tree_subquery()

    query = (
        select(
            Tree.id.label("tree_id"),
            Tree.label.label("tree_label"),
            Tree.species.label("tree_species"),
            latest.c.report_id,
            latest.c.title,
            latest.c.severity,
            latest.c.status,
            latest.c.created_at.label("scanned_at"),
            AIAnalysis.image_url,
            AIAnalysis.confidence,
        )
        .select_from(Tree)
        .outerjoin(latest, latest.c.tree_id == Tree.id)
        .outerjoin(AIAnalysis, AIAnalysis.id == latest.c.ai_analysis_id)
        .where(Tree.park_id == park_id)
    )
    count_query = select(func.count()).select_from(Tree).where(Tree.park_id == park_id)

    if severity:
        query = query.where(latest.c.severity == severity)
        count_query = (
            select(func.count())
            .select_from(Tree)
            .outerjoin(latest, latest.c.tree_id == Tree.id)
            .where(Tree.park_id == park_id, latest.c.severity == severity)
        )

    clause = search_ilike(search, Tree.label, Tree.species)
    if clause is not None:
        query = query.where(clause)
        count_query = count_query.where(clause)

    query = query.order_by(latest.c.created_at.desc().nulls_last()).offset(offset).limit(limit)

    rows_result = await db.execute(query)
    total_result = await db.execute(count_query)

    items = [dict(row._mapping) for row in rows_result.all()]
    return items, total_result.scalar_one()
