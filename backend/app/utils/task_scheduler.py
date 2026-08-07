from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()


def start_scheduler():
    """Starts APScheduler."""
    if not scheduler.running:
        scheduler.start()


def stop_scheduler():
    """Stops APScheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)


def add_job(func, minutes: int = 30):
    """Adds a recurring scheduled job."""
    scheduler.add_job(
        func=func,
        trigger="interval",
        minutes=minutes,
        id="security_pipeline",
        replace_existing=True,
    )


def remove_job():
    """Removes the scheduled job."""
    job = scheduler.get_job("security_pipeline")
    if job:
        scheduler.remove_job("security_pipeline")