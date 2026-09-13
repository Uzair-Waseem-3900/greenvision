"""enable pg_trgm and add search indexes

Revision ID: 0002_search_indexes
Revises: 0001_initial
Create Date: 2026-09-13

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0002_search_indexes"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_parks_name_trgm "
        "ON parks USING GIN (name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_parks_address_trgm "
        "ON parks USING GIN (address gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_trees_label_trgm "
        "ON trees USING GIN (label gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_trees_species_trgm "
        "ON trees USING GIN (species gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_trees_species_trgm")
    op.execute("DROP INDEX IF EXISTS ix_trees_label_trgm")
    op.execute("DROP INDEX IF EXISTS ix_parks_address_trgm")
    op.execute("DROP INDEX IF EXISTS ix_parks_name_trgm")
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
