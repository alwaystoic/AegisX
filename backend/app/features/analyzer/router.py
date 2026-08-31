from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.user import User

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
def analyze(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
):
    return analyze_query(request.query)