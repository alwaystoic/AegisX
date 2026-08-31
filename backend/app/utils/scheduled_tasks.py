from datetime import datetime

from app.db.postgres import SessionLocal
from app.services.security_pipeline import run_security_pipeline


def run_security_pipeline_task(query: str):
    """
    Execute the real AegisX security pipeline for a scheduled scan.
    """

    db = None
    started_at = datetime.utcnow().isoformat()

    try:
        db = SessionLocal()

        print("=" * 60)
        print("AegisX Scheduled Security Pipeline")
        print(f"Started : {started_at} UTC")
        print(f"Query   : {query}")

        result = run_security_pipeline(
            db,
            query,
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

        return {
            "success": False,
            "started_at": started_at,
            "failed_at": failed_at,
            "error": str(exc),
        }

    finally:
        if db is not None:
            db.close()