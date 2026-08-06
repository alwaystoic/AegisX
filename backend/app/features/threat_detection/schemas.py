from pydantic import BaseModel


class ThreatDetectionRequest(BaseModel):
    vulnerability_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int


class ThreatDetectionResponse(BaseModel):
    overall_risk: str
    risk_score: int
    confidence: int
    recommendation: str