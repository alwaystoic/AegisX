from app.features.ai.schemas import (
    AIRecommendationRequest,
    AIRecommendationResponse,
)


def generate_recommendation(
    request: AIRecommendationRequest,
) -> AIRecommendationResponse:

    overall_risk = request.overall_risk.upper()
    risk_score = request.risk_score

    if overall_risk == "CRITICAL":
        summary = (
            "The scan indicates a critical security posture with multiple "
            "high-risk vulnerabilities requiring immediate attention."
        )

        priority = "Immediate"

        actions = [
            "Review all critical vulnerabilities immediately.",
            "Restrict unnecessary user privileges.",
            "Enable SSL if it is disabled.",
            "Review audit logs for suspicious activities.",
            "Perform a complete security scan after remediation.",
        ]

    elif overall_risk == "HIGH":
        summary = (
            "The database contains several high-risk vulnerabilities that "
            "should be addressed as soon as possible."
        )

        priority = "High"

        actions = [
            "Fix high-risk vulnerabilities first.",
            "Review database permissions.",
            "Update outdated configurations.",
            "Run another scan after applying fixes.",
        ]

    elif overall_risk == "MEDIUM":
        summary = (
            "The database has moderate security issues that should be "
            "resolved during the next maintenance cycle."
        )

        priority = "Medium"

        actions = [
            "Resolve medium-risk findings.",
            "Monitor database activity regularly.",
            "Review user access periodically.",
        ]

    else:
        summary = (
            "The database appears to be secure. Continue following "
            "security best practices."
        )

        priority = "Low"

        actions = [
            "Continue routine monitoring.",
            "Keep PostgreSQL updated.",
            "Perform scheduled vulnerability scans.",
        ]

    return AIRecommendationResponse(
        summary=summary,
        priority=priority,
        recommended_actions=actions,
    )