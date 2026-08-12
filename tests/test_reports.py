from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_security_report():
    response = client.get("/reports/security")

    assert response.status_code == 200

    data = response.json()

    assert "generated_at" in data
    assert "security_score" in data
    assert "system_status" in data
    assert "total_users" in data
    assert "total_databases" in data
    assert "total_scans" in data
    assert "completed_scans" in data
    assert "total_threats" in data
    assert "critical_threats" in data
    assert "total_incidents" in data
    assert "recommendations" in data

    assert isinstance(data["security_score"], int)
    assert isinstance(data["recommendations"], list)


def test_security_report_pdf():
    response = client.get("/reports/security/pdf")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "AegisX_Security_Report.pdf" in response.headers["content-disposition"]

    assert response.content.startswith(b"%PDF")


def test_security_report_csv():
    response = client.get("/reports/security/csv")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "AegisX_Security_Report.csv" in response.headers["content-disposition"]

    assert "Field,Value" in response.text
    assert "Security Score" in response.text
    assert "System Status" in response.text


def test_security_report_recommendations():
    response = client.get("/reports/security")

    assert response.status_code == 200

    data = response.json()

    assert len(data["recommendations"]) == 3

    if data["system_status"] == "Healthy":
        assert "Continue routine monitoring." in data["recommendations"]

    elif data["system_status"] == "Warning":
        assert "Investigate unresolved threats." in data["recommendations"]

    elif data["system_status"] == "Critical":
        assert "Immediate security review required." in data["recommendations"]


def test_security_report_score_range():
    response = client.get("/reports/security")

    assert response.status_code == 200

    data = response.json()

    assert 0 <= data["security_score"] <= 100