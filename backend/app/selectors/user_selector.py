import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def exists_by_email(db: AsyncSession, email: str) -> bool:
    result = await db.execute(select(User.id).where(User.email == email))
    return result.scalar_one_or_none() is not None


async def list_users(db: AsyncSession, offset: int, limit: int) -> tuple[list[User], int]:
    from sqlalchemy import func

    items_result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    count_result = await db.execute(select(func.count()).select_from(User))
    return list(items_result.scalars().all()), count_result.scalar_one()
