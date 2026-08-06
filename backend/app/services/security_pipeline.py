from sqlalchemy.orm import Session

from app.utils.scanner import collect_database_health

from app.features.analyzer.service import analyze_query

from app.features.threat_detection.service import detect_threat
from app.features.threat_detection.schemas import (
    ThreatDetectionRequest,
)

from app.features.ai.service import generate_recommendation
from app.features.ai.schemas import AIRecommendationRequest

from app.services.response_engine import determine_actions


def run_security_pipeline(
    db: Session,
    sample_query: str,
):
    """
    Runs the complete security pipeline.

    Health Scan
        ↓
    SQL Analyzer
        ↓
    Threat Detection
        ↓
    AI Recommendation
        ↓
    Response Engine
    """

    # ----------------------------------
    # Step 1 - Database Health
    # ----------------------------------

    health = collect_database_health(db)

    # ----------------------------------
    # Step 2 - SQL Analysis
    # ----------------------------------

    analyzer_result = analyze_query(sample_query)

    # ----------------------------------
    # Step 3 - Threat Detection
    # ----------------------------------

    critical = 1 if analyzer_result.severity == "Critical" else 0
    high = 1 if analyzer_result.severity == "High" else 0
    medium = 1 if analyzer_result.severity == "Medium" else 0
    low = 1 if analyzer_result.severity == "Low" else 0

    threat_result = detect_threat(
        ThreatDetectionRequest(
            vulnerability_count=(
                critical
                + high
                + medium
                + low
            ),
            critical_count=critical,
            high_count=high,
            medium_count=medium,
            low_count=low,
        )
    )

    # ----------------------------------
    # Step 4 - AI Recommendation
    # ----------------------------------

    ai_result = generate_recommendation(
        AIRecommendationRequest(
            overall_risk=threat_result.overall_risk,
            risk_score=threat_result.risk_score,
        )
    )

    # ----------------------------------
    # Step 5 - Build Pipeline Result
    # ----------------------------------

    pipeline_result = {
        "database_health": health,
        "sql_analysis": analyzer_result.model_dump(),
        "threat_detection": threat_result.model_dump(),
        "ai_recommendation": ai_result.model_dump(),
    }

    # ----------------------------------
    # Step 6 - Execute Automated Actions
    # ----------------------------------

    response_actions = determine_actions(
        db,
        pipeline_result,
    )

    pipeline_result["response_actions"] = response_actions

    return pipeline_result