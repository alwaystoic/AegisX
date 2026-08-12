from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_scheduler_status():
    response = client.get("/scheduler/status")

    assert response.status_code == 200

    data = response.json()

    assert "scheduler_running" in data
    assert data["interval_minutes"] == 1
    assert "last_run" in data
    assert "next_run" in data


def test_scheduler_start():
    response = client.post("/scheduler/start")

    assert response.status_code == 200

    data = response.json()

    assert data["scheduler_running"] is True
    assert data["interval_minutes"] == 1
    assert data["next_run"] is not None


def test_scheduler_stop():
    response = client.post("/scheduler/stop")

    assert response.status_code == 200

    data = response.json()

    assert data["scheduler_running"] is False
    assert data["next_run"] is None


def test_scheduler_start_when_already_running():
    client.post("/scheduler/start")

    response = client.post("/scheduler/start")

    assert response.status_code == 200

    data = response.json()

    assert data["scheduler_running"] is True
    assert data["next_run"] is not None

    client.post("/scheduler/stop")


def test_scheduler_stop_when_already_stopped():
    client.post("/scheduler/stop")

    response = client.post("/scheduler/stop")

    assert response.status_code == 200

    data = response.json()

    assert data["scheduler_running"] is False
    assert data["next_run"] is None