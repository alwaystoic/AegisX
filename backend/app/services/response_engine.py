from typing import Dict
from sqlalchemy.orm import Session

from app.features.incidents.service import create_incident
from app.features.incidents.schemas import IncidentCreate


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

        actions.extend(
            [
                "incident_created",
                "write_audit_log",
                "send_notification",
            ]
        )

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

        actions.extend(
            [
                "incident_created",
                "write_audit_log",
            ]
        )

    elif risk == "Medium":

        actions.append(
            "write_audit_log"
        )

    return {
        "overall_risk": risk,
        "actions": actions,
        "incident_id": (
            incident.id
            if incident
            else None
        ),
    }