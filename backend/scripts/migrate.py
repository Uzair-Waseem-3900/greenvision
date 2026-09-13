"""
Run database migrations manually.

    python scripts/migrate.py            # upgrade to latest
    python scripts/migrate.py head       # same as above
    python scripts/migrate.py -1         # downgrade one revision
    python scripts/migrate.py <revision> # upgrade/downgrade to a specific revision

This is now the ONLY way migrations run — they are intentionally not
triggered automatically on app startup, so you always know exactly when
schema changes are being applied.
"""
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402

from app.core.config import settings  # noqa: E402


def get_alembic_config() -> Config:
    cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_ROOT / "alembic"))
    cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("+asyncpg", ""))
    return cfg


def main() -> None:
    target = sys.argv[1] if len(sys.argv) > 1 else "head"
    cfg = get_alembic_config()

    if target.startswith("-") and target[1:].isdigit():
        print(f"Downgrading {target} revision(s)...")
        command.downgrade(cfg, target)
    else:
        print(f"Upgrading to '{target}'...")
        command.upgrade(cfg, target)

    print("Done.")


if __name__ == "__main__":
    main()
