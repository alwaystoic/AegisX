from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres import get_db

from app.features.reports.service import (
    generate_security_report,
)

from app.features.reports.schemas import (
    ReportResponse,
)

from fastapi.responses import Response

from app.utils.pdf_generator import (
    generate_security_report_pdf,
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

@router.get(
    "/security/pdf",
)
def download_security_report_pdf(
    db: Session = Depends(get_db),
):
    report = generate_security_report(db)

    pdf = generate_security_report_pdf(report)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                "attachment; filename=AegisX_Security_Report.pdf"
        },
    )