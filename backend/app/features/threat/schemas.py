from pydantic import BaseModel


class ThreatCreate(BaseModel):
    threat_name: str
    threat_type: str
    source: str
    description: str
    mitigation: str


class ThreatUpdate(BaseModel):
    threat_name: str
    threat_type: str
    severity: str
    source: str
    description: str
    mitigation: str
    status: str


class ThreatResponse(BaseModel):
    id: int
    threat_name: str
    threat_type: str
    severity: str
    source: str
    description: str
    mitigation: str
    status: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }