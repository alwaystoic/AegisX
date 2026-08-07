from datetime import datetime

from sqlalchemy.orm import Session

from app.features.dashboard.service import (
    get_dashboard_summary,
)

from app.features.reports.schemas import (
    ReportResponse,
)


def generate_security_report(
    db: Session,
) -> ReportResponse:

    dashboard = get_dashboard_summary(db)

    recommendations = []

    if dashboard.system_status == "Healthy":
        recommendations.extend(
            [
                "Continue routine monitoring.",
                "Perform regular security scans.",
                "Keep PostgreSQL and dependencies updated.",
            ]
        )

    elif dashboard.system_status == "Warning":
        recommendations.extend(
            [
                "Investigate unresolved threats.",
                "Review recent incidents.",
                "Increase scan frequency.",
            ]
        )

    else:
        recommendations.extend(
            [
                "Immediate security review required.",
                "Resolve critical threats immediately.",
                "Investigate all open incidents.",
            ]
        )

    return ReportResponse(
        generated_at=datetime.utcnow(),
        security_score=dashboard.security_score,
        system_status=dashboard.system_status,
        total_users=dashboard.total_users,
        total_databases=dashboard.total_databases,
        total_scans=dashboard.total_scans,
        completed_scans=dashboard.completed_scans,
        total_threats=dashboard.total_threats,
        critical_threats=dashboard.critical_threats,
        total_incidents=dashboard.total_incidents,
        recommendations=recommendations,
    )