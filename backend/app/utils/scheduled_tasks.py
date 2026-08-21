from datetime import datetime

from app.db.postgres import SessionLocal
from app.services.security_pipeline import run_security_pipeline


# Default query used by the scheduled security scan.
# We will make this configurable later.
DEFAULT_SECURITY_QUERY = "SELECT * FROM users"


def run_security_pipeline_task():
    """
    Executes the real AegisX security pipeline through APScheduler.

    Pipeline errors are caught and returned instead of being re-raised.
    This allows the scheduler wrapper to update its last_run timestamp
    even when an individual security scan fails.
    """

    db = None
    started_at = datetime.utcnow().isoformat()

    try:
        db = SessionLocal()

        print("=" * 60)
        print("AegisX Scheduled Security Pipeline")
        print(f"Started : {started_at} UTC")

        # Run the actual security pipeline.
        result = run_security_pipeline(
            db,
            DEFAULT_SECURITY_QUERY,
        )

        finished_at = datetime.utcnow().isoformat()

        print("Security pipeline executed successfully.")
        print(f"Result   : {result}")
        print(f"Finished : {finished_at} UTC")
        print("=" * 60)

        return {
            "success": True,
            "started_at": started_at,
            "finished_at": finished_at,
            "result": result,
        }

    except Exception as exc:
        failed_at = datetime.utcnow().isoformat()

        print("=" * 60)
        print("AegisX Scheduled Security Pipeline FAILED")
        print(f"Started : {started_at} UTC")
        print(f"Failed  : {failed_at} UTC")
        print(f"Error   : {exc}")
        print("=" * 60)

        # Do not re-raise the exception here.
        # This allows scheduled_security_pipeline() to continue and update
        # the scheduler's last_run timestamp.
        return {
            "success": False,
            "started_at": started_at,
            "failed_at": failed_at,
            "error": str(exc),
        }

    finally:
        if db is not None:
            db.close()