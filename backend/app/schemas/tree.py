import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TreeCreate(BaseModel):
    label: str = Field(min_length=1, max_length=150)
    park_id: uuid.UUID
    species: str | None = Field(default=None, max_length=150)
    planted_date: date | None = None
    location_note: str | None = Field(default=None, max_length=300)


class TreeUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=150)
    species: str | None = Field(default=None, max_length=150)
    planted_date: date | None = None
    location_note: str | None = Field(default=None, max_length=300)


class TreeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    label: str
    species: str | None
    planted_date: date | None
    location_note: str | None
    park_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class TreeWithLatestStatus(TreeRead):
    latest_level: str | None = None
    latest_confidence: int | None = None
    latest_scanned_at: datetime | None = None
