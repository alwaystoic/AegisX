from pydantic import BaseModel


class ScanCreate(BaseModel):
    scan_name: str
    database_name: str


class ScanUpdate(BaseModel):
    scan_name: str
    database_name: str
    status: str
    severity: str
    vulnerabilities_found: int
    recommendation: str


class ScanResponse(BaseModel):
    id: int
    scan_name: str
    database_name: str
    status: str
    severity: str
    vulnerabilities_found: int
    recommendation: str | None
    is_active: bool

    class Config:
        from_attributes = True