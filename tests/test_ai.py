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


def test_ai_recommendation_requires_authentication():
    response = client.post(
        "/ai/recommend",
        json={
            "overall_risk": "CRITICAL",
            "risk_score": 95,
        },
    )

    assert response.status_code == 401


def test_ai_recommendation_critical():
    response = client.post(
        "/ai/recommend",
        headers=get_auth_headers(),
        json={
            "overall_risk": "CRITICAL",
            "risk_score": 95,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["priority"] == "Immediate"

    assert data["summary"] == (
        "The scan indicates a critical security posture with multiple "
        "high-risk vulnerabilities requiring immediate attention."
    )

    assert data["recommended_actions"] == [
        "Review all critical vulnerabilities immediately.",
        "Restrict unnecessary user privileges.",
        "Enable SSL if it is disabled.",
        "Review audit logs for suspicious activities.",
        "Perform a complete security scan after remediation.",
    ]


def test_ai_recommendation_high():
    response = client.post(
        "/ai/recommend",
        headers=get_auth_headers(),
        json={
            "overall_risk": "HIGH",
            "risk_score": 80,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["priority"] == "High"

    assert data["summary"] == (
        "The database contains several high-risk vulnerabilities that "
        "should be addressed as soon as possible."
    )

    assert data["recommended_actions"] == [
        "Fix high-risk vulnerabilities first.",
        "Review database permissions.",
        "Update outdated configurations.",
        "Run another scan after applying fixes.",
    ]


def test_ai_recommendation_medium():
    response = client.post(
        "/ai/recommend",
        headers=get_auth_headers(),
        json={
            "overall_risk": "MEDIUM",
            "risk_score": 55,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["priority"] == "Medium"

    assert data["summary"] == (
        "The database has moderate security issues that should be "
        "resolved during the next maintenance cycle."
    )

    assert data["recommended_actions"] == [
        "Resolve medium-risk findings.",
        "Monitor database activity regularly.",
        "Review user access periodically.",
    ]


def test_ai_recommendation_low():
    response = client.post(
        "/ai/recommend",
        headers=get_auth_headers(),
        json={
            "overall_risk": "LOW",
            "risk_score": 10,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["priority"] == "Low"

    assert data["summary"] == (
        "The database appears to be secure. Continue following "
        "security best practices."
    )

    assert data["recommended_actions"] == [
        "Continue routine monitoring.",
        "Keep PostgreSQL updated.",
        "Perform scheduled vulnerability scans.",
    ]