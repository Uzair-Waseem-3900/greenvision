import enum
import uuid

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Index, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class HealthLevel(str, enum.Enum):
    HEALTHY = "healthy"
    MILD = "mild"
    HIGH = "high"


class AIAnalysis(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ai_analyses"
    __table_args__ = (Index("ix_ai_analyses_created_at", "created_at"),)

    image_url: Mapped[str] = mapped_column(String(600), nullable=False)
    image_path: Mapped[str] = mapped_column(String(400), nullable=False)  # storage object key

    status: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "Moderate Stress"
    level: Mapped[HealthLevel] = mapped_column(
        SAEnum(
            HealthLevel,
            name="health_level",
            values_callable=lambda enum_type: [member.value for member in enum_type],
        ),
        nullable=False,
        index=True,
    )
    issue: Mapped[str] = mapped_column(String(200), nullable=False)
    detail: Mapped[str] = mapped_column(String(800), nullable=False)
    action: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)

    # {"canopy_density": 74, "leaf_color_index": 61, "symmetry": 80}
    metrics: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Full raw agent trace, kept for audit/debugging — not exposed by default.
    raw_agent_output: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    reviewed: Mapped[bool] = mapped_column(default=False, nullable=False)

    tree_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("trees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    tree: Mapped["Tree"] = relationship(back_populates="ai_analyses", lazy="noload")
    uploaded_by: Mapped["User"] = relationship(back_populates="ai_analyses", lazy="noload")
    report: Mapped["Report"] = relationship(back_populates="ai_analysis", lazy="noload", uselist=False)
