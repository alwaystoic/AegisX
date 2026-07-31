from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Database Security & Self-Healing Platform",
    version=settings.APP_VERSION,
)


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