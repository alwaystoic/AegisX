from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str


class QueryAnalysisResponse(BaseModel):
    safe: bool
    severity: str
    threat: str
    recommendation: str