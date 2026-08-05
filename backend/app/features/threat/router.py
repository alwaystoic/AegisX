from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.auth.dependencies import get_current_user
from app.models.user import User

from app.features.threat.schemas import (
    ThreatCreate,
    ThreatUpdate,
    ThreatResponse,
)

from app.features.threat.service import (
    create_threat,
    get_all_threats,
    get_threat_by_id,
    update_threat,
    delete_threat,
)

router = APIRouter(
    prefix="/threat",
    tags=["Threat"],
)


@router.post("/", response_model=ThreatResponse)
def create_new_threat(
    threat: ThreatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_threat(db, threat)


@router.get("/", response_model=list[ThreatResponse])
def read_threats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_threats(db)


@router.get("/{threat_id}", response_model=ThreatResponse)
def read_threat(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    threat = get_threat_by_id(db, threat_id)

    if threat is None:
        raise HTTPException(
            status_code=404,
            detail="Threat not found",
        )

    return threat


@router.put("/{threat_id}", response_model=ThreatResponse)
def update_existing_threat(
    threat_id: int,
    updated_threat: ThreatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    threat = update_threat(
        db,
        threat_id,
        updated_threat,
    )

    if threat is None:
        raise HTTPException(
            status_code=404,
            detail="Threat not found",
        )

    return threat


@router.delete("/{threat_id}")
def remove_threat(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    threat = delete_threat(
        db,
        threat_id,
    )

    if threat is None:
        raise HTTPException(
            status_code=404,
            detail="Threat not found",
        )

    return {
        "message": "Threat deleted successfully"
    }