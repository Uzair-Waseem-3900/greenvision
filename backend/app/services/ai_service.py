import base64
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.tree_health_agent import run_tree_health_agent
from app.core.exceptions import NotFoundError
from app.models.ai_analysis import AIAnalysis
from app.models.report import Report
from app.schemas.ai_analysis import AIAnalysisUpdate
from app.selectors import ai_selector, tree_selector
from app.services import storage_service


async def analyze_tree_photo(
    db: AsyncSession,
    tree_id: uuid.UUID,
    file_bytes: bytes,
    content_type: str,
    uploaded_by_id: uuid.UUID,
) -> AIAnalysis:
    """
    Runs the full scan pipeline for one tree: validates the tree exists,
    uploads the photo, runs the AI agent, then persists BOTH the raw
    AIAnalysis (immutable model output) AND a linked Report (the
    actionable record every "latest scan" / reports view reads from).
    A tree_id is required by the route itself, so every scan is always
    unambiguously tied to one tree — there is no "unassigned" scan.
    """
    tree = await tree_selector.get_by_id(db, tree_id)
    if not tree:
        raise NotFoundError("Tree not found")

    # Upload first so we never lose the photo even if the agent call fails.
    object_path, signed_url = storage_service.upload_tree_photo(file_bytes, content_type, tree_id)

    image_base64 = base64.b64encode(file_bytes).decode("utf-8")
    result = await run_tree_health_agent(image_base64, content_type)

    analysis = AIAnalysis(
        image_url=signed_url,
        image_path=object_path,
        status=result.status,
        level=result.level,
        issue=result.issue,
        detail=result.detail,
        action=result.action,
        confidence=result.confidence,
        metrics=result.metrics.model_dump(),
        raw_agent_output=result.model_dump(),
        tree_id=tree_id,
        uploaded_by_id=uploaded_by_id,
    )
    db.add(analysis)
    await db.flush()  # assigns analysis.id without committing yet

    report = Report(
        title=result.issue,
        notes=result.detail,
        action_taken=result.action,
        severity=result.level,
        tree_id=tree_id,
        ai_analysis_id=analysis.id,
        created_by_id=uploaded_by_id,
    )
    db.add(report)

    await db.commit()
    await db.refresh(analysis)

    # Not a real column — attached only so this response can surface the
    # linked report's id without a second round trip or a schema change
    # to the shared AIAnalysisRead model.
    analysis.report_id = report.id  # type: ignore[attr-defined]

    return analysis


async def update_analysis(db: AsyncSession, analysis_id: uuid.UUID, data: AIAnalysisUpdate) -> AIAnalysis:
    analysis = await ai_selector.get_by_id(db, analysis_id)
    if not analysis:
        raise NotFoundError("AI analysis not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(analysis, field, value)

    await db.commit()
    await db.refresh(analysis)
    return analysis


async def delete_analysis(db: AsyncSession, analysis_id: uuid.UUID) -> None:
    analysis = await ai_selector.get_by_id(db, analysis_id)
    if not analysis:
        raise NotFoundError("AI analysis not found")

    try:
        storage_service.delete_tree_photo(analysis.image_path)
    except Exception:  # noqa: BLE001 - don't block DB cleanup on storage hiccups
        pass

    await db.delete(analysis)
    await db.commit()
