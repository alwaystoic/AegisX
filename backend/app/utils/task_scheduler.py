from apscheduler.schedulers.background import BackgroundScheduler


scheduler = BackgroundScheduler()


def start_scheduler():
    """Start APScheduler if it is not already running."""

    if not scheduler.running:
        scheduler.start()


def stop_scheduler():
    """Stop APScheduler."""

    if scheduler.running:
        scheduler.shutdown(wait=False)


def add_job(
    func,
    job_id: str,
    minutes: int = 30,
):
    """Add or replace a recurring APScheduler job."""

    scheduler.add_job(
        func=func,
        trigger="interval",
        minutes=minutes,
        id=job_id,
        replace_existing=True,
    )


def remove_job(job_id: str):
    """Remove a scheduled APScheduler job."""

    job = scheduler.get_job(job_id)

    if job:
        scheduler.remove_job(job_id)


def get_job(job_id: str):
    """Return an APScheduler job."""

    return scheduler.get_job(job_id)