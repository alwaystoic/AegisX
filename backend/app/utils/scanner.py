from sqlalchemy import text
from sqlalchemy.orm import Session


def test_database_connection(db: Session):
    """
    Tests whether PostgreSQL is reachable.
    """

    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "Connected",
            "message": "Database connection successful."
        }

    except Exception as e:
        return {
            "status": "Failed",
            "message": str(e)
        }