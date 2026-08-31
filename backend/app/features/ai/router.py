from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.user import User

from app.features.ai.schemas import (
    AIRecommendationRequest,
    AIRecommendationResponse,
)

from app.features.ai.service import (
    generate_recommendation,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Recommendation Engine"],
)


@router.post(
    "/recommend",
    response_model=AIRecommendationResponse,
)
def recommend(
    request: AIRecommendationRequest,
    current_user: User = Depends(get_current_user),
):
    return generate_recommendation(request)