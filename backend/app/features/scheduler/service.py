from datetime import datetime, timedelta

from app.features.scheduler.schemas import (
    SchedulerStatusResponse,
)

# ----------------------------------
# Scheduler State
# ----------------------------------

scheduler_running = False

interval_minutes = 30

last_run = None

next_run = None


def get_scheduler_status() -> SchedulerStatusResponse:
    """
    Returns the current scheduler status.
    """

    return SchedulerStatusResponse(
        scheduler_running=scheduler_running,
        interval_minutes=interval_minutes,
        last_run=last_run,
        next_run=next_run,
    )


def start_scheduler():
    """
    Starts the scheduler.
    """

    global scheduler_running
    global next_run

    scheduler_running = True

    next_run = (
        datetime.utcnow() +
        timedelta(minutes=interval_minutes)
    ).isoformat()

    return get_scheduler_status()


def stop_scheduler():
    """
    Stops the scheduler.
    """

    global scheduler_running
    global next_run

    scheduler_running = False

    next_run = None

    return get_scheduler_status()


def update_last_run():
    """
    Updates scheduler execution time.
    """

    global last_run
    global next_run

    last_run = datetime.utcnow().isoformat()

    next_run = (
        datetime.utcnow() +
        timedelta(minutes=interval_minutes)
    ).isoformat()