from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_critical_response_reuses_existing_incident():
    response1 = client.post(
        "/pipeline/run",
        json={
            "query": "DROP TABLE users"
        },
    )

    assert response1.status_code == 200

    actions1 = response1.json()["response_actions"]

    assert actions1["overall_risk"] == "Critical"
    assert actions1["incident_id"] is not None

    response2 = client.post(
        "/pipeline/run",
        json={
            "query": "DROP TABLE users"
        },
    )

    assert response2.status_code == 200

    actions2 = response2.json()["response_actions"]

    assert actions2["overall_risk"] == "Critical"
    assert actions2["incident_id"] == actions1["incident_id"]

    assert "incident_already_exists" in actions2["actions"]


def test_high_response_reuses_existing_incident():
    response1 = client.post(
        "/pipeline/run",
        json={
            "query": "UPDATE users SET role = 'admin'"
        },
    )

    assert response1.status_code == 200

    actions1 = response1.json()["response_actions"]

    assert actions1["overall_risk"] == "High"
    assert actions1["incident_id"] is not None

    response2 = client.post(
        "/pipeline/run",
        json={
            "query": "UPDATE users SET role = 'admin'"
        },
    )

    assert response2.status_code == 200

    actions2 = response2.json()["response_actions"]

    assert actions2["overall_risk"] == "High"
    assert actions2["incident_id"] == actions1["incident_id"]

    assert "incident_already_exists" in actions2["actions"]


def test_low_risk_does_not_create_incident():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "SELECT * FROM users WHERE id = 1"
        },
    )

    assert response.status_code == 200

    actions = response.json()["response_actions"]

    assert actions["overall_risk"] == "Low"
    assert actions["incident_id"] is None

    assert "incident_created" not in actions["actions"]
    assert "incident_already_exists" not in actions["actions"]
    assert "write_audit_log" in actions["actions"]


def test_critical_response_sends_notification():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "DROP TABLE users"
        },
    )

    assert response.status_code == 200

    actions = response.json()["response_actions"]

    assert actions["overall_risk"] == "Critical"
    assert "send_notification" in actions["actions"]


def test_high_response_does_not_send_notification():
    response = client.post(
        "/pipeline/run",
        json={
            "query": "UPDATE users SET role = 'admin'"
        },
    )

    assert response.status_code == 200

    actions = response.json()["response_actions"]

    assert actions["overall_risk"] == "High"
    assert "send_notification" not in actions["actions"]


def test_critical_duplicate_incident_does_not_create_new_incident():
    response1 = client.post(
        "/pipeline/run",
        json={
            "query": "DROP TABLE users"
        },
    )

    assert response1.status_code == 200

    actions1 = response1.json()["response_actions"]

    assert actions1["overall_risk"] == "Critical"
    assert actions1["incident_id"] is not None

    first_incident_id = actions1["incident_id"]

    response2 = client.post(
        "/pipeline/run",
        json={
            "query": "DROP TABLE users"
        },
    )

    assert response2.status_code == 200

    actions2 = response2.json()["response_actions"]

    assert actions2["overall_risk"] == "Critical"
    assert actions2["incident_id"] == first_incident_id

    assert "incident_already_exists" in actions2["actions"]
    assert "incident_created" not in actions2["actions"]