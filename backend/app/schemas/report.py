import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SeverityLiteral = Literal["healthy", "mild", "high"]
StatusLiteral = Literal["open", "in_progress", "resolved"]


class ReportCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    tree_id: uuid.UUID
    severity: SeverityLiteral
    notes: str | None = Field(default=None, max_length=1000)
    ai_analysis_id: uuid.UUID | None = None


class ReportUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = Field(default=None, max_length=1000)
    action_taken: str | None = Field(default=None, max_length=500)
    severity: SeverityLiteral | None = None
    status: StatusLiteral | None = None


class ReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    notes: str | None
    action_taken: str | None
    severity: str
    status: str
    resolved_at: datetime | None
    tree_id: uuid.UUID
    ai_analysis_id: uuid.UUID | None
    created_by_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class ReportFilters(BaseModel):
    park_id: uuid.UUID | None = None
    tree_id: uuid.UUID | None = None
    severity: SeverityLiteral | None = None
    status: StatusLiteral | None = None
    has_ai_analysis: bool | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    sort_by: Literal["created_at", "updated_at", "severity", "status"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"
