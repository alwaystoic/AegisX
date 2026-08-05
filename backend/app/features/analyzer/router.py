from fastapi import APIRouter

from app.features.analyzer.schemas import (
    QueryRequest,
    QueryAnalysisResponse,
)

from app.features.analyzer.service import (
    analyze_query,
)

router = APIRouter(
    prefix="/analyzer",
    tags=["SQL Query Analyzer"],
)


@router.post(
    "/analyze",
    response_model=QueryAnalysisResponse,
)
def analyze(request: QueryRequest):

    return analyze_query(request.query)