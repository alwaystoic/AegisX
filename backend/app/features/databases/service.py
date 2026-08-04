from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.database import Database
from app.features.databases.schemas import (
    DatabaseCreate,
    DatabaseUpdate,
)


def create_database(db: Session, database: DatabaseCreate):
    db_database = Database(
        name=database.name,
        db_type=database.db_type,
        host=database.host,
        port=database.port,
        database_name=database.database_name,
        username=database.username,
        password=database.password,
        owner=database.owner,
    )

    db.add(db_database)
    db.commit()
    db.refresh(db_database)

    return db_database


def get_all_databases(db: Session):
    return db.execute(
        select(Database)
    ).scalars().all()


def get_database_by_id(db: Session, database_id: int):
    return db.execute(
        select(Database).where(Database.id == database_id)
    ).scalar_one_or_none()

def update_database(
    db: Session,
    database_id: int,
    database: DatabaseUpdate,
):
    db_database = db.execute(
        select(Database).where(Database.id == database_id)
    ).scalar_one_or_none()

    if db_database is None:
        return None

    db_database.name = database.name
    db_database.db_type = database.db_type
    db_database.host = database.host
    db_database.port = database.port
    db_database.database_name = database.database_name
    db_database.username = database.username
    db_database.password = database.password
    db_database.owner = database.owner

    db.commit()
    db.refresh(db_database)

    return db_database

def delete_database(db: Session, database_id: int):
    database = db.execute(
        select(Database).where(Database.id == database_id)
    ).scalar_one_or_none()

    if database is None:
        return None

    db.delete(database)
    db.commit()

    return database