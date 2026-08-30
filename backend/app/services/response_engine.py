from typing import Dict

from sqlalchemy.orm import Session

from app.features.incidents.service import (
    create_incident,
    get_active_incident,
)

from app.features.incidents.schemas import IncidentCreate

from app.features.audit.service import create_audit_log
from app.features.audit.schemas import AuditLogCreate


def determine_actions(
    db: Session,
    pipeline_result: Dict,
):
    """
    Executes automated response actions based on
    the security pipeline result.

    Critical:
        - Reuse an existing active incident if present
        - Create an incident if one does not exist
        - Write an audit log when creating an incident
        - Queue notification action

    High:
        - Reuse an existing active incident if present
        - Create an incident if one does not exist
        - Write an audit log when creating an incident

    Medium:
        - Write an audit log

    Low:
        - Write an audit log
    """

    actions = []

    threat = pipeline_result["threat_detection"]
    sql_analysis = pipeline_result["sql_analysis"]

    risk = threat["overall_risk"]
    risk_score = threat["risk_score"]

    findings = sql_analysis.get("findings", [])

    incident = None

    # ============================================================
    # CRITICAL RISK
    # ============================================================

    if risk == "Critical":

        incident_title = "Critical Database Threat"

        existing_incident = get_active_incident(
            db,
            title=incident_title,
            severity="Critical",
        )

        if existing_incident is not None:

            incident = existing_incident

            actions.append("incident_already_exists")

        else:

            incident = create_incident(
                db,
                IncidentCreate(
                    title=incident_title,
                    description=(
                        "Critical database security threat detected."
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
                        f"Risk score: {risk_score}. "
                        f"Findings: {len(findings)}. "
                        f"Incident #{incident.id} created automatically."
                    ),
                ),
            )

            actions.append("incident_created")
            actions.append("write_audit_log")

        # Critical threats always trigger notification.
        actions.append("send_notification")

    # ============================================================
    # HIGH RISK
    # ============================================================

    elif risk == "High":

        incident_title = "High Risk Database Threat"

        existing_incident = get_active_incident(
            db,
            title=incident_title,
            severity="High",
        )

        if existing_incident is not None:

            incident = existing_incident

            actions.append("incident_already_exists")

        else:

            incident = create_incident(
                db,
                IncidentCreate(
                    title=incident_title,
                    description=(
                        "High-risk database security threat detected."
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
                        f"Risk score: {risk_score}. "
                        f"Findings: {len(findings)}. "
                        f"Incident #{incident.id} created automatically."
                    ),
                ),
            )

            actions.append("incident_created")
            actions.append("write_audit_log")

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
                details=(
                    "Medium-risk threat detected. "
                    f"Risk score: {risk_score}. "
                    f"Findings: {len(findings)}."
                ),
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
                details=(
                    "Low-risk security scan completed successfully. "
                    f"Risk score: {risk_score}."
                ),
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
            if incident is not None
            else None
        ),
    }