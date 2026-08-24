from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    security_score: int
    total_users: int
    total_databases: int
    total_scans: int
    completed_scans: int
    total_threats: int
    critical_threats: int
    high_threats: int
    medium_threats: int
    low_threats: int
    total_incidents: int
    system_status: str
