from fastapi import APIRouter

from app.features.threat_detection.schemas import (
    ThreatDetectionRequest,
    ThreatDetectionResponse,
)

from app.features.threat_detection.service import (
    detect_threat,
)

router = APIRouter(
    prefix="/threat-detection",
    tags=["Threat Detection Engine"],
)


@router.post(
    "/analyze",
    response_model=ThreatDetectionResponse,
)
def analyze(request: ThreatDetectionRequest):

    return detect_threat(request)