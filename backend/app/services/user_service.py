import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserUpdate
from app.selectors import user_selector


async def update_user(db: AsyncSession, requester_id: uuid.UUID, target_id: uuid.UUID, data: UserUpdate) -> User:
    if requester_id != target_id:
        raise ForbiddenError("You can only update your own account")

    user = await user_selector.get_by_id(db, target_id)
    if not user:
        raise NotFoundError("User not found")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.password is not None:
        user.hashed_password = hash_password(data.password)

    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, requester_id: uuid.UUID, target_id: uuid.UUID) -> None:
    if requester_id != target_id:
        raise ForbiddenError("You can only delete your own account")

    user = await user_selector.get_by_id(db, target_id)
    if not user:
        raise NotFoundError("User not found")

    await db.delete(user)
    await db.commit()
