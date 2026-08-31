from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AuditLogCreate(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    action: str = Field(min_length=1, max_length=200)
    resource: str = Field(min_length=1, max_length=200)
    details: str = Field(min_length=1, max_length=5000)


class AuditLogUpdate(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    action: str = Field(min_length=1, max_length=200)
    resource: str = Field(min_length=1, max_length=200)
    details: str = Field(min_length=1, max_length=5000)


class AuditLogResponse(BaseModel):
    id: int = Field(ge=1)
    username: str
    action: str
    resource: str
    details: str
    timestamp: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)