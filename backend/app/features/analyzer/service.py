from app.features.analyzer.schemas import QueryAnalysisResponse


def analyze_query(query: str) -> QueryAnalysisResponse:
    sql = query.strip().upper()

    # Default (safe)
    safe = True
    severity = "Low"
    risk_score = 0
    threat = "No issues detected."
    recommendation = "Query is safe."

    # DELETE without WHERE
    if sql.startswith("DELETE") and "WHERE" not in sql:
        safe = False
        severity = "Critical"
        risk_score = 95
        threat = "DELETE without WHERE clause."
        recommendation = "Add a WHERE clause before executing."

    # UPDATE without WHERE
    elif sql.startswith("UPDATE") and "WHERE" not in sql:
        safe = False
        severity = "High"
        risk_score = 85
        threat = "UPDATE without WHERE clause."
        recommendation = "Add a WHERE clause before executing."

    # DROP TABLE
    elif "DROP TABLE" in sql:
        safe = False
        severity = "Critical"
        risk_score = 100
        threat = "DROP TABLE statement detected."
        recommendation = (
            "Avoid executing DROP TABLE unless absolutely necessary."
        )

    # DROP DATABASE
    elif "DROP DATABASE" in sql:
        safe = False
        severity = "Critical"
        risk_score = 100
        threat = "DROP DATABASE statement detected."
        recommendation = (
            "This operation is destructive. Verify before execution."
        )

    # TRUNCATE
    elif "TRUNCATE" in sql:
        safe = False
        severity = "Critical"
        risk_score = 95
        threat = "TRUNCATE statement detected."
        recommendation = "Ensure this operation is intentional."

    # ALTER TABLE
    elif "ALTER TABLE" in sql:
        safe = False
        severity = "Medium"
        risk_score = 55
        threat = "ALTER TABLE statement detected."
        recommendation = (
            "Verify schema modifications before executing."
        )

    # CREATE USER
    elif "CREATE USER" in sql:
        safe = False
        severity = "Medium"
        risk_score = 50
        threat = "CREATE USER statement detected."
        recommendation = (
            "Ensure new users follow the principle of least privilege."
        )

    # GRANT ALL
    elif "GRANT ALL" in sql:
        safe = False
        severity = "High"
        risk_score = 90
        threat = "GRANT ALL privileges detected."
        recommendation = (
            "Grant only the minimum required permissions."
        )

    # EXEC / EXECUTE
    elif "EXEC " in sql or "EXECUTE " in sql:
        safe = False
        severity = "High"
        risk_score = 80
        threat = "EXEC statement detected."
        recommendation = (
            "Review the executed procedure for security."
        )

    # xp_cmdshell
    elif "XP_CMDSHELL" in sql:
        safe = False
        severity = "Critical"
        risk_score = 100
        threat = "xp_cmdshell detected."
        recommendation = (
            "Disable xp_cmdshell unless absolutely required."
        )

    # UNION SELECT
    elif "UNION SELECT" in sql:
        safe = False
        severity = "High"
        risk_score = 80
        threat = "Possible SQL Injection pattern detected."
        recommendation = (
            "Validate user input and use parameterized queries."
        )

    # OR 1=1
    elif "OR 1=1" in sql:
        safe = False
        severity = "Critical"
        risk_score = 100
        threat = "Possible SQL Injection detected."
        recommendation = "Use parameterized queries."

    # SQL comments
    elif "--" in query or "/*" in query:
        safe = False
        severity = "Medium"
        risk_score = 65
        threat = "SQL comment pattern detected."
        recommendation = (
            "Review the query for possible injection attempts."
        )

    # Multiple SQL statements
    elif sql.count(";") > 1:
        safe = False
        severity = "Medium"
        risk_score = 60
        threat = "Multiple SQL statements detected."
        recommendation = (
            "Execute only one statement at a time."
        )

    return QueryAnalysisResponse(
        safe=safe,
        severity=severity,
        risk_score=risk_score,
        threat=threat,
        recommendation=recommendation,
    )