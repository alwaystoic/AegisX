from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_incident():
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
        "/incidents/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "title": "Test Security Incident",
            "description": "Test incident created by automated API test",
            "severity": "High",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert data["title"] == "Test Security Incident"
    assert data["description"] == "Test incident created by automated API test"
    assert data["severity"] == "High"
    assert "status" in data
    assert data["is_active"] is True

def test_get_all_incidents():
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
        "/incidents/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    incident = data[-1]

    assert "id" in incident
    assert "title" in incident
    assert "description" in incident
    assert "severity" in incident
    assert "status" in incident
    assert "is_active" in incident

def test_get_incident_by_id():
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
        "/incidents/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "title": "Get By ID Test Incident",
            "description": "Incident for GET by ID testing",
            "severity": "Medium",
        },
    )

    assert create_response.status_code == 200

    incident_id = create_response.json()["id"]

    response = client.get(
        f"/incidents/{incident_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == incident_id
    assert data["title"] == "Get By ID Test Incident"
    assert data["description"] == "Incident for GET by ID testing"
    assert data["severity"] == "Medium"

def test_update_incident():
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
        "/incidents/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "title": "Before Update",
            "description": "Original incident description",
            "severity": "Low",
        },
    )

    assert create_response.status_code == 200

    incident_id = create_response.json()["id"]

    response = client.put(
        f"/incidents/{incident_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "title": "After Update",
            "description": "Updated incident description",
            "severity": "Critical",
            "status": "Resolved",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == incident_id
    assert data["title"] == "After Update"
    assert data["description"] == "Updated incident description"
    assert data["severity"] == "Critical"
    assert data["status"] == "Resolved"

def test_delete_incident():
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
        "/incidents/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "title": "Delete Test Incident",
            "description": "Incident for delete testing",
            "severity": "Low",
        },
    )

    assert create_response.status_code == 200

    incident_id = create_response.json()["id"]

    response = client.delete(
        f"/incidents/{incident_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Incident deleted successfully"

    # Verify it no longer exists
    get_response = client.get(
        f"/incidents/{incident_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert get_response.status_code == 404