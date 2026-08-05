from pydantic import BaseModel, ConfigDict


class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str


class IncidentUpdate(BaseModel):
    title: str
    description: str
    severity: str
    status: str


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)