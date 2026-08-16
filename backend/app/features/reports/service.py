from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.features.dashboard.service import get_dashboard_summary

from app.features.reports.schemas import ReportResponse


def generate_security_report(
    db: Session,
) -> ReportResponse:

    dashboard = get_dashboard_summary(db)

    recommendations: list[str] = []

    system_status = str(
        getattr(
            dashboard,
            "system_status",
            "Healthy",
        )
    )

    if system_status == "Healthy":

        recommendations.extend(
            [
                "Continue routine monitoring.",
                "Perform regular security scans.",
                "Keep PostgreSQL and dependencies updated.",
            ]
        )

    elif system_status == "Warning":

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
        generated_at=datetime.now(timezone.utc),

        security_score=int(
            getattr(dashboard, "security_score", 0)
        ),

        system_status=system_status,

        total_users=int(
            getattr(dashboard, "total_users", 0)
        ),

        total_databases=int(
            getattr(dashboard, "total_databases", 0)
        ),

        total_scans=int(
            getattr(dashboard, "total_scans", 0)
        ),

        completed_scans=int(
            getattr(dashboard, "completed_scans", 0)
        ),

        total_threats=int(
            getattr(dashboard, "total_threats", 0)
        ),

        critical_threats=int(
            getattr(dashboard, "critical_threats", 0)
        ),

        total_incidents=int(
            getattr(dashboard, "total_incidents", 0)
        ),

        recommendations=recommendations,
    )