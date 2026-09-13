"""
Project-wide search implementation.

Every user-facing search/filter goes through search_ilike() — selectors
must never spell out a raw text-match lookup themselves. This is the single
place the substring lookup lives, so search behavior is uniform everywhere.

Behavior: case-insensitive substring match across the given columns (term
"ali" matches "Ali Park", "REALISTIC Ave", ...). On PostgreSQL/Supabase this
compiles to `col ILIKE '%term%'`, served by the pg_trgm GIN indexes created
in migration 0002 (see alembic/versions) — index-backed search, no
sequential scans.
"""
from sqlalchemy import or_
from sqlalchemy.sql.elements import ColumnElement


def search_ilike(term: str | None, *columns: ColumnElement):
    """
    Returns a SQLAlchemy boolean clause matching `term` as a case-insensitive
    substring in ANY of `columns`, or None if the term is blank/None.

    Callers apply it conditionally:

        clause = search_ilike(search, Park.name, Park.address)
        if clause is not None:
            query = query.where(clause)
    """
    if term is None:
        return None
    term = term.strip()
    if not term:
        return None

    pattern = f"%{term}%"
    return or_(*(column.ilike(pattern) for column in columns))
