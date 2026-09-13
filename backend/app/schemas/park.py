import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParkCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    address: str = Field(min_length=1, max_length=400)
    description: str | None = Field(default=None, max_length=1000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ParkUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    address: str | None = Field(default=None, min_length=1, max_length=400)
    description: str | None = Field(default=None, max_length=1000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ParkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    address: str
    description: str | None
    latitude: float | None
    longitude: float | None
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class ParkWithTreeCount(ParkRead):
    tree_count: int = 0
