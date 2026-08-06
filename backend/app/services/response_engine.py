from typing import Dict


def determine_actions(
    pipeline_result: Dict,
):
    """
    Determines which automated actions should be executed
    after a security analysis.
    """

    actions = []

    threat = pipeline_result["threat_detection"]

    risk = threat["overall_risk"]

    if risk == "Critical":

        actions.extend(
            [
                "create_incident",
                "write_audit_log",
                "send_notification",
            ]
        )

    elif risk == "High":

        actions.extend(
            [
                "create_incident",
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
    }