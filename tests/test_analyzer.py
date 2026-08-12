from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_analyze_safe_query():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "SELECT * FROM users WHERE id = 1"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is True
    assert data["severity"] == "Low"
    assert data["risk_score"] == 0
    assert data["threat"] == "No issues detected."
    assert data["recommendation"] == "Query is safe."

def test_analyze_delete_without_where():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "DELETE FROM users"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Critical"
    assert data["risk_score"] == 95
    assert data["threat"] == "DELETE without WHERE clause."
    assert data["recommendation"] == "Add a WHERE clause before executing."

def test_analyze_update_without_where():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "UPDATE users SET username = 'admin'"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "High"
    assert data["risk_score"] == 85
    assert data["threat"] == "UPDATE without WHERE clause."
    assert data["recommendation"] == "Add a WHERE clause before executing."
def test_analyze_drop_table():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "DROP TABLE users"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Critical"
    assert data["risk_score"] == 100
    assert data["threat"] == "DROP TABLE statement detected."
    assert data["recommendation"] == (
        "Avoid executing DROP TABLE unless absolutely necessary."
    )

def test_analyze_drop_database():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "DROP DATABASE production"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Critical"
    assert data["risk_score"] == 100
    assert data["threat"] == "DROP DATABASE statement detected."
    assert data["recommendation"] == (
        "This operation is destructive. Verify before execution."
    )

def test_analyze_truncate():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "TRUNCATE TABLE users"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Critical"
    assert data["risk_score"] == 95
    assert data["threat"] == "TRUNCATE statement detected."
    assert data["recommendation"] == "Ensure this operation is intentional."

def test_analyze_alter_table():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "ALTER TABLE users ADD COLUMN age INT"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Medium"
    assert data["risk_score"] == 55
    assert data["threat"] == "ALTER TABLE statement detected."
    assert data["recommendation"] == (
        "Verify schema modifications before executing."
    )

def test_analyze_create_user():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "CREATE USER testuser"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Medium"
    assert data["risk_score"] == 50
    assert data["threat"] == "CREATE USER statement detected."
    assert data["recommendation"] == (
        "Ensure new users follow the principle of least privilege."
    )

def test_analyze_grant_all():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "GRANT ALL PRIVILEGES ON DATABASE testdb TO testuser"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "High"
    assert data["risk_score"] == 90
    assert data["threat"] == "GRANT ALL privileges detected."
    assert data["recommendation"] == (
        "Grant only the minimum required permissions."
    )

def test_analyze_exec():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "EXEC my_procedure"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "High"
    assert data["risk_score"] == 80
    assert data["threat"] == "EXEC statement detected."
    assert data["recommendation"] == (
        "Review the executed procedure for security."
    )

def test_analyze_xp_cmdshell():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "EXEC xp_cmdshell 'dir'"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Critical"
    assert data["risk_score"] == 100
    assert data["threat"] == "xp_cmdshell detected."
    assert data["recommendation"] == (
        "Disable xp_cmdshell unless absolutely required."
    )

def test_analyze_union_select():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "SELECT username FROM users UNION SELECT password FROM admins"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "High"
    assert data["risk_score"] == 80
    assert data["threat"] == "Possible SQL Injection pattern detected."
    assert data["recommendation"] == (
        "Validate user input and use parameterized queries."
    )

def test_analyze_or_1_equals_1():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "SELECT * FROM users WHERE username = 'admin' OR 1=1"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Critical"
    assert data["risk_score"] == 100
    assert data["threat"] == "Possible SQL Injection detected."
    assert data["recommendation"] == "Use parameterized queries."

def test_analyze_sql_comment():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "SELECT * FROM users -- bypass authentication"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Medium"
    assert data["risk_score"] == 65
    assert data["threat"] == "SQL comment pattern detected."
    assert data["recommendation"] == (
        "Review the query for possible injection attempts."
    )

def test_analyze_multiple_statements():
    response = client.post(
        "/analyzer/analyze",
        json={
            "query": "SELECT * FROM users; DELETE FROM users;"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["safe"] is False
    assert data["severity"] == "Medium"
    assert data["risk_score"] == 60
    assert data["threat"] == "Multiple SQL statements detected."
    assert data["recommendation"] == (
        "Execute only one statement at a time."
    )