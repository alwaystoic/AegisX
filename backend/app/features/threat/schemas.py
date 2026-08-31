from pydantic import BaseModel, ConfigDict, Field


class ThreatCreate(BaseModel):
    threat_name: str = Field(min_length=1, max_length=200)
    threat_type: str = Field(min_length=1, max_length=100)
    source: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=5000)
    mitigation: str = Field(min_length=1, max_length=5000)


class ThreatUpdate(BaseModel):
    threat_name: str = Field(min_length=1, max_length=200)
    threat_type: str = Field(min_length=1, max_length=100)
    severity: str = Field(min_length=1, max_length=20)
    source: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=5000)
    mitigation: str = Field(min_length=1, max_length=5000)
    status: str = Field(min_length=1, max_length=20)


class ThreatResponse(BaseModel):
    id: int = Field(ge=1)
    threat_name: str
    threat_type: str
    severity: str
    source: str
    description: str
    mitigation: str
    status: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)