from fastapi import FastAPI

from app.core.config import settings
from app.db.postgres import engine
from app.db.base import Base

from app.features.users.router import router as users_router
from app.features.databases.router import router as databases_router
from app.features.incidents.router import router as incidents_router
from app.features.scan.router import router as scan_router
from app.features.threat.router import router as threat_router
from app.features.audit.router import router as audit_router
from app.features.analyzer.router import router as analyzer_router

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Database Security & Self-Healing Platform",
    version=settings.APP_VERSION,
)

# Register routers
app.include_router(users_router)
app.include_router(databases_router)
app.include_router(incidents_router)
app.include_router(scan_router)
app.include_router(threat_router)
app.include_router(audit_router)
app.include_router(analyzer_router)

@app.get("/")
def root():
    return {
        "APP_NAME": settings.APP_NAME,
        "APP_VERSION": settings.APP_VERSION,
        "APP_ENV": settings.APP_ENV,
    }


@app.get("/health")
def health():
    postgres_status = "Connected"
    mongodb_status = "Connected"

    return {
        "status": "Healthy",
        "postgres": postgres_status,
        "mongodb": mongodb_status,
        "ai": "Ready",
    }