from fastapi import APIRouter

from app.features.scheduler.schemas import (
    SchedulerStatusResponse,
)

from app.features.scheduler.service import (
    get_scheduler_status,
    start_scheduler,
    stop_scheduler,
)

router = APIRouter(
    prefix="/scheduler",
    tags=["Scheduler"],
)


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