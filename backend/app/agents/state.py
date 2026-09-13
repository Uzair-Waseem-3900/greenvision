from typing import Literal, TypedDict

from pydantic import BaseModel, Field

from app.schemas.ai_analysis import AIAnalysisResult, HealthMetrics


class ObservationResult(BaseModel):
    species_guess: str = Field(description="Likely species/type, or 'unclear'")
    canopy_description: str = Field(max_length=500)
    visible_symptoms: list[str] = Field(default_factory=list, max_length=10)
    image_shows_plant: bool = Field(
        description="False if the image does not clearly show a tree or plant"
    )


class DiagnosisResult(BaseModel):
    level: Literal["healthy", "mild", "high"]
    status: Literal["Healthy", "Moderate Stress", "High Stress"]
    issue: str = Field(max_length=200)
    detail: str = Field(max_length=800)
    confidence: int = Field(ge=0, le=100)
    metrics: HealthMetrics


class RecommendationResult(BaseModel):
    action: str = Field(max_length=500)


class AgentState(TypedDict, total=False):
    image_base64: str
    mime_type: str
    observation: ObservationResult
    diagnosis: DiagnosisResult
    action: str
    result: AIAnalysisResult
    error: str
