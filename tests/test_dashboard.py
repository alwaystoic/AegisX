from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def get_auth_headers():
    login_response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def test_dashboard_requires_authentication():
    response = client.get("/dashboard/summary")

    assert response.status_code == 401


def test_dashboard_summary():
    response = client.get(
        "/dashboard/summary",
        headers=get_auth_headers(),
    )

    assert response.status_code == 200

    data = response.json()

    assert "security_score" in data
    assert "total_users" in data
    assert "total_databases" in data
    assert "total_scans" in data
    assert "completed_scans" in data
    assert "total_threats" in data
    assert "critical_threats" in data
    assert "high_threats" in data
    assert "medium_threats" in data
    assert "low_threats" in data
    assert "total_incidents" in data
    assert "system_status" in data

    assert isinstance(data["security_score"], int)
    assert isinstance(data["total_users"], int)
    assert isinstance(data["total_databases"], int)
    assert isinstance(data["total_scans"], int)
    assert isinstance(data["completed_scans"], int)
    assert isinstance(data["total_threats"], int)
    assert isinstance(data["critical_threats"], int)
    assert isinstance(data["high_threats"], int)
    assert isinstance(data["medium_threats"], int)
    assert isinstance(data["low_threats"], int)
    assert isinstance(data["total_incidents"], int)
    assert isinstance(data["system_status"], str)

    assert 0 <= data["security_score"] <= 100

    assert data["system_status"] in [
        "Healthy",
        "Warning",
        "Critical",
    ]


def test_dashboard_security_score_logic():
    response = client.get(
        "/dashboard/summary",
        headers=get_auth_headers(),
    )

    assert response.status_code == 200

    data = response.json()

    weighted_risk = (
        data["critical_threats"] * 8
        + data["high_threats"] * 4
        + data["medium_threats"] * 2
        + data["low_threats"] * 1
    )

    expected_score = round(
        (100 * 100) / (100 + weighted_risk)
    )

    expected_score = max(
        0,
        min(100, expected_score),
    )

    assert data["security_score"] == expected_score

    if expected_score >= 80:
        assert data["system_status"] == "Healthy"

    elif expected_score >= 60:
        assert data["system_status"] == "Warning"

    else:
        assert data["system_status"] == "Critical"