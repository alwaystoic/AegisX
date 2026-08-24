from pydantic import BaseModel
from typing import List


class QueryRequest(BaseModel):
    query: str


class QueryFinding(BaseModel):
    """
    Represents one security finding detected in a SQL query.
    """

    rule: str
    severity: str
    risk_score: int
    threat: str
    recommendation: str


class QueryAnalysisResponse(BaseModel):
    """
    Complete SQL analysis result.

    A single query can contain multiple security findings.
    """

    safe: bool
    risk_score: int
    severity: str
    findings: List[QueryFinding]