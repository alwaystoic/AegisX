from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres import get_db
from app.auth.dependencies import require_analyst_or_admin
from app.models.user import User

from app.features.dashboard.service import (
    get_dashboard_summary,
)

from app.features.dashboard.schemas import (
    DashboardSummaryResponse,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin),
):
    return get_dashboard_summary(db)