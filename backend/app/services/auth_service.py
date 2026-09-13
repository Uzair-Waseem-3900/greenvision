from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
    InvalidTokenError,
)
from app.models.user import User
from app.schemas.auth import TokenPair
from app.schemas.user import UserCreate
from app.selectors import user_selector


async def register_user(db: AsyncSession, data: UserCreate) -> User:
    if await user_selector.exists_by_email(db, data.email):
        raise ConflictError("An account with this email already exists")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await user_selector.get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Incorrect email or password")
    if not user.is_active:
        raise UnauthorizedError("This account has been deactivated")
    return user


def issue_tokens(user: User) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> str:
    try:
        user_id = decode_token(refresh_token, TokenType.REFRESH)
    except InvalidTokenError as exc:
        raise UnauthorizedError(str(exc)) from exc

    import uuid as _uuid

    user = await user_selector.get_by_id(db, _uuid.UUID(user_id))
    if not user or not user.is_active:
        raise UnauthorizedError("User no longer active")

    return create_access_token(user.id)
