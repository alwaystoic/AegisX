from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def get_auth_headers():
    response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def test_pipeline_requires_authentication():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "SELECT * FROM users",
        },
    )

    assert response.status_code == 401


def test_security_pipeline_safe_query():
    response = client.post(
        "/pipeline/run",
        headers=get_auth_headers(),
        json={
            "query": "SELECT * FROM users WHERE id = 1",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["sql_analysis"]["safe"] is True
    assert data["sql_analysis"]["severity"] == "Low"
    assert data["sql_analysis"]["risk_score"] == 0

    assert data["threat_detection"]["overall_risk"] == "Low"
    assert data["threat_detection"]["risk_score"] == 25

    assert data["ai_recommendation"]["priority"] == "Low"

    assert data["response_actions"]["overall_risk"] == "Low"
    assert data["response_actions"]["incident_id"] is None
    assert "write_audit_log" in data["response_actions"]["actions"]


def test_security_pipeline_critical_query():
    headers = get_auth_headers()

    response = client.post(
        "/pipeline/run",
        headers=headers,
        json={
            "query": "DROP TABLE users",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["sql_analysis"]["safe"] is False
    assert data["sql_analysis"]["severity"] == "Critical"
    assert data["sql_analysis"]["risk_score"] == 100

    assert data["threat_detection"]["overall_risk"] == "Critical"
    assert data["threat_detection"]["risk_score"] == 100

    assert data["ai_recommendation"]["priority"] == "Immediate"

    assert data["response_actions"]["overall_risk"] == "Critical"
    assert data["response_actions"]["incident_id"] is not None

    # An incident may already exist from an earlier test/run.
    # Either behavior is valid as long as the correct incident exists.
    assert (
        "incident_created" in data["response_actions"]["actions"]
        or "incident_already_exists"
        in data["response_actions"]["actions"]
    )

    assert "send_notification" in data["response_actions"]["actions"]


def test_security_pipeline_high_query():
    headers = get_auth_headers()

    response = client.post(
        "/pipeline/run",
        headers=headers,
        json={
            "query": "UPDATE users SET role = 'admin'",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["sql_analysis"]["safe"] is False
    assert data["sql_analysis"]["severity"] == "High"
    assert data["sql_analysis"]["risk_score"] == 85

    assert data["threat_detection"]["overall_risk"] == "High"
    assert data["threat_detection"]["risk_score"] == 75

    assert data["ai_recommendation"]["priority"] == "High"

    assert data["response_actions"]["overall_risk"] == "High"
    assert data["response_actions"]["incident_id"] is not None

    # An incident may already exist from an earlier test/run.
    assert (
        "incident_created" in data["response_actions"]["actions"]
        or "incident_already_exists"
        in data["response_actions"]["actions"]
    )

    assert "send_notification" not in data["response_actions"]["actions"]