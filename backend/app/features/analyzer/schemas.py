from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str


class QueryAnalysisResponse(BaseModel):
    safe: bool
    severity: str
    risk_score: int
    threat: str
    recommendation: str