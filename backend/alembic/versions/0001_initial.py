"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-09-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    health_level = postgresql.ENUM("healthy", "mild", "high", name="health_level")
    health_level.create(op.get_bind(), checkfirst=True)

    report_status = postgresql.ENUM("open", "in_progress", "resolved", name="report_status")
    report_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "parks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("address", sa.String(400), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column(
            "created_by_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_parks_name", "parks", ["name"])
    op.create_index("ix_parks_created_by_id", "parks", ["created_by_id"])

    op.create_table(
        "trees",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("label", sa.String(150), nullable=False),
        sa.Column("species", sa.String(150), nullable=True),
        sa.Column("planted_date", sa.Date(), nullable=True),
        sa.Column("location_note", sa.String(300), nullable=True),
        sa.Column(
            "park_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("parks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_trees_park_id", "trees", ["park_id"])
    op.create_index("ix_trees_park_id_species", "trees", ["park_id", "species"])

    op.create_table(
        "ai_analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("image_url", sa.String(600), nullable=False),
        sa.Column("image_path", sa.String(400), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("level", health_level, nullable=False),
        sa.Column("issue", sa.String(200), nullable=False),
        sa.Column("detail", sa.String(800), nullable=False),
        sa.Column("action", sa.String(500), nullable=False),
        sa.Column("confidence", sa.Integer(), nullable=False),
        sa.Column("metrics", sa.JSON(), nullable=False),
        sa.Column("raw_agent_output", sa.JSON(), nullable=True),
        sa.Column("reviewed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "tree_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("trees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "uploaded_by_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ai_analyses_level", "ai_analyses", ["level"])
    op.create_index("ix_ai_analyses_tree_id", "ai_analyses", ["tree_id"])
    op.create_index("ix_ai_analyses_uploaded_by_id", "ai_analyses", ["uploaded_by_id"])
    op.create_index("ix_ai_analyses_created_at", "ai_analyses", ["created_at"])

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("notes", sa.String(1000), nullable=True),
        sa.Column("action_taken", sa.String(500), nullable=True),
        sa.Column("severity", health_level, nullable=False),
        sa.Column("status", report_status, nullable=False, server_default="open"),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "tree_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("trees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "ai_analysis_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("ai_analyses.id", ondelete="SET NULL"),
            nullable=True,
            unique=True,
        ),
        sa.Column(
            "created_by_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_reports_tree_id", "reports", ["tree_id"])
    op.create_index("ix_reports_severity", "reports", ["severity"])
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_created_by_id", "reports", ["created_by_id"])
    op.create_index("ix_reports_tree_id_status", "reports", ["tree_id", "status"])
    op.create_index("ix_reports_severity_status", "reports", ["severity", "status"])


def downgrade() -> None:
    op.drop_table("reports")
    op.drop_table("ai_analyses")
    op.drop_table("trees")
    op.drop_table("parks")
    op.drop_table("users")

    postgresql.ENUM(name="report_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="health_level").drop(op.get_bind(), checkfirst=True)
