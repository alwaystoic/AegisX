from fastapi import APIRouter

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
def recommend(request: AIRecommendationRequest):

    return generate_recommendation(request)