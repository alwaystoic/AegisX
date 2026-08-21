from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    username: str
    action: str
    resource: str
    details: str | None = None
    timestamp: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    total: int
    logs: list[AuditLogResponse]