from sqlalchemy.orm import Session

from app.models.threat import Threat

from app.features.threat.schemas import (
    ThreatCreate,
    ThreatUpdate,
)


def create_threat(db: Session, threat: ThreatCreate):

    db_threat = Threat(
        threat_name=threat.threat_name,
        threat_type=threat.threat_type,
        severity="Low",
        source=threat.source,
        description=threat.description,
        mitigation=threat.mitigation,
        status="Active",
    )

    db.add(db_threat)
    db.commit()
    db.refresh(db_threat)

    return db_threat


def get_all_threats(db: Session):
    return db.query(Threat).filter(
        Threat.is_active == True
    ).all()


def get_threat_by_id(db: Session, threat_id: int):
    return db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.is_active == True
    ).first()


def update_threat(
    db: Session,
    threat_id: int,
    updated_threat: ThreatUpdate,
):

    threat = get_threat_by_id(db, threat_id)

    if threat is None:
        return None

    threat.threat_name = updated_threat.threat_name
    threat.threat_type = updated_threat.threat_type
    threat.severity = updated_threat.severity
    threat.source = updated_threat.source
    threat.description = updated_threat.description
    threat.mitigation = updated_threat.mitigation
    threat.status = updated_threat.status

    db.commit()
    db.refresh(threat)

    return threat


def delete_threat(
    db: Session,
    threat_id: int,
):

    threat = get_threat_by_id(db, threat_id)

    if threat is None:
        return None

    threat.is_active = False

    db.commit()

    return threat