from app.features.threat_detection.schemas import (
    ThreatDetectionRequest,
    ThreatDetectionResponse,
)


def detect_threat(
    request: ThreatDetectionRequest,
) -> ThreatDetectionResponse:

    risk_score = (
        request.critical_count * 25
        + request.high_count * 15
        + request.medium_count * 8
        + request.low_count * 3
    )

    # Cap the score at 100
    risk_score = min(risk_score, 100)

    # Determine overall risk
    if risk_score >= 80:
        overall_risk = "Critical"
    elif risk_score >= 60:
        overall_risk = "High"
    elif risk_score >= 40:
        overall_risk = "Medium"
    else:
        overall_risk = "Low"

    # Confidence calculation
    confidence = min(
        100,
        60 + request.vulnerability_count,
    )

    # Recommendation
    if overall_risk == "Critical":
        recommendation = (
            "Immediate remediation required. Resolve critical vulnerabilities first."
        )
    elif overall_risk == "High":
        recommendation = (
            "Prioritize fixing high-risk vulnerabilities as soon as possible."
        )
    elif overall_risk == "Medium":
        recommendation = (
            "Address medium-risk issues during the next maintenance cycle."
        )
    else:
        recommendation = (
            "Continue regular monitoring and security best practices."
        )

    return ThreatDetectionResponse(
        overall_risk=overall_risk,
        risk_score=risk_score,
        confidence=confidence,
        recommendation=recommendation,
    )