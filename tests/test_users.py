from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_register_user():
    response = client.post(
        "/users/",
        json={
            "username": "testuser_api",
            "email": "testuser_api@example.com",
            "password": "Test@12345",
            "full_name": "Test User",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "testuser_api"
    assert data["email"] == "testuser_api@example.com"
    assert data["full_name"] == "Test User"
    assert data["is_active"] is True

def test_login_user():
    # Create a user first
    register_response = client.post(
        "/users/",
        json={
            "username": "login_test_user",
            "email": "login_test_user@example.com",
            "password": "Test@12345",
            "full_name": "Login Test User",
        },
    )

    # If the user already exists, continue with login
    assert register_response.status_code in [200, 400]

    # Login
    response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert len(data["access_token"]) > 0

def test_login_invalid_password():
    response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "WrongPassword123",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"

def test_get_current_user():
    response = client.post(
        "/users/login",
        data={
            "username": "login_test_user",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    response = client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "login_test_user"
    assert data["email"] == "login_test_user@example.com"
    assert data["full_name"] == "Login Test User"
    assert data["is_active"] is True

def test_get_current_user_without_token():
    response = client.get("/users/me")

    assert response.status_code == 401

def test_get_current_user_invalid_token():
    response = client.get(
        "/users/me",
        headers={
            "Authorization": "Bearer invalid_token_here",
        },
    )

    assert response.status_code == 401