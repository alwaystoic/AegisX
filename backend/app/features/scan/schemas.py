from pydantic import BaseModel, ConfigDict, Field


class ScanCreate(BaseModel):
    scan_name: str = Field(min_length=1, max_length=200)
    database_name: str = Field(min_length=1, max_length=100)


class ScanUpdate(BaseModel):
    scan_name: str = Field(min_length=1, max_length=200)
    database_name: str = Field(min_length=1, max_length=100)
    status: str = Field(min_length=1, max_length=20)
    severity: str = Field(min_length=1, max_length=20)
    vulnerabilities_found: int = Field(ge=0)
    recommendation: str = Field(min_length=1, max_length=5000)


class ScanResponse(BaseModel):
    id: int = Field(ge=1)
    scan_name: str
    database_name: str
    status: str
    severity: str
    vulnerabilities_found: int = Field(ge=0)
    recommendation: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)