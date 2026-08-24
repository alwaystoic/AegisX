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

    # ----------------------------
    # Basic Statistics
    # ----------------------------

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

    # ----------------------------
    # Threat Statistics
    # ----------------------------

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

    # ----------------------------
    # Incident Statistics
    # ----------------------------

    total_incidents = db.query(Incident).count()

    # ----------------------------
    # Security Score
    # ----------------------------
    #
    # Security score is calculated from
    # detected threat severity.
    #
    # Historical incidents are NOT used
    # here because they should not permanently
    # reduce the security posture.
    #
    # Critical = 8 points
    # High     = 4 points
    # Medium   = 2 points
    # Low      = 1 point
    #

    threat_penalty = (
        critical_threats * 8
        + high_threats * 4
        + medium_threats * 2
        + low_threats * 1
    )

    security_score = max(
        0,
        min(
            100,
            100 - threat_penalty
        )
    )

    # ----------------------------
    # System Status
    # ----------------------------

    if security_score >= 80:
        system_status = "Healthy"

    elif security_score >= 60:
        system_status = "Warning"

    else:
        system_status = "Critical"

    # ----------------------------
    # Dashboard Response
    # ----------------------------

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