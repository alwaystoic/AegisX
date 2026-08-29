from app.features.analyzer.schemas import (
    QueryAnalysisResponse,
    QueryFinding,
)


def analyze_query(query: str) -> QueryAnalysisResponse:
    """
    Analyze a SQL query for multiple security risks.

    Unlike the previous analyzer, this version does not stop after
    detecting the first vulnerability. It evaluates all security rules
    and returns every finding detected in the query.
    """

    sql = query.strip().upper()

    findings = []

    # ---------------------------------------------------------
    # Rule 1 - DELETE without WHERE
    # ---------------------------------------------------------

    if sql.startswith("DELETE") and "WHERE" not in sql:
        findings.append(
            QueryFinding(
                rule="DELETE_WITHOUT_WHERE",
                severity="Critical",
                risk_score=95,
                threat="DELETE without WHERE clause.",
                recommendation="Add a WHERE clause before executing.",
            )
        )

    # ---------------------------------------------------------
    # Rule 2 - UPDATE without WHERE
    # ---------------------------------------------------------

    if sql.startswith("UPDATE") and "WHERE" not in sql:
        findings.append(
            QueryFinding(
                rule="UPDATE_WITHOUT_WHERE",
                severity="High",
                risk_score=85,
                threat="UPDATE without WHERE clause.",
                recommendation="Add a WHERE clause before executing.",
            )
        )

    # ---------------------------------------------------------
    # Rule 3 - DROP TABLE
    # ---------------------------------------------------------

    if "DROP TABLE" in sql:
        findings.append(
            QueryFinding(
                rule="DROP_TABLE",
                severity="Critical",
                risk_score=100,
                threat="DROP TABLE statement detected.",
                recommendation=(
                    "Avoid executing DROP TABLE unless absolutely necessary."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 4 - DROP DATABASE
    # ---------------------------------------------------------

    if "DROP DATABASE" in sql:
        findings.append(
            QueryFinding(
                rule="DROP_DATABASE",
                severity="Critical",
                risk_score=100,
                threat="DROP DATABASE statement detected.",
                recommendation=(
                    "This operation is destructive. Verify before execution."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 5 - TRUNCATE
    # ---------------------------------------------------------

    if "TRUNCATE" in sql:
        findings.append(
            QueryFinding(
                rule="TRUNCATE",
                severity="Critical",
                risk_score=95,
                threat="TRUNCATE statement detected.",
                recommendation="Ensure this operation is intentional.",
            )
        )

    # ---------------------------------------------------------
    # Rule 6 - ALTER TABLE
    # ---------------------------------------------------------

    if "ALTER TABLE" in sql:
        findings.append(
            QueryFinding(
                rule="ALTER_TABLE",
                severity="Medium",
                risk_score=55,
                threat="ALTER TABLE statement detected.",
                recommendation=(
                    "Verify schema modifications before executing."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 7 - CREATE USER
    # ---------------------------------------------------------

    if "CREATE USER" in sql:
        findings.append(
            QueryFinding(
                rule="CREATE_USER",
                severity="Medium",
                risk_score=50,
                threat="CREATE USER statement detected.",
                recommendation=(
                    "Ensure new users follow the principle of least privilege."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 8 - GRANT ALL
    # ---------------------------------------------------------

    if "GRANT ALL" in sql:
        findings.append(
            QueryFinding(
                rule="GRANT_ALL",
                severity="High",
                risk_score=90,
                threat="GRANT ALL privileges detected.",
                recommendation=(
                    "Grant only the minimum required permissions."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 9 - xp_cmdshell
    # ---------------------------------------------------------

    if "XP_CMDSHELL" in sql:
        findings.append(
            QueryFinding(
                rule="XP_CMDSHELL",
                severity="Critical",
                risk_score=100,
                threat="xp_cmdshell detected.",
                recommendation=(
                    "Disable xp_cmdshell unless absolutely required."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 10 - EXEC / EXECUTE
    # ---------------------------------------------------------

    if "EXEC " in sql or "EXECUTE " in sql:
        findings.append(
            QueryFinding(
                rule="EXEC",
                severity="High",
                risk_score=80,
                threat="EXEC statement detected.",
                recommendation=(
                    "Review the executed procedure for security."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 11 - UNION SELECT
    # ---------------------------------------------------------

    if "UNION SELECT" in sql:
        findings.append(
            QueryFinding(
                rule="UNION_SELECT",
                severity="High",
                risk_score=80,
                threat="Possible SQL Injection pattern detected.",
                recommendation=(
                    "Validate user input and use parameterized queries."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 12 - OR 1=1
    # ---------------------------------------------------------

    if "OR 1=1" in sql:
        findings.append(
            QueryFinding(
                rule="OR_1_EQUALS_1",
                severity="Critical",
                risk_score=100,
                threat="Possible SQL Injection detected.",
                recommendation="Use parameterized queries.",
            )
        )

    # ---------------------------------------------------------
    # Rule 13 - SQL comments
    # ---------------------------------------------------------

    if "--" in query or "/*" in query:
        findings.append(
            QueryFinding(
                rule="SQL_COMMENT",
                severity="Medium",
                risk_score=65,
                threat="SQL comment pattern detected.",
                recommendation=(
                    "Review the query for possible injection attempts."
                ),
            )
        )

    # ---------------------------------------------------------
    # Rule 14 - Multiple SQL statements
    # ---------------------------------------------------------

    statement_count = len(
        [statement for statement in query.split(";") if statement.strip()]
    )

    if statement_count > 1:
        findings.append(
            QueryFinding(
                rule="MULTIPLE_STATEMENTS",
                severity="Medium",
                risk_score=60,
                threat="Multiple SQL statements detected.",
                recommendation=(
                    "Execute only one statement at a time."
                ),
            )
        )

    # ---------------------------------------------------------
    # Safe query
    # ---------------------------------------------------------

    if not findings:
        return QueryAnalysisResponse(
            safe=True,
            severity="Low",
            risk_score=0,
            threat="No issues detected.",
            recommendation="Query is safe.",
            findings=[],
        )

    # ---------------------------------------------------------
    # Determine overall severity
    # ---------------------------------------------------------

    severity_priority = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
        "Critical": 4,
    }

    highest_finding = max(
        findings,
        key=lambda finding: severity_priority[finding.severity],
    )

    overall_severity = highest_finding.severity

    # ---------------------------------------------------------
    # Calculate overall risk score
    #
    # Use the highest detected risk rather than simply adding
    # scores together. This prevents several findings from
    # artificially producing a score above 100.
    # ---------------------------------------------------------

    overall_risk_score = max(
        finding.risk_score
        for finding in findings
    )

    return QueryAnalysisResponse(
    safe=False,
    severity=overall_severity,
    risk_score=overall_risk_score,
    threat=highest_finding.threat,
    recommendation=highest_finding.recommendation,
    findings=findings,
)