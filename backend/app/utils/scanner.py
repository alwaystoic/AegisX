from sqlalchemy import text
from sqlalchemy.orm import Session


def collect_database_health(db: Session):
    """
    Collect basic PostgreSQL health information.
    """

    version = db.execute(
        text("SELECT version();")
    ).scalar()

    database_name = db.execute(
        text("SELECT current_database();")
    ).scalar()

    current_user = db.execute(
        text("SELECT current_user;")
    ).scalar()

    database_size = db.execute(
        text(
            """
            SELECT pg_size_pretty(
                pg_database_size(current_database())
            );
            """
        )
    ).scalar()

    active_connections = db.execute(
        text(
            """
            SELECT COUNT(*)
            FROM pg_stat_activity;
            """
        )
    ).scalar()

    return {
        "postgres_version": version,
        "database_name": database_name,
        "current_user": current_user,
        "database_size": database_size,
        "active_connections": active_connections,
    }