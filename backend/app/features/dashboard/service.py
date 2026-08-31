from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User
from app.models.database import Database
from app.models.scan import Scan
from app.models.threat import Threat
from app.models.incident import Incident

from app.features.dashboard.schemas import (
    DashboardSummaryResponse,
)


def get_dashboard_summary(
    db: Session,
) -> DashboardSummaryResponse:

    # ============================================================
    # BASIC STATISTICS
    # ============================================================

    total_users = db.query(User).count()

    total_databases = db.query(Database).count()

    total_scans = db.query(Scan).count()

    completed_scans = (
        db.query(Scan)
        .filter(
            func.lower(Scan.status) == "completed"
        )
        .count()
    )

    # ============================================================
    # THREAT STATISTICS
    # ============================================================

    total_threats = db.query(Threat).count()

    critical_threats = (
        db.query(Threat)
        .filter(
            func.lower(Threat.severity) == "critical"
        )
        .count()
    )

    high_threats = (
        db.query(Threat)
        .filter(
            func.lower(Threat.severity) == "high"
        )
        .count()
    )

    medium_threats = (
        db.query(Threat)
        .filter(
            func.lower(Threat.severity) == "medium"
        )
        .count()
    )

    low_threats = (
        db.query(Threat)
        .filter(
            func.lower(Threat.severity) == "low"
        )
        .count()
    )

    # ============================================================
    # INCIDENT STATISTICS
    # ============================================================

    total_incidents = db.query(Incident).count()

    # ============================================================
    # SECURITY SCORE
    # ============================================================
    #
    # The security score represents the CURRENT security posture.
    #
    # Historical incidents are intentionally NOT included in the
    # score because an old/resolved incident should not permanently
    # reduce the current security posture.
    #
    # Threat weights:
    #
    # Critical = 8
    # High     = 4
    # Medium   = 2
    # Low      = 1
    #
    # Instead of directly subtracting threat points from 100,
    # we normalize the risk using:
    #
    #     score = 100 * 100 / (100 + weighted_risk)
    #
    # This keeps the score between 0 and 100 and prevents the
    # dashboard from becoming 0 simply because many threats exist.
    # ============================================================

    weighted_risk = (
        critical_threats * 8
        + high_threats * 4
        + medium_threats * 2
        + low_threats * 1
    )

    security_score = round(
        (100 * 100) / (100 + weighted_risk)
    )

    # Safety clamp: score must always remain between 0 and 100.
    security_score = max(
        0,
        min(100, security_score),
    )

    # ============================================================
    # SYSTEM STATUS
    # ============================================================

    if security_score >= 80:
        system_status = "Healthy"

    elif security_score >= 60:
        system_status = "Warning"

    else:
        system_status = "Critical"

    # ============================================================
    # DASHBOARD RESPONSE
    # ============================================================

    return DashboardSummaryResponse(
        security_score=security_score,
        total_users=total_users,
        total_databases=total_databases,
        total_scans=total_scans,
        completed_scans=completed_scans,
        total_threats=total_threats,
        critical_threats=critical_threats,
        high_threats=high_threats,
        medium_threats=medium_threats,
        low_threats=low_threats,
        total_incidents=total_incidents,
        system_status=system_status,
    )