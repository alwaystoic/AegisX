from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.auth.dependencies import (
    get_current_user,
    require_admin,
)

from app.models.user import User

from app.features.databases.schemas import (
    DatabaseCreate,
    DatabaseUpdate,
    DatabaseResponse,
)

from app.features.databases.service import (
    create_database,
    get_all_databases,
    get_database_by_id,
    update_database,
    delete_database,
)


router = APIRouter(
    prefix="/databases",
    tags=["Databases"],
)


@router.post("/", response_model=DatabaseResponse)
def create_new_database(
    database: DatabaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_database(db, database)


@router.get("/", response_model=list[DatabaseResponse])
def read_databases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_databases(db)


@router.get("/{database_id}", response_model=DatabaseResponse)
def read_database(
    database_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    database = get_database_by_id(db, database_id)

    if database is None:
        raise HTTPException(
            status_code=404,
            detail="Database not found",
        )

    return database


@router.put("/{database_id}", response_model=DatabaseResponse)
def update_existing_database(
    database_id: int,
    database: DatabaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_database = update_database(
        db,
        database_id,
        database,
    )

    if updated_database is None:
        raise HTTPException(
            status_code=404,
            detail="Database not found",
        )

    return updated_database


@router.delete("/{database_id}")
def remove_database(
    database_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    database = delete_database(db, database_id)

    if database is None:
        raise HTTPException(
            status_code=404,
            detail="Database not found",
        )

    return {
        "message": "Database deleted successfully"
    }