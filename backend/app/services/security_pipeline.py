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
    Runs the complete AegisX security pipeline.

    Database Health
        ↓
    SQL Analyzer
        ↓
    Threat Detection
        ↓
    AI Recommendation
        ↓
    Response Engine

    A completely clean SQL query receives a baseline
    Low-risk score of 25 for pipeline monitoring.
    """

    # ============================================================
    # STEP 1 - DATABASE HEALTH
    # ============================================================

    health = collect_database_health(db)

    # ============================================================
    # STEP 2 - SQL ANALYSIS
    # ============================================================

    analyzer_result = analyze_query(sample_query)

    # ============================================================
    # STEP 3 - THREAT DETECTION
    # ============================================================

    findings = analyzer_result.findings

    critical = sum(
        1
        for finding in findings
        if finding.severity == "Critical"
    )

    high = sum(
        1
        for finding in findings
        if finding.severity == "High"
    )

    medium = sum(
        1
        for finding in findings
        if finding.severity == "Medium"
    )

    low = sum(
        1
        for finding in findings
        if finding.severity == "Low"
    )

    # A completely clean query has no findings.
    # The security pipeline intentionally assigns a baseline
    # Low-risk score of 25 for monitoring purposes.
    if len(findings) == 0:
        low = 1

    threat_result = detect_threat(
        ThreatDetectionRequest(
            vulnerability_count=len(findings),
            critical_count=critical,
            high_count=high,
            medium_count=medium,
            low_count=low,
        )
    )

    # ============================================================
    # STEP 4 - AI RECOMMENDATION
    # ============================================================

    ai_result = generate_recommendation(
        AIRecommendationRequest(
            overall_risk=threat_result.overall_risk,
            risk_score=threat_result.risk_score,
        )
    )

    # ============================================================
    # STEP 5 - BUILD PIPELINE RESULT
    # ============================================================

    pipeline_result = {
        "database_health": health,
        "sql_analysis": analyzer_result.model_dump(),
        "threat_detection": threat_result.model_dump(),
        "ai_recommendation": ai_result.model_dump(),
    }

    # ============================================================
    # STEP 6 - AUTOMATED RESPONSE
    # ============================================================

    response_actions = determine_actions(
        db,
        pipeline_result,
    )

    pipeline_result["response_actions"] = response_actions

    # ============================================================
    # FINAL RESULT
    # ============================================================

    return pipeline_result