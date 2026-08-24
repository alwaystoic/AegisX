from datetime import datetime

from app.features.scheduler.schemas import SchedulerStatusResponse

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


# -------------------------------
# Scheduler State
# -------------------------------

scheduler_running = False
interval_minutes = 1
last_run = None


# -------------------------------
# Scheduled Pipeline
# -------------------------------

def scheduled_security_pipeline():
    """
    Executes the real AegisX security pipeline.
    """

    global last_run

    try:
        run_security_pipeline_task()

        last_run = datetime.utcnow().isoformat()

    except Exception as exc:
        print("=" * 60)
        print("Scheduled security pipeline failed")
        print(f"Error: {exc}")
        print("=" * 60)

        raise


# -------------------------------
# Scheduler Status
# -------------------------------

def get_scheduler_status():

    job = get_job()

    next_run = None

    if job and job.next_run_time:
        next_run = job.next_run_time.replace(
            tzinfo=None
        ).isoformat()

    return SchedulerStatusResponse(
        scheduler_running=scheduler_running,
        interval_minutes=interval_minutes,
        last_run=last_run,
        next_run=next_run,
    )


# -------------------------------
# Start Scheduler
# -------------------------------

def start_scheduler():

    global scheduler_running

    if not scheduler_running:

        aps_start_scheduler()

        add_job(
            scheduled_security_pipeline,
            minutes=interval_minutes,
        )

        scheduler_running = True

    return get_scheduler_status()


# -------------------------------
# Stop Scheduler
# -------------------------------

def stop_scheduler():

    global scheduler_running

    if scheduler_running:

        remove_job()

        aps_stop_scheduler()

        scheduler_running = False

    return get_scheduler_status()