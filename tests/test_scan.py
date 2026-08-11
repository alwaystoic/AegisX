from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_scan():
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
        "/scan/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "scan_name": "Test Security Scan",
            "database_name": "test_db",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert data["scan_name"] == "Test Security Scan"
    assert data["database_name"]
    assert data["status"] == "Completed"
    assert data["severity"] == "Low"
    assert data["vulnerabilities_found"] == 0
    assert data["recommendation"]
    assert data["is_active"] is True

def test_get_all_scans():
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
        "/scan/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    scan = data[-1]

    assert "id" in scan
    assert "scan_name" in scan
    assert "database_name" in scan
    assert "status" in scan
    assert "severity" in scan
    assert "vulnerabilities_found" in scan
    assert "recommendation" in scan
    assert "is_active" in scan

def test_get_scan_by_id():
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
        "/scan/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "scan_name": "Get By ID Scan",
            "database_name": "test_db",
        },
    )

    assert create_response.status_code == 200

    scan_id = create_response.json()["id"]

    response = client.get(
        f"/scan/{scan_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == scan_id
    assert data["scan_name"] == "Get By ID Scan"
    assert data["status"] == "Completed"
    assert data["severity"] == "Low"
    assert data["vulnerabilities_found"] == 0
    assert data["is_active"] is True

def test_update_scan():
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
        "/scan/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "scan_name": "Before Update Scan",
            "database_name": "test_db",
        },
    )

    assert create_response.status_code == 200

    scan_id = create_response.json()["id"]

    response = client.put(
        f"/scan/{scan_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "scan_name": "After Update Scan",
            "database_name": "updated_test_db",
            "status": "Completed",
            "severity": "High",
            "vulnerabilities_found": 5,
            "recommendation": "Apply security patches and review database configuration.",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == scan_id
    assert data["scan_name"] == "After Update Scan"
    assert data["database_name"] == "updated_test_db"
    assert data["status"] == "Completed"
    assert data["severity"] == "High"
    assert data["vulnerabilities_found"] == 5
    assert data["recommendation"] == (
        "Apply security patches and review database configuration."
    )

def test_delete_scan():
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
        "/scan/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "scan_name": "Delete Test Scan",
            "database_name": "test_db",
        },
    )

    assert create_response.status_code == 200

    scan_id = create_response.json()["id"]

    response = client.delete(
        f"/scan/{scan_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Scan deleted successfully"

    # Verify soft-deleted scan is no longer accessible
    get_response = client.get(
        f"/scan/{scan_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert get_response.status_code == 404