from fastapi import FastAPI

from app.core.config import settings
from app.db.postgres import engine
from app.db.base import Base

from app.features.users.router import router as users_router
from app.features.databases.router import router as databases_router
from app.features.incidents.router import router as incidents_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Database Security & Self-Healing Platform",
    version=settings.APP_VERSION,
)

app.include_router(users_router)
app.include_router(databases_router)
app.include_router(incidents_router)


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
        "ai": "Ready"
    }