import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.tree import Tree
from app.schemas.tree import TreeCreate, TreeUpdate
from app.selectors import park_selector, tree_selector


async def create_tree(db: AsyncSession, data: TreeCreate) -> Tree:
    park = await park_selector.get_by_id(db, data.park_id)
    if not park:
        raise NotFoundError("Park not found")

    tree = Tree(
        label=data.label,
        species=data.species,
        planted_date=data.planted_date,
        location_note=data.location_note,
        park_id=data.park_id,
    )
    db.add(tree)
    await db.commit()
    await db.refresh(tree)
    return tree


async def update_tree(db: AsyncSession, tree_id: uuid.UUID, data: TreeUpdate) -> Tree:
    tree = await tree_selector.get_by_id(db, tree_id)
    if not tree:
        raise NotFoundError("Tree not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tree, field, value)

    await db.commit()
    await db.refresh(tree)
    return tree


async def delete_tree(db: AsyncSession, tree_id: uuid.UUID) -> None:
    tree = await tree_selector.get_by_id(db, tree_id)
    if not tree:
        raise NotFoundError("Tree not found")

    await db.delete(tree)
    await db.commit()
