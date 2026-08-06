from pydantic import BaseModel
from typing import List


class AIRecommendationRequest(BaseModel):
    overall_risk: str
    risk_score: int


class AIRecommendationResponse(BaseModel):
    summary: str
    priority: str
    recommended_actions: List[str]