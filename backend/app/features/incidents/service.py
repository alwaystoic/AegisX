from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.incident import Incident
from app.features.incidents.schemas import (
    IncidentCreate,
    IncidentUpdate,
)


def create_incident(db: Session, incident: IncidentCreate):
    db_incident = Incident(
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    return db_incident


def get_all_incidents(db: Session):
    return db.execute(
        select(Incident)
    ).scalars().all()


def get_incident_by_id(db: Session, incident_id: int):
    return db.execute(
        select(Incident).where(Incident.id == incident_id)
    ).scalar_one_or_none()


def get_active_incident(
    db: Session,
    title: str,
    severity: str,
):
    """
    Find an existing active incident with
    the same title and severity.

    If multiple matching incidents already exist,
    return the oldest one instead of raising an exception.
    """

    return db.execute(
        select(Incident)
        .where(
            Incident.title == title,
            Incident.severity == severity,
            Incident.is_active.is_(True),
        )
        .order_by(Incident.id.asc())
        .limit(1)
    ).scalar_one_or_none()


def update_incident(
    db: Session,
    incident_id: int,
    incident: IncidentUpdate,
):
    db_incident = db.execute(
        select(Incident).where(
            Incident.id == incident_id
        )
    ).scalar_one_or_none()

    if db_incident is None:
        return None

    db_incident.title = incident.title
    db_incident.description = incident.description
    db_incident.severity = incident.severity
    db_incident.status = incident.status

    db.commit()
    db.refresh(db_incident)

    return db_incident


def delete_incident(
    db: Session,
    incident_id: int,
):
    db_incident = db.execute(
        select(Incident).where(
            Incident.id == incident_id
        )
    ).scalar_one_or_none()

    if db_incident is None:
        return None

    db.delete(db_incident)
    db.commit()

    return db_incident