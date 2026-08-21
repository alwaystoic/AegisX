from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.postgres import engine
from app.db.base import Base

# ============================================================
# FEATURE ROUTERS
# ============================================================

from app.features.users.router import router as users_router
from app.features.databases.router import router as databases_router
from app.features.incidents.router import router as incidents_router
from app.features.scan.router import router as scan_router
from app.features.threat.router import router as threat_router
from app.features.audit.router import router as audit_router
from app.features.audit_logs.router import router as audit_logs_router
from app.features.analyzer.router import router as analyzer_router

from app.features.threat_detection.router import (
    router as threat_detection_router,
)

from app.features.ai.router import (
    router as ai_router,
)

from app.features.pipeline.router import (
    router as pipeline_router,
)

from app.features.dashboard.router import (
    router as dashboard_router,
)

from app.features.reports.router import (
    router as reports_router,
)

from app.features.scheduler.router import (
    router as scheduler_router,
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Database Security & Self-Healing Platform",
    version=settings.APP_VERSION,
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

# Core Features
app.include_router(users_router)
app.include_router(databases_router)
app.include_router(incidents_router)
app.include_router(scan_router)
app.include_router(threat_router)

# Audit
app.include_router(audit_router)
app.include_router(audit_logs_router)

# Analysis
app.include_router(analyzer_router)
app.include_router(threat_detection_router)

# AI & Security Pipeline
app.include_router(ai_router)
app.include_router(pipeline_router)

# Dashboard & Operations
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(scheduler_router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "APP_NAME": settings.APP_NAME,
        "APP_VERSION": settings.APP_VERSION,
        "APP_ENV": settings.APP_ENV,
    }


# ============================================================
# HEALTH CHECK
# ============================================================

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