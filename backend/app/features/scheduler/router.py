from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres import get_db

from app.features.scheduler.schemas import (
    SchedulerStatusResponse,
    ScheduledScanCreate,
    ScheduledScanUpdate,
    ScheduledScanResponse,
)

from app.features.scheduler.service import (
    get_scheduler_status,
    start_scheduler,
    stop_scheduler,
    create_scheduled_scan,
    get_scheduled_scans,
    get_scheduled_scan,
    update_scheduled_scan,
    delete_scheduled_scan,
)


router = APIRouter(
    prefix="/scheduler",
    tags=["Scheduler"],
)


# ============================================================
# SCHEDULER CONTROL
# ============================================================


@router.get(
    "/status",
    response_model=SchedulerStatusResponse,
)
def scheduler_status():

    return get_scheduler_status()


@router.post(
    "/start",
    response_model=SchedulerStatusResponse,
)
def scheduler_start():

    return start_scheduler()


@router.post(
    "/stop",
    response_model=SchedulerStatusResponse,
)
def scheduler_stop():

    return stop_scheduler()


# ============================================================
# SCHEDULED SCANS
# ============================================================


@router.post(
    "/scans",
    response_model=ScheduledScanResponse,
)
def create_scan(
    scan: ScheduledScanCreate,
    db: Session = Depends(get_db),
):

    return create_scheduled_scan(
        db,
        scan,
    )


@router.get(
    "/scans",
    response_model=list[ScheduledScanResponse],
)
def list_scans(
    db: Session = Depends(get_db),
):

    return get_scheduled_scans(db)


@router.get(
    "/scans/{scan_id}",
    response_model=ScheduledScanResponse,
)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
):

    scan = get_scheduled_scan(
        db,
        scan_id,
    )

    if scan is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Scheduled scan not found.",
        )

    return scan


@router.put(
    "/scans/{scan_id}",
    response_model=ScheduledScanResponse,
)
def update_scan(
    scan_id: int,
    scan: ScheduledScanUpdate,
    db: Session = Depends(get_db),
):

    return update_scheduled_scan(
        db,
        scan_id,
        scan,
    )


@router.delete(
    "/scans/{scan_id}",
)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
):

    return delete_scheduled_scan(
        db,
        scan_id,
    )