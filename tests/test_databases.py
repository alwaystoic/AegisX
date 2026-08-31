from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_database():
    # Login
    login_response = client.post(
        "/users/login",
        data={
    		"username": "auth_admin_test",
    		"password": "Test@12345",
	},
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    # Create database
    response = client.post(
        "/databases/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Test PostgreSQL",
            "db_type": "PostgreSQL",
            "host": "localhost",
            "port": 5432,
            "database_name": "test_db",
            "username": "postgres",
            "password": "test_password",
            "owner": "AegisX",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert data["name"] == "Test PostgreSQL"
    assert data["db_type"] == "PostgreSQL"
    assert data["host"] == "localhost"
    assert data["port"] == 5432
    assert data["database_name"] == "test_db"
    assert data["username"] == "postgres"
    assert data["owner"] == "AegisX"
    assert data["is_active"] is True

def test_get_all_databases():
    login_response = client.post(
        "/users/login",
        data={
            "username": "auth_admin_test",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.get(
        "/databases/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    database = data[-1]

    assert "id" in database
    assert "name" in database
    assert "db_type" in database
    assert "host" in database
    assert "port" in database
    assert "database_name" in database
    assert "username" in database
    assert "is_active" in database

def test_get_database_by_id():
    login_response = client.post(
        "/users/login",
        data={
            "username": "auth_admin_test",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    create_response = client.post(
        "/databases/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Get By ID Test",
            "db_type": "PostgreSQL",
            "host": "localhost",
            "port": 5432,
            "database_name": "get_test_db",
            "username": "postgres",
            "password": "test_password",
            "owner": "AegisX",
        },
    )

    assert create_response.status_code == 200

    database_id = create_response.json()["id"]

    response = client.get(
        f"/databases/{database_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == database_id
    assert data["name"] == "Get By ID Test"
    assert data["db_type"] == "PostgreSQL"
    assert data["database_name"] == "get_test_db"

def test_update_database():
    login_response = client.post(
        "/users/login",
        data={
            "username": "auth_admin_test",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    create_response = client.post(
        "/databases/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Before Update",
            "db_type": "PostgreSQL",
            "host": "localhost",
            "port": 5432,
            "database_name": "update_test_db",
            "username": "postgres",
            "password": "test_password",
            "owner": "AegisX",
        },
    )

    assert create_response.status_code == 200

    database_id = create_response.json()["id"]

    response = client.put(
        f"/databases/{database_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "After Update",
            "db_type": "PostgreSQL",
            "host": "127.0.0.1",
            "port": 5432,
            "database_name": "updated_db",
            "username": "postgres",
            "password": "updated_password",
            "owner": "AegisX Updated",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == database_id
    assert data["name"] == "After Update"
    assert data["host"] == "127.0.0.1"
    assert data["database_name"] == "updated_db"
    assert data["owner"] == "AegisX Updated"

def test_delete_database():
    login_response = client.post(
        "/users/login",
        data={
            "username": "auth_admin_test",
            "password": "Test@12345",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    create_response = client.post(
        "/databases/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Delete Test",
            "db_type": "PostgreSQL",
            "host": "localhost",
            "port": 5432,
            "database_name": "delete_test_db",
            "username": "postgres",
            "password": "test_password",
            "owner": "AegisX",
        },
    )

    assert create_response.status_code == 200

    database_id = create_response.json()["id"]

    response = client.delete(
        f"/databases/{database_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Database deleted successfully"

    # Verify it no longer exists
    get_response = client.get(
        f"/databases/{database_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert get_response.status_code == 404
