from pydantic import BaseModel


class SchedulerStatusResponse(BaseModel):
    scheduler_running: bool
    interval_minutes: int
    last_run: str | None
    next_run: str | None