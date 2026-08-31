from typing import List

from pydantic import BaseModel, Field


class AIRecommendationRequest(BaseModel):
    overall_risk: str = Field(min_length=1)
    risk_score: int = Field(ge=0, le=100)


class AIRecommendationResponse(BaseModel):
    summary: str
    priority: str
    recommended_actions: List[str]