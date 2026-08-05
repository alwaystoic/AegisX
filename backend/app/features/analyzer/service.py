from app.features.analyzer.schemas import (
    QueryAnalysisResponse,
)


def analyze_query(query: str) -> QueryAnalysisResponse:

    sql = query.strip().upper()

    # Safe query
    safe = True
    severity = "Low"
    threat = "No issues detected."
    recommendation = "Query is safe."

    # DELETE without WHERE
    if sql.startswith("DELETE") and "WHERE" not in sql:
        safe = False
        severity = "Critical"
        threat = "DELETE without WHERE clause."
        recommendation = "Add a WHERE clause before executing."

    # UPDATE without WHERE
    elif sql.startswith("UPDATE") and "WHERE" not in sql:
        safe = False
        severity = "High"
        threat = "UPDATE without WHERE clause."
        recommendation = "Add a WHERE clause before executing."

    # DROP TABLE
    elif "DROP TABLE" in sql:
        safe = False
        severity = "Critical"
        threat = "DROP TABLE statement detected."
        recommendation = "Avoid executing DROP TABLE unless absolutely necessary."

    # TRUNCATE
    elif "TRUNCATE" in sql:
        safe = False
        severity = "Critical"
        threat = "TRUNCATE statement detected."
        recommendation = "Ensure this operation is intentional."

    # UNION SELECT
    elif "UNION SELECT" in sql:
        safe = False
        severity = "High"
        threat = "Possible SQL Injection pattern detected."
        recommendation = "Validate user input and use parameterized queries."

    # Multiple SQL statements
    elif sql.count(";") > 1:
        safe = False
        severity = "Medium"
        threat = "Multiple SQL statements detected."
        recommendation = "Execute only one statement at a time."

    return QueryAnalysisResponse(
        safe=safe,
        severity=severity,
        threat=threat,
        recommendation=recommendation,
    )