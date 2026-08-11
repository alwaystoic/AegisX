from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_audit_log():
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
        "/audit/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "username": "login_test_user",
            "action": "CREATE",
            "resource": "Test Database",
            "details": "Created database security audit test entry",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert data["username"] == "login_test_user"
    assert data["action"] == "CREATE"
    assert data["resource"] == "Test Database"
    assert data["details"] == "Created database security audit test entry"
    assert "timestamp" in data
    assert data["is_active"] is True

def test_get_all_audit_logs():
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
        "/audit/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    audit_log = data[-1]

    assert "id" in audit_log
    assert "username" in audit_log
    assert "action" in audit_log
    assert "resource" in audit_log
    assert "details" in audit_log
    assert "timestamp" in audit_log
    assert "is_active" in audit_log

def test_get_audit_log_by_id():
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
        "/audit/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "username": "login_test_user",
            "action": "READ",
            "resource": "Test Resource",
            "details": "Audit log created for GET by ID testing",
        },
    )

    assert create_response.status_code == 200

    audit_log_id = create_response.json()["id"]

    response = client.get(
        f"/audit/{audit_log_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == audit_log_id
    assert data["username"] == "login_test_user"
    assert data["action"] == "READ"
    assert data["resource"] == "Test Resource"
    assert data["details"] == "Audit log created for GET by ID testing"
    assert "timestamp" in data
    assert data["is_active"] is True

def test_update_audit_log():
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
        "/audit/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "username": "login_test_user",
            "action": "CREATE",
            "resource": "Original Resource",
            "details": "Original audit details",
        },
    )

    assert create_response.status_code == 200

    audit_log_id = create_response.json()["id"]

    response = client.put(
        f"/audit/{audit_log_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "username": "updated_user",
            "action": "UPDATE",
            "resource": "Updated Resource",
            "details": "Updated audit details",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == audit_log_id
    assert data["username"] == "updated_user"
    assert data["action"] == "UPDATE"
    assert data["resource"] == "Updated Resource"
    assert data["details"] == "Updated audit details"
    assert "timestamp" in data
    assert data["is_active"] is True

def test_delete_audit_log():
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
        "/audit/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "username": "login_test_user",
            "action": "DELETE",
            "resource": "Delete Test Resource",
            "details": "Audit log for delete testing",
        },
    )

    assert create_response.status_code == 200

    audit_log_id = create_response.json()["id"]

    response = client.delete(
        f"/audit/{audit_log_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Audit log deleted successfully"

    # Verify soft-deleted audit log is no longer accessible
    get_response = client.get(
        f"/audit/{audit_log_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert get_response.status_code == 404