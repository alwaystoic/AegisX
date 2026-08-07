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

    total_users = db.query(User).count()

    total_databases = db.query(Database).count()

    total_scans = db.query(Scan).count()

    completed_scans = (
        db.query(Scan)
        .filter(Scan.status == "Completed")
        .count()
    )

    total_threats = db.query(Threat).count()

    critical_threats = (
        db.query(Threat)
        .filter(
            func.lower(Threat.severity) == "critical"
        )
        .count()
    )

    total_incidents = db.query(Incident).count()

    # ----------------------------
    # Security Score
    # ----------------------------

    security_score = max(
        0,
        100 - (
            critical_threats * 15
            + total_incidents * 5
        ),
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

    return DashboardSummaryResponse(
        security_score=security_score,
        total_users=total_users,
        total_databases=total_databases,
        total_scans=total_scans,
        completed_scans=completed_scans,
        total_threats=total_threats,
        critical_threats=critical_threats,
        total_incidents=total_incidents,
        system_status=system_status,
    )