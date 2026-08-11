from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "Healthy"
    assert data["postgres"] == "Connected"
    assert data["mongodb"] == "Connected"
    assert data["ai"] == "Ready"