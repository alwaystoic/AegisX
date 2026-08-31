from typing import List

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=10000,
    )


class QueryFinding(BaseModel):
    """
    Represents one security finding detected in a SQL query.
    """

    rule: str
    severity: str
    risk_score: int = Field(ge=0, le=100)
    threat: str
    recommendation: str


class QueryAnalysisResponse(BaseModel):
    """
    Complete SQL analysis result.

    A single query can contain multiple security findings.
    """

    safe: bool
    risk_score: int = Field(ge=0, le=100)
    severity: str
    threat: str
    recommendation: str
    findings: List[QueryFinding]