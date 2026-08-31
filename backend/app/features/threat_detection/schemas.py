from pydantic import BaseModel, Field


class ThreatDetectionRequest(BaseModel):
    vulnerability_count: int = Field(ge=0)
    critical_count: int = Field(ge=0)
    high_count: int = Field(ge=0)
    medium_count: int = Field(ge=0)
    low_count: int = Field(ge=0)


class ThreatDetectionResponse(BaseModel):
    overall_risk: str
    risk_score: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    recommendation: str