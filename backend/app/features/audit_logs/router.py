from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.postgres import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.features.audit_logs.schemas import (
    AuditLogListResponse,
    AuditLogResponse,
)

from app.features.audit_logs.service import (
    get_audit_logs,
    get_audit_log,
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "/",
    response_model=AuditLogListResponse,
)
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all active audit logs.

    Requires an authenticated user.
    """

    return get_audit_logs(db)


@router.get(
    "/{log_id}",
    response_model=AuditLogResponse,
)
def audit_log_details(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single audit log by ID.

    Requires an authenticated user.
    """

    log = get_audit_log(
        db=db,
        log_id=log_id,
    )

    if log is None:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found.",
        )

    return log