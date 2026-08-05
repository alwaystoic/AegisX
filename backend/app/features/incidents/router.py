from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.auth.dependencies import get_current_user

from app.models.user import User

from app.features.incidents.schemas import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
)

from app.features.incidents.service import (
    create_incident,
    get_all_incidents,
    get_incident_by_id,
    update_incident,
    delete_incident,
)

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)


@router.post("/", response_model=IncidentResponse)
def create_new_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_incident(db, incident)


@router.get("/", response_model=list[IncidentResponse])
def read_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_incidents(db)


@router.get("/{incident_id}", response_model=IncidentResponse)
def read_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = get_incident_by_id(db, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident


@router.put("/{incident_id}", response_model=IncidentResponse)
def update_existing_incident(
    incident_id: int,
    incident: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_incident = update_incident(
        db,
        incident_id,
        incident,
    )

    if updated_incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return updated_incident


@router.delete("/{incident_id}")
def remove_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = delete_incident(db, incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return {
        "message": "Incident deleted successfully"
    }