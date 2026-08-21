from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.features.audit_logs.schemas import (
    AuditLogListResponse,
    AuditLogResponse,
)


def get_audit_logs(
    db: Session,
) -> AuditLogListResponse:
    """
    Return all active audit logs ordered from newest to oldest.
    """

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.is_active.is_(True))
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return AuditLogListResponse(
        total=len(logs),
        logs=[
            AuditLogResponse.model_validate(log)
            for log in logs
        ],
    )


def get_audit_log(
    db: Session,
    log_id: int,
) -> AuditLogResponse | None:
    """
    Return a single audit log by ID.
    """

    log = (
        db.query(AuditLog)
        .filter(
            AuditLog.id == log_id,
            AuditLog.is_active.is_(True),
        )
        .first()
    )

    if log is None:
        return None

    return AuditLogResponse.model_validate(log)