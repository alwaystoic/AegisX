from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_security_pipeline_safe_query():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "SELECT * FROM users WHERE id = 1"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "database_health" in data
    assert "sql_analysis" in data
    assert "threat_detection" in data
    assert "ai_recommendation" in data
    assert "response_actions" in data

    assert data["sql_analysis"]["safe"] is True
    assert data["sql_analysis"]["severity"] == "Low"
    assert data["sql_analysis"]["risk_score"] == 0

    assert data["threat_detection"]["overall_risk"] == "Low"
    assert data["threat_detection"]["risk_score"] == 25

    assert data["ai_recommendation"]["priority"] == "Low"

    assert data["response_actions"]["overall_risk"] == "Low"
    assert data["response_actions"]["incident_id"] is None

def test_security_pipeline_critical_query():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "DROP TABLE users"
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

    assert "incident_created" in data["response_actions"]["actions"]
    assert "write_audit_log" in data["response_actions"]["actions"]
    assert "send_notification" in data["response_actions"]["actions"]

def test_security_pipeline_high_query():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "UPDATE users SET role = 'admin'"
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

    assert "incident_created" in data["response_actions"]["actions"]
    assert "write_audit_log" in data["response_actions"]["actions"]
    assert "send_notification" not in data["response_actions"]["actions"]