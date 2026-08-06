from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.postgres import get_db
from app.services.security_pipeline import run_security_pipeline


class PipelineRequest(BaseModel):
    query: str


router = APIRouter(
    prefix="/pipeline",
    tags=["Security Pipeline"],
)


@router.post("/run")
def run_pipeline(
    request: PipelineRequest,
    db: Session = Depends(get_db),
):
    return run_security_pipeline(
        db,
        request.query,
    )