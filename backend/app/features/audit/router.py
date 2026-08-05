from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.auth.dependencies import get_current_user

from app.features.audit.schemas import (
    AuditLogCreate,
    AuditLogUpdate,
    AuditLogResponse,
)

from app.features.audit.service import (
    create_audit_log,
    get_all_audit_logs,
    get_audit_log_by_id,
    update_audit_log,
    delete_audit_log,
)

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.post(
    "/",
    response_model=AuditLogResponse,
)
def create_new_audit_log(
    audit_log: AuditLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_audit_log(db, audit_log)


@router.get(
    "/",
    response_model=list[AuditLogResponse],
)
def read_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_all_audit_logs(db)


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogResponse,
)
def read_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    audit_log = get_audit_log_by_id(db, audit_log_id)

    if audit_log is None:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found",
        )

    return audit_log


@router.put(
    "/{audit_log_id}",
    response_model=AuditLogResponse,
)
def update_existing_audit_log(
    audit_log_id: int,
    updated_audit_log: AuditLogUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    audit_log = update_audit_log(
        db,
        audit_log_id,
        updated_audit_log,
    )

    if audit_log is None:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found",
        )

    return audit_log


@router.delete(
    "/{audit_log_id}",
)
def remove_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    audit_log = delete_audit_log(
        db,
        audit_log_id,
    )

    if audit_log is None:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found",
        )

    return {
        "message": "Audit log deleted successfully"
    }