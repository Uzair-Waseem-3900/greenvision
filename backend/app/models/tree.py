import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Tree(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "trees"
    __table_args__ = (
        Index("ix_trees_park_id_species", "park_id", "species"),
    )

    label: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g. "White Oak #114"
    species: Mapped[str | None] = mapped_column(String(150), nullable=True)
    planted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    location_note: Mapped[str | None] = mapped_column(String(300), nullable=True)  # e.g. "near north gate"

    park_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("parks.id", ondelete="CASCADE"), nullable=False, index=True
    )

    park: Mapped["Park"] = relationship(back_populates="trees", lazy="noload")
    reports: Mapped[list["Report"]] = relationship(
        back_populates="tree", lazy="noload", cascade="all, delete-orphan"
    )
    ai_analyses: Mapped[list["AIAnalysis"]] = relationship(
        back_populates="tree", lazy="noload", cascade="all, delete-orphan"
    )
