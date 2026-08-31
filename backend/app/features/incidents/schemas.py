from pydantic import BaseModel, ConfigDict, Field


class IncidentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    severity: str = Field(min_length=1, max_length=20)


class IncidentUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    severity: str = Field(min_length=1, max_length=20)
    status: str = Field(min_length=1, max_length=20)


class IncidentResponse(BaseModel):
    id: int = Field(ge=1)
    title: str
    description: str
    severity: str
    status: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)