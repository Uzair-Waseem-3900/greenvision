import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.report import Report, ReportStatus
from app.schemas.report import ReportCreate, ReportUpdate
from app.selectors import report_selector, tree_selector


async def create_report(db: AsyncSession, data: ReportCreate, created_by_id: uuid.UUID) -> Report:
    tree = await tree_selector.get_by_id(db, data.tree_id)
    if not tree:
        raise NotFoundError("Tree not found")

    report = Report(
        title=data.title,
        tree_id=data.tree_id,
        severity=data.severity,
        notes=data.notes,
        ai_analysis_id=data.ai_analysis_id,
        created_by_id=created_by_id,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


async def update_report(db: AsyncSession, report_id: uuid.UUID, data: ReportUpdate) -> Report:
    report = await report_selector.get_raw_by_id(db, report_id)
    if not report:
        raise NotFoundError("Report not found")

    updates = data.model_dump(exclude_unset=True)

    if updates.get("status") == ReportStatus.RESOLVED.value and report.status != ReportStatus.RESOLVED:
        report.resolved_at = datetime.now(timezone.utc)
    elif "status" in updates and updates["status"] != ReportStatus.RESOLVED.value:
        report.resolved_at = None

    for field, value in updates.items():
        setattr(report, field, value)

    await db.commit()
    await db.refresh(report)
    return report


async def delete_report(db: AsyncSession, report_id: uuid.UUID) -> None:
    report = await report_selector.get_raw_by_id(db, report_id)
    if not report:
        raise NotFoundError("Report not found")

    await db.delete(report)
    await db.commit()
