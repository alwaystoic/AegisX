from typing import Dict

from sqlalchemy.orm import Session

from app.features.incidents.service import create_incident
from app.features.incidents.schemas import IncidentCreate

from app.features.audit.service import create_audit_log
from app.features.audit.schemas import AuditLogCreate


def determine_actions(
    db: Session,
    pipeline_result: Dict,
):
    """
    Executes automated actions based on
    the pipeline result.
    """

    actions = []

    threat = pipeline_result["threat_detection"]

    risk = threat["overall_risk"]

    incident = None

    # ============================================================
    # CRITICAL RISK
    # ============================================================

    if risk == "Critical":

        incident = create_incident(
            db,
            IncidentCreate(
                title="Critical Database Threat",
                description=(
                    pipeline_result["sql_analysis"]["threat"]
                ),
                severity="Critical",
            ),
        )

        create_audit_log(
            db,
            AuditLogCreate(
                username="system",
                action="Automatic Incident Creation",
                resource="Security Pipeline",
                details=(
                    "Critical threat detected. "
                    "Incident created automatically."
                ),
            ),
        )

        actions.extend(
            [
                "incident_created",
                "write_audit_log",
                "send_notification",
            ]
        )

    # ============================================================
    # HIGH RISK
    # ============================================================

    elif risk == "High":

        incident = create_incident(
            db,
            IncidentCreate(
                title="High Risk Database Threat",
                description=(
                    pipeline_result["sql_analysis"]["threat"]
                ),
                severity="High",
            ),
        )

        create_audit_log(
            db,
            AuditLogCreate(
                username="system",
                action="Automatic Incident Creation",
                resource="Security Pipeline",
                details=(
                    "High-risk threat detected. "
                    "Incident created automatically."
                ),
            ),
        )

        actions.extend(
            [
                "incident_created",
                "write_audit_log",
            ]
        )

    # ============================================================
    # MEDIUM RISK
    # ============================================================

    elif risk == "Medium":

        create_audit_log(
            db,
            AuditLogCreate(
                username="system",
                action="Security Scan",
                resource="Security Pipeline",
                details="Medium-risk threat detected.",
            ),
        )

        actions.append("write_audit_log")

    # ============================================================
    # LOW RISK
    # ============================================================

    elif risk == "Low":

        create_audit_log(
            db,
            AuditLogCreate(
                username="system",
                action="Security Scan",
                resource="Security Pipeline",
                details="Low-risk security scan completed successfully.",
            ),
        )

        actions.append("write_audit_log")

    # ============================================================
    # RETURN RESPONSE
    # ============================================================

    return {
        "overall_risk": risk,
        "actions": actions,
        "incident_id": (
            incident.id
            if incident
            else None
        ),
    }