import { useCallback, useEffect, useState } from "react";

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchAuditLogs = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const response = await fetch(`${API_URL}/audit-logs/`);

            if (!response.ok) {
                let errorMessage = `Failed to fetch audit logs (${response.status})`;

                try {
                    const errorData = await response.json();

                    if (errorData?.detail) {
                        errorMessage =
                            typeof errorData.detail === "string"
                                ? errorData.detail
                                : JSON.stringify(errorData.detail);
                    }
                } catch {
                    // Keep the default error message.
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            setLogs(Array.isArray(data?.logs) ? data.logs : []);
        } catch (err) {
            console.error("Audit logs fetch error:", err);

            setError(
                err?.message ||
                    "Unable to connect to the AegisX backend."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadAuditLogs = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${API_URL}/audit-logs/`);

                if (!response.ok) {
                    let errorMessage = `Failed to fetch audit logs (${response.status})`;

                    try {
                        const errorData = await response.json();

                        if (errorData?.detail) {
                            errorMessage =
                                typeof errorData.detail === "string"
                                    ? errorData.detail
                                    : JSON.stringify(errorData.detail);
                        }
                    } catch {
                        // Keep default error message.
                    }

                    throw new Error(errorMessage);
                }

                const data = await response.json();

                if (!cancelled) {
                    setLogs(
                        Array.isArray(data?.logs)
                            ? data.logs
                            : []
                    );
                }
            } catch (err) {
                console.error("Audit logs fetch error:", err);

                if (!cancelled) {
                    setError(
                        err?.message ||
                            "Unable to connect to the AegisX backend."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadAuditLogs();

        return () => {
            cancelled = true;
        };
    }, []);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return "N/A";
        }

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {
            return timestamp;
        }

        return date.toLocaleString();
    };

    const getActionStyle = (action) => {
        const value = String(action || "").toLowerCase();

        if (
            value.includes("delete") ||
            value.includes("remove") ||
            value.includes("critical")
        ) {
            return {
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#f87171",
            };
        }

        if (
            value.includes("create") ||
            value.includes("add") ||
            value.includes("start")
        ) {
            return {
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
                color: "#4ade80",
            };
        }

        if (
            value.includes("update") ||
            value.includes("edit")
        ) {
            return {
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                color: "#fbbf24",
            };
        }

        return {
            background: "rgba(59, 130, 246, 0.12)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            color: "#60a5fa",
        };
    };

    const getStatusStyle = (isActive) => {
        if (isActive) {
            return {
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ade80",
            };
        }

        return {
            background: "rgba(107, 114, 128, 0.12)",
            border: "1px solid rgba(107, 114, 128, 0.3)",
            color: "#9ca3af",
        };
    };

    return (
        <div
            style={{
                minHeight: "100%",
                padding: "28px",
                color: "#e5e7eb",
            }}
        >
            {/* PAGE HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginBottom: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Security Operations
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "26px",
                            fontWeight: 700,
                            color: "#f8fafc",
                        }}
                    >
                        Audit Logs
                    </h1>

                    <p
                        style={{
                            margin: "7px 0 0",
                            fontSize: "13px",
                            color: "#64748b",
                        }}
                    >
                        Monitor security events and system activity.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchAuditLogs(true)}
                    disabled={loading || refreshing}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 15px",
                        borderRadius: "6px",
                        border: "1px solid #1e3a5f",
                        background:
                            loading || refreshing
                                ? "#0b1626"
                                : "#0d1b2e",
                        color: "#60a5fa",
                        cursor:
                            loading || refreshing
                                ? "not-allowed"
                                : "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        opacity:
                            loading || refreshing ? 0.6 : 1,
                    }}
                >
                    <span
                        style={{
                            fontSize: "15px",
                        }}
                    >
                        ↻
                    </span>

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "14px",
                    marginBottom: "20px",
                }}
            >
                <div
                    style={{
                        background: "#08111f",
                        border: "1px solid #162b45",
                        borderRadius: "8px",
                        padding: "18px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginBottom: "8px",
                        }}
                    >
                        TOTAL LOGS
                    </div>

                    <div
                        style={{
                            fontSize: "25px",
                            fontWeight: 700,
                            color: "#f8fafc",
                        }}
                    >
                        {logs.length}
                    </div>
                </div>

                <div
                    style={{
                        background: "#08111f",
                        border: "1px solid #162b45",
                        borderRadius: "8px",
                        padding: "18px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginBottom: "8px",
                        }}
                    >
                        ACTIVE LOGS
                    </div>

                    <div
                        style={{
                            fontSize: "25px",
                            fontWeight: 700,
                            color: "#4ade80",
                        }}
                    >
                        {
                            logs.filter(
                                (log) => log?.is_active === true
                            ).length
                        }
                    </div>
                </div>

                <div
                    style={{
                        background: "#08111f",
                        border: "1px solid #162b45",
                        borderRadius: "8px",
                        padding: "18px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginBottom: "8px",
                        }}
                    >
                        USERS
                    </div>

                    <div
                        style={{
                            fontSize: "25px",
                            fontWeight: 700,
                            color: "#60a5fa",
                        }}
                    >
                        {
                            new Set(
                                logs
                                    .map(
                                        (log) =>
                                            log?.username
                                    )
                                    .filter(Boolean)
                            ).size
                        }
                    </div>
                </div>

                <div
                    style={{
                        background: "#08111f",
                        border: "1px solid #162b45",
                        borderRadius: "8px",
                        padding: "18px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#64748b",
                            marginBottom: "8px",
                        }}
                    >
                        LATEST EVENT
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#f8fafc",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {logs.length > 0
                            ? logs[0]?.action || "Unknown"
                            : "No events"}
                    </div>
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div
                    style={{
                        marginBottom: "18px",
                        padding: "14px 16px",
                        borderRadius: "7px",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        background: "rgba(127, 29, 29, 0.15)",
                        color: "#fca5a5",
                        fontSize: "13px",
                    }}
                >
                    <strong>Connection Error:</strong>{" "}
                    {error}
                </div>
            )}

            {/* TABLE CONTAINER */}
            <div
                style={{
                    background: "#08111f",
                    border: "1px solid #162b45",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                {/* TABLE HEADER */}
                <div
                    style={{
                        padding: "17px 20px",
                        borderBottom: "1px solid #162b45",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "15px",
                                color: "#f8fafc",
                                fontWeight: 650,
                            }}
                        >
                            System Activity
                        </h2>

                        <p
                            style={{
                                margin: "5px 0 0",
                                color: "#64748b",
                                fontSize: "12px",
                            }}
                        >
                            Security events recorded by AegisX.
                        </p>
                    </div>

                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                        }}
                    >
                        {logs.length}{" "}
                        {logs.length === 1 ? "record" : "records"}
                    </div>
                </div>

                {/* LOADING */}
                {loading ? (
                    <div
                        style={{
                            padding: "60px 20px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "13px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "26px",
                                marginBottom: "12px",
                            }}
                        >
                            ◌
                        </div>

                        Loading audit logs...
                    </div>
                ) : logs.length === 0 ? (
                    /* EMPTY STATE */
                    <div
                        style={{
                            padding: "60px 20px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "13px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "30px",
                                marginBottom: "12px",
                                color: "#475569",
                            }}
                        >
                            ◫
                        </div>

                        <div
                            style={{
                                color: "#cbd5e1",
                                fontWeight: 600,
                                marginBottom: "5px",
                            }}
                        >
                            No audit logs found
                        </div>

                        <div>
                            There are currently no active audit
                            events to display.
                        </div>
                    </div>
                ) : (
                    /* TABLE */
                    <div
                        style={{
                            width: "100%",
                            overflowX: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                minWidth: "950px",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: "#0a1625",
                                    }}
                                >
                                    <th
                                        style={headerStyle}
                                    >
                                        ID
                                    </th>

                                    <th
                                        style={headerStyle}
                                    >
                                        USER
                                    </th>

                                    <th
                                        style={headerStyle}
                                    >
                                        ACTION
                                    </th>

                                    <th
                                        style={headerStyle}
                                    >
                                        RESOURCE
                                    </th>

                                    <th
                                        style={headerStyle}
                                    >
                                        DETAILS
                                    </th>

                                    <th
                                        style={headerStyle}
                                    >
                                        TIMESTAMP
                                    </th>

                                    <th
                                        style={headerStyle}
                                    >
                                        STATUS
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        style={{
                                            borderTop:
                                                "1px solid #12243a",
                                        }}
                                    >
                                        <td
                                            style={cellStyle}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748b",
                                                    fontFamily:
                                                        "monospace",
                                                }}
                                            >
                                                #
                                                {log.id}
                                            </span>
                                        </td>

                                        <td
                                            style={cellStyle}
                                        >
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "9px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width:
                                                            "28px",
                                                        height:
                                                            "28px",
                                                        borderRadius:
                                                            "50%",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        background:
                                                            "rgba(59, 130, 246, 0.12)",
                                                        border:
                                                            "1px solid rgba(59, 130, 246, 0.25)",
                                                        color:
                                                            "#60a5fa",
                                                        fontSize:
                                                            "11px",
                                                        fontWeight:
                                                            700,
                                                    }}
                                                >
                                                    {String(
                                                        log.username ||
                                                            "?"
                                                    )
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <span
                                                    style={{
                                                        color:
                                                            "#dbeafe",
                                                        fontWeight:
                                                            550,
                                                    }}
                                                >
                                                    {log.username ||
                                                        "Unknown"}
                                                </span>
                                            </div>
                                        </td>

                                        <td
                                            style={cellStyle}
                                        >
                                            <span
                                                style={{
                                                    ...getActionStyle(
                                                        log.action
                                                    ),
                                                    display:
                                                        "inline-flex",
                                                    padding:
                                                        "5px 9px",
                                                    borderRadius:
                                                        "5px",
                                                    fontSize:
                                                        "11px",
                                                    fontWeight:
                                                        600,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {log.action ||
                                                    "Unknown"}
                                            </span>
                                        </td>

                                        <td
                                            style={cellStyle}
                                        >
                                            <span
                                                style={{
                                                    color:
                                                        "#93c5fd",
                                                    fontSize:
                                                        "12px",
                                                }}
                                            >
                                                {log.resource ||
                                                    "N/A"}
                                            </span>
                                        </td>

                                        <td
                                            style={{
                                                ...cellStyle,
                                                maxWidth:
                                                    "340px",
                                            }}
                                        >
                                            <span
                                                title={
                                                    log.details ||
                                                    ""
                                                }
                                                style={{
                                                    display:
                                                        "block",
                                                    color:
                                                        "#94a3b8",
                                                    fontSize:
                                                        "12px",
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {log.details ||
                                                    "No details"}
                                            </span>
                                        </td>

                                        <td
                                            style={{
                                                ...cellStyle,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color:
                                                        "#94a3b8",
                                                    fontSize:
                                                        "12px",
                                                }}
                                            >
                                                {formatTimestamp(
                                                    log.timestamp
                                                )}
                                            </span>
                                        </td>

                                        <td
                                            style={cellStyle}
                                        >
                                            <span
                                                style={{
                                                    ...getStatusStyle(
                                                        log.is_active
                                                    ),
                                                    display:
                                                        "inline-flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "5px",
                                                    padding:
                                                        "5px 9px",
                                                    borderRadius:
                                                        "5px",
                                                    fontSize:
                                                        "11px",
                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width:
                                                            "5px",
                                                        height:
                                                            "5px",
                                                        borderRadius:
                                                            "50%",
                                                        background:
                                                            log.is_active
                                                                ? "#4ade80"
                                                                : "#9ca3af",
                                                    }}
                                                />

                                                {log.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const headerStyle = {
    padding: "12px 16px",
    textAlign: "left",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.07em",
    whiteSpace: "nowrap",
};

const cellStyle = {
    padding: "13px 16px",
    textAlign: "left",
    verticalAlign: "middle",
};

export default AuditLogs;