from fastapi import FastAPI

app = FastAPI(
    title="AegisX",
    description="Intelligent Database Security & Self-Healing Platform",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "project": "AegisX",
        "status": "Running",
        "message": "Welcome to AegisX 🚀",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "Not connected yet",
        "ai": "Not initialized yet",
    }