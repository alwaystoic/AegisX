from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_threat():
    login_response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.post(
        "/threat/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "threat_name": "Test SQL Injection",
            "threat_type": "SQL Injection",
            "source": "Automated API Test",
            "description": "Test database security threat",
            "mitigation": "Use parameterized queries",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert data["threat_name"] == "Test SQL Injection"
    assert data["threat_type"] == "SQL Injection"
    assert data["severity"] == "Low"
    assert data["source"] == "Automated API Test"
    assert data["description"] == "Test database security threat"
    assert data["mitigation"] == "Use parameterized queries"
    assert data["status"] == "Active"
    assert data["is_active"] is True

def test_get_all_threats():
    login_response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/threat/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    threat = data[-1]

    assert "id" in threat
    assert "threat_name" in threat
    assert "threat_type" in threat
    assert "severity" in threat
    assert "source" in threat
    assert "description" in threat
    assert "mitigation" in threat
    assert "status" in threat
    assert "is_active" in threat

def test_get_threat_by_id():
    login_response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    create_response = client.post(
        "/threat/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "threat_name": "Get By ID Threat",
            "threat_type": "Unauthorized Access",
            "source": "API Test",
            "description": "Threat created for GET by ID testing",
            "mitigation": "Review authentication controls",
        },
    )

    assert create_response.status_code == 200

    threat_id = create_response.json()["id"]

    response = client.get(
        f"/threat/{threat_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == threat_id
    assert data["threat_name"] == "Get By ID Threat"
    assert data["threat_type"] == "Unauthorized Access"
    assert data["severity"] == "Low"
    assert data["source"] == "API Test"
    assert data["description"] == "Threat created for GET by ID testing"
    assert data["mitigation"] == "Review authentication controls"
    assert data["status"] == "Active"
    assert data["is_active"] is True

def test_update_threat():
    login_response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    create_response = client.post(
        "/threat/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "threat_name": "Before Update Threat",
            "threat_type": "Malware",
            "source": "API Test",
            "description": "Original threat description",
            "mitigation": "Original mitigation",
        },
    )

    assert create_response.status_code == 200

    threat_id = create_response.json()["id"]

    response = client.put(
        f"/threat/{threat_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "threat_name": "After Update Threat",
            "threat_type": "Ransomware",
            "severity": "Critical",
            "source": "Updated API Test",
            "description": "Updated threat description",
            "mitigation": "Updated mitigation strategy",
            "status": "Resolved",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == threat_id
    assert data["threat_name"] == "After Update Threat"
    assert data["threat_type"] == "Ransomware"
    assert data["severity"] == "Critical"
    assert data["source"] == "Updated API Test"
    assert data["description"] == "Updated threat description"
    assert data["mitigation"] == "Updated mitigation strategy"
    assert data["status"] == "Resolved"

def test_delete_threat():
    login_response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    create_response = client.post(
        "/threat/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "threat_name": "Delete Test Threat",
            "threat_type": "Phishing",
            "source": "API Test",
            "description": "Threat for delete testing",
            "mitigation": "Apply security controls",
        },
    )

    assert create_response.status_code == 200

    threat_id = create_response.json()["id"]

    response = client.delete(
        f"/threat/{threat_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Threat deleted successfully"

    # Verify soft-deleted threat is no longer accessible
    get_response = client.get(
        f"/threat/{threat_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert get_response.status_code == 404