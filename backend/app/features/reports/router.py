from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres import get_db

from app.features.reports.service import (
    generate_security_report,
)

from app.features.reports.schemas import (
    ReportResponse,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/security",
    response_model=ReportResponse,
)
def security_report(
    db: Session = Depends(get_db),
):
    return generate_security_report(db)