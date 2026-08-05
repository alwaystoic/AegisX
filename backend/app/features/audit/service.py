from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

from app.features.audit.schemas import (
    AuditLogCreate,
    AuditLogUpdate,
)


def create_audit_log(
    db: Session,
    audit_log: AuditLogCreate,
):

    db_audit_log = AuditLog(
        username=audit_log.username,
        action=audit_log.action,
        resource=audit_log.resource,
        details=audit_log.details,
    )

    db.add(db_audit_log)
    db.commit()
    db.refresh(db_audit_log)

    return db_audit_log


def get_all_audit_logs(db: Session):
    return db.query(AuditLog).filter(
        AuditLog.is_active == True
    ).all()


def get_audit_log_by_id(
    db: Session,
    audit_log_id: int,
):
    return db.query(AuditLog).filter(
        AuditLog.id == audit_log_id,
        AuditLog.is_active == True
    ).first()


def update_audit_log(
    db: Session,
    audit_log_id: int,
    updated_audit_log: AuditLogUpdate,
):

    audit_log = get_audit_log_by_id(
        db,
        audit_log_id,
    )

    if audit_log is None:
        return None

    audit_log.username = updated_audit_log.username
    audit_log.action = updated_audit_log.action
    audit_log.resource = updated_audit_log.resource
    audit_log.details = updated_audit_log.details

    db.commit()
    db.refresh(audit_log)

    return audit_log


def delete_audit_log(
    db: Session,
    audit_log_id: int,
):

    audit_log = get_audit_log_by_id(
        db,
        audit_log_id,
    )

    if audit_log is None:
        return None

    audit_log.is_active = False

    db.commit()

    return audit_log