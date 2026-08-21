import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAuditLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/audit-logs/`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audit logs (${response.status})`
        );
      }

      const data = await response.json();

      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      console.error("Audit logs fetch error:", err);

      setError(
        err.message ||
          "Unable to connect to the AegisX backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadAuditLogs = async () => {
      try {
        const response = await fetch(`${API_URL}/audit-logs/`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch audit logs (${response.status})`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setLogs(Array.isArray(data.logs) ? data.logs : []);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Audit logs fetch error:", err);

          setError(
            err.message ||
              "Unable to connect to the AegisX backend."
          );

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

  const getActionClass = (action) => {
    const value = String(action || "").toLowerCase();

    if (
      value.includes("delete") ||
      value.includes("remove") ||
      value.includes("block")
    ) {
      return "danger";
    }

    if (
      value.includes("create") ||
      value.includes("add") ||
      value.includes("start")
    ) {
      return "success";
    }

    if (
      value.includes("update") ||
      value.includes("modify") ||
      value.includes("change")
    ) {
      return "warning";
    }

    return "info";
  };

  const totalLogs = logs.length;

  const activeLogs = logs.filter(
    (log) => log.is_active
  ).length;

  const uniqueUsers = new Set(
    logs
      .map((log) => log.username)
      .filter(Boolean)
  ).size;

  const uniqueResources = new Set(
    logs
      .map((log) => log.resource)
      .filter(Boolean)
  ).size;

  return (
    <div className="audit-page">
      <style>{`
        .audit-page {
          width: 100%;
          min-height: 100%;
          color: #e5edf8;
        }

        .audit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .audit-title-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .audit-icon {
          width: 42px;
          height: 42px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #102443;
          border: 1px solid #1d4f8f;
          color: #3b9cff;
          font-size: 20px;
        }

        .audit-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #f4f8ff;
        }

        .audit-subtitle {
          margin: 4px 0 0;
          color: #71829d;
          font-size: 11px;
        }

        .audit-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .audit-status {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid #145c45;
          border-radius: 5px;
          background: #071d18;
          color: #29d391;
          font-size: 10px;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22d995;
          box-shadow: 0 0 7px rgba(34, 217, 149, 0.7);
        }

        .refresh-btn {
          border: 1px solid #29405f;
          background: #0c1626;
          color: #b7c8df;
          border-radius: 5px;
          padding: 8px 13px;
          font-size: 11px;
          cursor: pointer;
        }

        .refresh-btn:hover {
          border-color: #3976b9;
          color: #ffffff;
          background: #102039;
        }

        .refresh-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .audit-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .stat-card {
          min-height: 78px;
          padding: 14px;
          border: 1px solid #1d2e47;
          border-radius: 7px;
          background: #0c1523;
        }

        .stat-label {
          color: #667b99;
          font-size: 10px;
          margin-bottom: 9px;
        }

        .stat-value {
          color: #edf4ff;
          font-size: 22px;
          line-height: 1;
          font-weight: 700;
        }

        .stat-value.green {
          color: #29d391;
        }

        .logs-card {
          border: 1px solid #1d2e47;
          border-radius: 7px;
          background: #0b1421;
          overflow: hidden;
        }

        .logs-card-header {
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid #1d2e47;
        }

        .logs-card-title {
          margin: 0;
          color: #dce8f8;
          font-size: 12px;
          font-weight: 700;
        }

        .logs-count {
          color: #617591;
          font-size: 10px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .audit-table th {
          text-align: left;
          padding: 11px 14px;
          background: #0d1929;
          border-bottom: 1px solid #1d2e47;
          color: #657995;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .audit-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #17263b;
          color: #aebed3;
          font-size: 10px;
          vertical-align: middle;
        }

        .audit-table tbody tr:hover {
          background: #0d1a2b;
        }

        .audit-table tbody tr:last-child td {
          border-bottom: none;
        }

        .username {
          color: #e6eef9;
          font-weight: 600;
        }

        .resource {
          color: #81b9f5;
        }

        .details {
          display: block;
          color: #71849f;
          max-width: 280px;
          line-height: 1.4;
        }

        .action-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          border: 1px solid transparent;
        }

        .action-badge.info {
          color: #62adff;
          background: #0b213b;
          border-color: #194b7c;
        }

        .action-badge.success {
          color: #2ed89b;
          background: #09241c;
          border-color: #155d46;
        }

        .action-badge.warning {
          color: #f1c65c;
          background: #28200b;
          border-color: #6c5318;
        }

        .action-badge.danger {
          color: #ff6b6b;
          background: #2a1114;
          border-color: #74242a;
        }

        .active-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #2ed89b;
          font-size: 9px;
          font-weight: 600;
        }

        .inactive-badge {
          color: #6d7d94;
          font-size: 9px;
        }

        .loading-state,
        .empty-state,
        .error-state {
          padding: 45px 20px;
          text-align: center;
          color: #687b96;
          font-size: 11px;
        }

        .error-state {
          color: #ff7272;
        }

        .retry-btn {
          margin-top: 12px;
          border: 1px solid #315a86;
          background: #10233c;
          color: #79b8f7;
          border-radius: 5px;
          padding: 7px 12px;
          font-size: 10px;
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #143052;
          border-color: #4788c5;
        }

        @media (max-width: 1000px) {
          .audit-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .audit-actions {
            width: 100%;
          }
        }

        @media (max-width: 900px) {
          .audit-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .audit-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="audit-header">
        <div className="audit-title-section">
          <div className="audit-icon">
            ◷
          </div>

          <div>
            <h1 className="audit-title">
              Audit Logs
            </h1>

            <p className="audit-subtitle">
              Monitor security activity and system operations.
            </p>
          </div>
        </div>

        <div className="audit-actions">
          <div className="audit-status">
            <span className="status-dot" />
            Audit Engine Ready
          </div>

          <button
            className="refresh-btn"
            onClick={() => fetchAuditLogs(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="audit-stats">
        <div className="stat-card">
          <div className="stat-label">
            Total Events
          </div>

          <div className="stat-value">
            {totalLogs}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Active Events
          </div>

          <div className="stat-value green">
            {activeLogs}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Users
          </div>

          <div className="stat-value">
            {uniqueUsers}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            Resources
          </div>

          <div className="stat-value">
            {uniqueResources}
          </div>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="logs-card">
        <div className="logs-card-header">
          <h2 className="logs-card-title">
            Security Activity
          </h2>

          <span className="logs-count">
            {totalLogs}{" "}
            {totalLogs === 1 ? "event" : "events"}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading audit logs...
          </div>
        ) : error ? (
          <div className="error-state">
            <div>{error}</div>

            <button
              className="retry-btn"
              onClick={() => fetchAuditLogs(true)}
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            No audit logs available.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      #{log.id}
                    </td>

                    <td>
                      <span className="username">
                        {log.username || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`action-badge ${getActionClass(
                          log.action
                        )}`}
                      >
                        {log.action || "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="resource">
                        {log.resource || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="details">
                        {log.details ||
                          "No details available"}
                      </span>
                    </td>

                    <td>
                      {formatTimestamp(
                        log.timestamp
                      )}
                    </td>

                    <td>
                      {log.is_active ? (
                        <span className="active-badge">
                          <span className="status-dot" />
                          Active
                        </span>
                      ) : (
                        <span className="inactive-badge">
                          Inactive
                        </span>
                      )}
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

export default AuditLogs;