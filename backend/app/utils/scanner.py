from sqlalchemy import text
from sqlalchemy.orm import Session


def collect_database_health(db: Session):
    """
    Collect PostgreSQL health and security information.

    The collector reports both operational information and
    security-relevant warnings, particularly for disabled SSL.
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

    uptime = db.execute(
        text(
            """
            SELECT NOW() - pg_postmaster_start_time();
            """
        )
    ).scalar()

    extensions = db.execute(
        text(
            """
            SELECT string_agg(extname, ', ')
            FROM pg_extension;
            """
        )
    ).scalar()

    ssl_status = db.execute(
        text(
            """
            SHOW ssl;
            """
        )
    ).scalar()

    # ------------------------------------------------------------
    # Security checks
    # ------------------------------------------------------------

    security_warnings = []
    security_status = "Secure"

    if str(ssl_status).lower() in {"off", "false", "no"}:
        security_status = "Warning"

        security_warnings.append(
            "PostgreSQL SSL is disabled. "
            "Enable SSL to protect database connections."
        )

    if not security_warnings:
        security_warnings.append(
            "No database security warnings detected."
        )

    # ------------------------------------------------------------
    # Response
    # ------------------------------------------------------------

    return {
        "postgres_version": version,
        "database_name": database_name,
        "current_user": current_user,
        "database_size": database_size,
        "active_connections": active_connections,
        "uptime": str(uptime),
        "extensions": extensions,
        "ssl_status": ssl_status,
        "security_status": security_status,
        "security_warnings": security_warnings,
    }