import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.park import Park
from app.schemas.park import ParkCreate, ParkUpdate
from app.selectors import park_selector


async def create_park(db: AsyncSession, data: ParkCreate, created_by_id: uuid.UUID) -> Park:
    park = Park(
        name=data.name,
        address=data.address,
        description=data.description,
        latitude=data.latitude,
        longitude=data.longitude,
        created_by_id=created_by_id,
    )
    db.add(park)
    await db.commit()
    await db.refresh(park)
    return park


async def update_park(db: AsyncSession, park_id: uuid.UUID, data: ParkUpdate) -> Park:
    park = await park_selector.get_by_id(db, park_id)
    if not park:
        raise NotFoundError("Park not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(park, field, value)

    await db.commit()
    await db.refresh(park)
    return park


async def delete_park(db: AsyncSession, park_id: uuid.UUID) -> None:
    park = await park_selector.get_by_id(db, park_id)
    if not park:
        raise NotFoundError("Park not found")

    await db.delete(park)
    await db.commit()
