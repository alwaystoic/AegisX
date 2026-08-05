from datetime import datetime

from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    username: str
    action: str
    resource: str
    details: str


class AuditLogUpdate(BaseModel):
    username: str
    action: str
    resource: str
    details: str


class AuditLogResponse(BaseModel):
    id: int
    username: str
    action: str
    resource: str
    details: str
    timestamp: datetime
    is_active: bool

    model_config = {
        "from_attributes": True
    }