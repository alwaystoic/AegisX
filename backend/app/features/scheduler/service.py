from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.features.scheduler.schemas import (
    SchedulerStatusResponse,
    ScheduledScanCreate,
    ScheduledScanUpdate,
    ScheduledScanResponse,
)

from app.models.scheduled_scan import ScheduledScan

from app.utils.task_scheduler import (
    start_scheduler as aps_start_scheduler,
    stop_scheduler as aps_stop_scheduler,
    add_job,
    remove_job,
    get_job,
)

from app.utils.scheduled_tasks import (
    run_security_pipeline_task,
)


# ============================================================
# SCHEDULER STATE
# ============================================================

scheduler_running = False
last_run = None


# ============================================================
# JOB HELPERS
# ============================================================

def get_job_id(scan_id: int) -> str:
    """Return the APScheduler job ID for a scheduled scan."""

    return f"scheduled_scan_{scan_id}"


def execute_scheduled_scan(
    scan_id: int,
    query: str,
):
    """
    Execute one persistent scheduled scan.
    """

    global last_run

    result = run_security_pipeline_task(query)

    last_run = datetime.utcnow().isoformat()

    return result


def register_scheduled_scan(
    scan: ScheduledScan,
):
    """
    Register a persistent scheduled scan with APScheduler.
    """

    job_id = get_job_id(scan.id)

    def scheduled_job():
        execute_scheduled_scan(
            scan.id,
            scan.query,
        )

    add_job(
        scheduled_job,
        job_id=job_id,
        minutes=scan.interval_minutes,
    )


def unregister_scheduled_scan(
    scan_id: int,
):
    """
    Remove a scheduled scan from APScheduler.
    """

    remove_job(
        get_job_id(scan_id)
    )


# ============================================================
# SCHEDULER STATUS
# ============================================================

def get_scheduler_status():

    jobs = [
        job
        for job in (
            __import__(
                "app.utils.task_scheduler",
                fromlist=["scheduler"],
            ).scheduler.get_jobs()
        )
        if job.id.startswith("scheduled_scan_")
    ]

    next_run = None

    if jobs:

        next_runs = [
            job.next_run_time
            for job in jobs
            if job.next_run_time is not None
        ]

        if next_runs:
            next_run = min(next_runs).replace(
                tzinfo=None
            ).isoformat()

    return SchedulerStatusResponse(
        scheduler_running=scheduler_running,
        interval_minutes=(
            jobs[0].trigger.interval.total_seconds() // 60
            if jobs
            else 1
        ),
        last_run=last_run,
        next_run=next_run,
    )


# ============================================================
# START SCHEDULER
# ============================================================

def start_scheduler():

    global scheduler_running

    if not scheduler_running:

        aps_start_scheduler()

        scheduler_running = True

        # Register all enabled persistent scans.
        from app.db.postgres import SessionLocal

        db = SessionLocal()

        try:

            scans = (
                db.query(ScheduledScan)
                .filter(
                    ScheduledScan.enabled.is_(True)
                )
                .all()
            )

            for scan in scans:

                register_scheduled_scan(
                    scan
                )

        finally:

            db.close()

    return get_scheduler_status()


# ============================================================
# STOP SCHEDULER
# ============================================================

def stop_scheduler():

    global scheduler_running

    if scheduler_running:

        from app.utils.task_scheduler import scheduler

        for job in scheduler.get_jobs():

            if job.id.startswith(
                "scheduled_scan_"
            ):
                scheduler.remove_job(
                    job.id
                )

        aps_stop_scheduler()

        scheduler_running = False

    return get_scheduler_status()


# ============================================================
# CREATE SCHEDULED SCAN
# ============================================================

def create_scheduled_scan(
    db: Session,
    scan: ScheduledScanCreate,
):

    scheduled_scan = ScheduledScan(
        name=scan.name,
        database_name=scan.database_name,
        query=scan.query,
        interval_minutes=scan.interval_minutes,
        enabled=True,
    )

    db.add(scheduled_scan)
    db.commit()
    db.refresh(scheduled_scan)

    # If scheduler is already running,
    # immediately register the new scan.
    if scheduler_running:

        register_scheduled_scan(
            scheduled_scan
        )

    return scheduled_scan


# ============================================================
# GET ALL SCHEDULED SCANS
# ============================================================

def get_scheduled_scans(
    db: Session,
):

    return (
        db.query(ScheduledScan)
        .order_by(
            ScheduledScan.id.asc()
        )
        .all()
    )


# ============================================================
# GET ONE SCHEDULED SCAN
# ============================================================

def get_scheduled_scan(
    db: Session,
    scan_id: int,
):

    return (
        db.query(ScheduledScan)
        .filter(
            ScheduledScan.id == scan_id
        )
        .first()
    )


# ============================================================
# UPDATE SCHEDULED SCAN
# ============================================================

def update_scheduled_scan(
    db: Session,
    scan_id: int,
    scan: ScheduledScanUpdate,
):

    scheduled_scan = get_scheduled_scan(
        db,
        scan_id,
    )

    if scheduled_scan is None:

        raise HTTPException(
            status_code=404,
            detail="Scheduled scan not found.",
        )

    update_data = scan.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        setattr(
            scheduled_scan,
            field,
            value,
        )

    db.commit()
    db.refresh(scheduled_scan)

    # Re-register the APScheduler job so
    # changed query / interval / enabled state
    # takes effect immediately.
    if scheduler_running:

        unregister_scheduled_scan(
            scheduled_scan.id
        )

        if scheduled_scan.enabled:

            register_scheduled_scan(
                scheduled_scan
            )

    return scheduled_scan


# ============================================================
# DELETE SCHEDULED SCAN
# ============================================================

def delete_scheduled_scan(
    db: Session,
    scan_id: int,
):

    scheduled_scan = get_scheduled_scan(
        db,
        scan_id,
    )

    if scheduled_scan is None:

        raise HTTPException(
            status_code=404,
            detail="Scheduled scan not found.",
        )

    # Remove the actual APScheduler job first.
    if scheduler_running:

        unregister_scheduled_scan(
            scheduled_scan.id
        )

    db.delete(scheduled_scan)
    db.commit()

    return {
        "message": (
            "Scheduled scan deleted successfully."
        ),
        "id": scan_id,
    }