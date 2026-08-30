from app.features.threat_detection.schemas import (
    ThreatDetectionRequest,
    ThreatDetectionResponse,
)


def detect_threat(
    request: ThreatDetectionRequest,
) -> ThreatDetectionResponse:
    """
    Threat Detection Engine v2

    Calculates risk using weighted vulnerability severity.
    """

    # ------------------------------------------------------------
    # Weighted Risk Score
    # ------------------------------------------------------------

    risk_score = (
        request.critical_count * 100
        + request.high_count * 75
        + request.medium_count * 50
        + request.low_count * 25
    )

    risk_score = min(risk_score, 100)

    # ------------------------------------------------------------
    # Overall Risk
    # ------------------------------------------------------------

    if risk_score >= 90:
        overall_risk = "Critical"

    elif risk_score >= 70:
        overall_risk = "High"

    elif risk_score >= 40:
        overall_risk = "Medium"

    else:
        overall_risk = "Low"

    # ------------------------------------------------------------
    # Confidence
    # ------------------------------------------------------------

    confidence = min(
        100,
        70 + (request.vulnerability_count * 5),
    )

    # ------------------------------------------------------------
    # Recommendation
    # ------------------------------------------------------------

    if overall_risk == "Critical":
        recommendation = (
            "Immediate remediation required. Resolve critical "
            "vulnerabilities before any further database operations."
        )

    elif overall_risk == "High":
        recommendation = (
            "Prioritize high-risk vulnerabilities and review "
            "database permissions."
        )

    elif overall_risk == "Medium":
        recommendation = (
            "Schedule remediation during the next maintenance "
            "window and continue monitoring."
        )

    else:
        recommendation = (
            "Continue routine monitoring and periodic security scans."
        )

    # ------------------------------------------------------------
    # Response
    # ------------------------------------------------------------

    return ThreatDetectionResponse(
        overall_risk=overall_risk,
        risk_score=risk_score,
        confidence=confidence,
        recommendation=recommendation,
    )