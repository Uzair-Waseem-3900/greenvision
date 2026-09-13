import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# This is the schema the LangGraph agent's final node is forced to produce.
# Literal fields mean the model CANNOT invent a new status/level string —
# anything outside these values fails validation and triggers a retry.
# ---------------------------------------------------------------------------

HealthStatus = Literal["Healthy", "Moderate Stress", "High Stress"]
HealthLevelLiteral = Literal["healthy", "mild", "high"]


class HealthMetrics(BaseModel):
    canopy_density: int = Field(ge=0, le=100)
    leaf_color_index: int = Field(ge=0, le=100)
    symmetry: int = Field(ge=0, le=100)


class AIAnalysisResult(BaseModel):
    """Strict output contract the Gemini agent must satisfy."""
    status: HealthStatus
    level: HealthLevelLiteral
    issue: str = Field(min_length=1, max_length=200)
    detail: str = Field(min_length=1, max_length=800)
    action: str = Field(min_length=1, max_length=500)
    confidence: int = Field(ge=0, le=100)
    metrics: HealthMetrics


# ---------------------------------------------------------------------------
# API-facing schemas
# ---------------------------------------------------------------------------


class AIAnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    image_url: str
    status: str
    level: str
    issue: str
    detail: str
    action: str
    confidence: int
    metrics: dict
    reviewed: bool
    tree_id: uuid.UUID
    uploaded_by_id: uuid.UUID | None
    created_at: datetime


class AIAnalysisUpdate(BaseModel):
    """Human correction of an AI result — e.g. an arborist overrides it."""
    status: HealthStatus | None = None
    level: HealthLevelLiteral | None = None
    issue: str | None = Field(default=None, max_length=200)
    detail: str | None = Field(default=None, max_length=800)
    action: str | None = Field(default=None, max_length=500)
    reviewed: bool | None = None


class AIAnalysisFilters(BaseModel):
    park_id: uuid.UUID | None = None
    tree_id: uuid.UUID | None = None
    level: HealthLevelLiteral | None = None
    min_confidence: int | None = Field(default=None, ge=0, le=100)
    reviewed: bool | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
