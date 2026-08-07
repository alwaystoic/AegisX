from datetime import datetime, timedelta

from app.features.scheduler.schemas import (
    SchedulerStatusResponse,
)

from app.utils.task_scheduler import (
    start_scheduler as aps_start_scheduler,
    stop_scheduler as aps_stop_scheduler,
    add_job,
    remove_job,
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
next_run = None


def scheduled_security_pipeline():
    """
    Executes the scheduled security pipeline.
    """

    global last_run
    global next_run

    run_security_pipeline_task()

    last_run = datetime.utcnow().isoformat()

    next_run = (
        datetime.utcnow()
        + timedelta(minutes=interval_minutes)
    ).isoformat()


def get_scheduler_status():
    return SchedulerStatusResponse(
        scheduler_running=scheduler_running,
        interval_minutes=interval_minutes,
        last_run=last_run,
        next_run=next_run,
    )


def start_scheduler():

    global scheduler_running
    global next_run

    if not scheduler_running:

        aps_start_scheduler()

        add_job(
            scheduled_security_pipeline,
            minutes=interval_minutes,
        )

        scheduler_running = True

        next_run = (
            datetime.utcnow()
            + timedelta(minutes=interval_minutes)
        ).isoformat()

    return get_scheduler_status()


def stop_scheduler():

    global scheduler_running
    global next_run

    if scheduler_running:

        remove_job()

        aps_stop_scheduler()

        scheduler_running = False

        next_run = None

    return get_scheduler_status()