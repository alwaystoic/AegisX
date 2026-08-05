from sqlalchemy.orm import Session

from app.models.scan import Scan
from app.features.scan.schemas import ScanCreate, ScanUpdate

from app.utils.scanner import collect_database_health


def create_scan(db: Session, scan: ScanCreate):

    health = collect_database_health(db)

    db_scan = Scan(
        scan_name=scan.scan_name,
        database_name=health["database_name"],
        status="Completed",
        severity="Low",
        vulnerabilities_found=0,
        recommendation=(
            f"Database Health Summary:\n"
            f"Version: {health['postgres_version']}\n"
            f"Database Size: {health['database_size']}\n"
            f"Active Connections: {health['active_connections']}\n"
            f"Uptime: {health['uptime']}\n"
            f"SSL: {health['ssl_status']}\n"
            f"Extensions: {health['extensions']}"
        ),
    )

    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)

    return db_scan


def get_all_scans(db: Session):
    return db.query(Scan).filter(
        Scan.is_active == True
    ).all()


def get_scan_by_id(db: Session, scan_id: int):
    return db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.is_active == True
    ).first()


def update_scan(
    db: Session,
    scan_id: int,
    updated_scan: ScanUpdate,
):

    scan = get_scan_by_id(db, scan_id)

    if scan is None:
        return None

    scan.scan_name = updated_scan.scan_name
    scan.database_name = updated_scan.database_name
    scan.status = updated_scan.status
    scan.severity = updated_scan.severity
    scan.vulnerabilities_found = updated_scan.vulnerabilities_found
    scan.recommendation = updated_scan.recommendation

    db.commit()
    db.refresh(scan)

    return scan


def delete_scan(
    db: Session,
    scan_id: int,
):

    scan = get_scan_by_id(db, scan_id)

    if scan is None:
        return None

    scan.is_active = False

    db.commit()

    return scan