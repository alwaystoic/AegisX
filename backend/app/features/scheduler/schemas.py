from datetime import datetime

from pydantic import BaseModel, Field


class SchedulerStatusResponse(BaseModel):
    scheduler_running: bool
    interval_minutes: int
    last_run: str | None
    next_run: str | None


class ScheduledScanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    database_name: str = Field(min_length=1, max_length=100)
    query: str = Field(min_length=1)
    interval_minutes: int = Field(ge=1)


class ScheduledScanUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    database_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    query: str | None = Field(
        default=None,
        min_length=1,
    )

    interval_minutes: int | None = Field(
        default=None,
        ge=1,
    )

    enabled: bool | None = None


class ScheduledScanResponse(BaseModel):
    id: int
    name: str
    database_name: str
    query: str
    interval_minutes: int
    enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True