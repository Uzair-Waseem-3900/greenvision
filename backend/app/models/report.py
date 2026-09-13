import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.ai_analysis import HealthLevel


class ReportStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class Report(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    An actionable record about a tree. May be generated from an AI analysis
    (ai_analysis_id set) or filed manually by a user (ai_analysis_id null),
    e.g. "storm damage observed" with no photo involved.
    """
    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_reports_tree_id_status", "tree_id", "status"),
        Index("ix_reports_severity_status", "severity", "status"),
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    action_taken: Mapped[str | None] = mapped_column(String(500), nullable=True)

    severity: Mapped[HealthLevel] = mapped_column(
        SAEnum(
            HealthLevel,
            name="health_level",
            create_type=False,
            values_callable=lambda enum_type: [member.value for member in enum_type],
        ),
        nullable=False,
        index=True,
    )
    status: Mapped[ReportStatus] = mapped_column(
        SAEnum(
            ReportStatus,
            name="report_status",
            values_callable=lambda enum_type: [member.value for member in enum_type],
        ),
        default=ReportStatus.OPEN,
        nullable=False,
        index=True,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    tree_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("trees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ai_analysis_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("ai_analyses.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    tree: Mapped["Tree"] = relationship(back_populates="reports", lazy="noload")
    ai_analysis: Mapped["AIAnalysis"] = relationship(back_populates="report", lazy="noload")
    created_by: Mapped["User"] = relationship(back_populates="reports", lazy="noload")
