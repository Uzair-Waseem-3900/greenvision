import uuid

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    parks: Mapped[list["Park"]] = relationship(back_populates="created_by", lazy="noload")
    reports: Mapped[list["Report"]] = relationship(back_populates="created_by", lazy="noload")
    ai_analyses: Mapped[list["AIAnalysis"]] = relationship(back_populates="uploaded_by", lazy="noload")
