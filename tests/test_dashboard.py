from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_dashboard_summary():
    response = client.get("/dashboard/summary")

    assert response.status_code == 200

    data = response.json()

    assert "security_score" in data
    assert "total_users" in data
    assert "total_databases" in data
    assert "total_scans" in data
    assert "completed_scans" in data
    assert "total_threats" in data
    assert "critical_threats" in data
    assert "total_incidents" in data
    assert "system_status" in data

    assert isinstance(data["security_score"], int)
    assert isinstance(data["total_users"], int)
    assert isinstance(data["total_databases"], int)
    assert isinstance(data["total_scans"], int)
    assert isinstance(data["completed_scans"], int)
    assert isinstance(data["total_threats"], int)
    assert isinstance(data["critical_threats"], int)
    assert isinstance(data["total_incidents"], int)
    assert isinstance(data["system_status"], str)

    assert 0 <= data["security_score"] <= 100
    assert data["system_status"] in [
        "Healthy",
        "Warning",
        "Critical",
    ]

def test_dashboard_security_score_logic():
    response = client.get("/dashboard/summary")

    assert response.status_code == 200

    data = response.json()

    expected_score = max(
        0,
        100 - (
            data["critical_threats"] * 15
            + data["total_incidents"] * 5
        ),
    )

    assert data["security_score"] == expected_score

    if expected_score >= 80:
        assert data["system_status"] == "Healthy"
    elif expected_score >= 60:
        assert data["system_status"] == "Warning"
    else:
        assert data["system_status"] == "Critical"