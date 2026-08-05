from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.auth.dependencies import get_current_user

from app.models.user import User

from app.features.scan.schemas import (
    ScanCreate,
    ScanUpdate,
    ScanResponse,
)

from app.features.scan.service import (
    create_scan,
    get_all_scans,
    get_scan_by_id,
    update_scan,
    delete_scan,
)

router = APIRouter(
    prefix="/scan",
    tags=["Scan"],
)


@router.post("/", response_model=ScanResponse)
def create_new_scan(
    scan: ScanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_scan(db, scan)


@router.get("/", response_model=list[ScanResponse])
def read_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_scans(db)


@router.get("/{scan_id}", response_model=ScanResponse)
def read_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_scan_by_id(db, scan_id)

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return scan


@router.put("/{scan_id}", response_model=ScanResponse)
def update_existing_scan(
    scan_id: int,
    scan: ScanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_scan = update_scan(
        db,
        scan_id,
        scan,
    )

    if updated_scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return updated_scan


@router.delete("/{scan_id}")
def remove_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = delete_scan(db, scan_id)

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return {
        "message": "Scan deleted successfully"
    }