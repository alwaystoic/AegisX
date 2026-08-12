from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_threat_detection_low():
    response = client.post(
        "/threat-detection/analyze",
        json={
            "vulnerability_count": 0,
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["overall_risk"] == "Low"
    assert data["risk_score"] == 0
    assert data["confidence"] == 70


def test_threat_detection_medium():
    response = client.post(
        "/threat-detection/analyze",
        json={
            "vulnerability_count": 1,
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 1,
            "low_count": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["overall_risk"] == "Medium"
    assert data["risk_score"] == 50
    assert data["confidence"] == 75


def test_threat_detection_high():
    response = client.post(
        "/threat-detection/analyze",
        json={
            "vulnerability_count": 1,
            "critical_count": 0,
            "high_count": 1,
            "medium_count": 0,
            "low_count": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["overall_risk"] == "High"
    assert data["risk_score"] == 75
    assert data["confidence"] == 75


def test_threat_detection_critical():
    response = client.post(
        "/threat-detection/analyze",
        json={
            "vulnerability_count": 1,
            "critical_count": 1,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["overall_risk"] == "Critical"
    assert data["risk_score"] == 100
    assert data["confidence"] == 75