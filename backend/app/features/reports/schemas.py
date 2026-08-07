from datetime import datetime
from typing import List

from pydantic import BaseModel


class ReportResponse(BaseModel):
    generated_at: datetime

    security_score: int

    system_status: str

    total_users: int

    total_databases: int

    total_scans: int

    completed_scans: int

    total_threats: int

    critical_threats: int

    total_incidents: int

    recommendations: List[str]