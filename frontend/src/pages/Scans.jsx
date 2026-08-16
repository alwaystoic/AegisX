import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function Scans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [form, setForm] = useState({
    scan_name: "",
    database_name: "",
  });

  const authHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const fetchScans = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/scan/`, {
        method: "GET",
        headers: authHeaders(),
      });

      if (response.status === 401) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error("Failed to fetch scans.");
      }

      const data = await response.json();
      setScans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch scans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleCreateScan = async (e) => {
    e.preventDefault();

    if (!form.scan_name.trim() || !form.database_name.trim()) {
      setError("Please enter both scan name and database name.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/scan/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          scan_name: form.scan_name.trim(),
          database_name: form.database_name.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      if (!response.ok) {
        let message = "Failed to create scan.";

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          // Keep default message
        }

        throw new Error(message);
      }

      setForm({
        scan_name: "",
        database_name: "",
      });

      setShowCreate(false);

      await fetchScans();
    } catch (err) {
      setError(err.message || "Failed to create scan.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteScan = async (scanId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this scan?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(scanId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/scan/${scanId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      if (!response.ok) {
        let message = "Failed to delete scan.";

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {
          // Keep default message
        }

        throw new Error(message);
      }

      setScans((current) =>
        current.filter((scan) => scan.id !== scanId)
      );

      if (selectedScan?.id === scanId) {
        setSelectedScan(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete scan.");
    } finally {
      setDeleting(null);
    }
  };

  const getSeverityClass = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return "critical";
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "low";
    }
  };

  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "completed";
      case "running":
        return "running";
      case "failed":
        return "failed";
      default:
        return "pending";
    }
  };

  const totalVulnerabilities = scans.reduce(
    (total, scan) =>
      total + Number(scan.vulnerabilities_found || 0),
    0
  );

  const completedScans = scans.filter(
    (scan) => scan.status?.toLowerCase() === "completed"
  ).length;

  const highRiskScans = scans.filter(
    (scan) =>
      ["critical", "high"].includes(
        scan.severity?.toLowerCase()
      )
  ).length;

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <p className="page-breadcrumb">Security Operations</p>

          <h1 className="page-title">Scans</h1>

          <p className="page-description">
            Run and monitor security scans across your connected
            databases.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={fetchScans}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />
            Refresh
          </button>

          <button
            className="primary-button"
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
          >
            <Plus size={17} />
            New Scan
          </button>
        </div>
      </div>

      {error && (
        <div className="page-error">
          <AlertTriangle size={17} />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="scan-summary-grid">
        <div className="scan-summary-card">
          <div className="scan-summary-icon blue">
            <Search size={20} />
          </div>

          <div>
            <span>Total Scans</span>
            <strong>{scans.length}</strong>
            <small>Security scans performed</small>
          </div>
        </div>

        <div className="scan-summary-card">
          <div className="scan-summary-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedScans}</strong>
            <small>Successfully completed</small>
          </div>
        </div>

        <div className="scan-summary-card">
          <div className="scan-summary-icon orange">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>High Risk</span>
            <strong>{highRiskScans}</strong>
            <small>High or critical severity</small>
          </div>
        </div>

        <div className="scan-summary-card">
          <div className="scan-summary-icon red">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Vulnerabilities</span>
            <strong>{totalVulnerabilities}</strong>
            <small>Total vulnerabilities found</small>
          </div>
        </div>
      </div>

      <section className="page-panel">
        <div className="page-panel-header">
          <div>
            <h2>Security Scans</h2>
            <p>
              Review previously performed database security scans.
            </p>
          </div>

          <div className="scan-count">
            {scans.length} {scans.length === 1 ? "scan" : "scans"}
          </div>
        </div>

        {loading ? (
          <div className="scan-loading">
            <RefreshCw size={24} className="spin" />
            <h3>Loading scans...</h3>
            <p>Fetching security scan information.</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="scan-empty">
            <div className="scan-empty-icon">
              <Search size={28} />
            </div>

            <h3>No scans found</h3>

            <p>
              Create your first security scan to analyze a
              connected database.
            </p>

            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setShowCreate(true);
              }}
            >
              <Plus size={17} />
              Create First Scan
            </button>
          </div>
        ) : (
          <div className="scan-table-wrapper">
            <table className="scan-table">
              <thead>
                <tr>
                  <th>SCAN</th>
                  <th>DATABASE</th>
                  <th>STATUS</th>
                  <th>SEVERITY</th>
                  <th>VULNERABILITIES</th>
                  <th>RECOMMENDATION</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <div className="scan-name-cell">
                        <div className="scan-row-icon">
                          <Search size={17} />
                        </div>

                        <div>
                          <strong>{scan.scan_name}</strong>
                          <span>Scan #{scan.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="database-cell">
                        <Database size={15} />
                        <span>{scan.database_name}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`scan-status ${getStatusClass(
                          scan.status
                        )}`}
                      >
                        {scan.status === "Completed" && (
                          <CheckCircle2 size={13} />
                        )}

                        {scan.status === "Running" && (
                          <Clock3 size={13} />
                        )}

                        {scan.status !== "Completed" &&
                          scan.status !== "Running" && (
                            <span className="status-small-dot" />
                          )}

                        {scan.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`severity-badge ${getSeverityClass(
                          scan.severity
                        )}`}
                      >
                        {scan.severity || "Low"}
                      </span>
                    </td>

                    <td>
                      <span className="vulnerability-count">
                        {scan.vulnerabilities_found ?? 0}
                      </span>
                    </td>

                    <td>
                      <div className="recommendation-cell">
                        {scan.recommendation ? (
                          <>
                            <span>
                              {scan.recommendation
                                .split("\n")[0]
                                .substring(0, 75)}
                              {scan.recommendation.length > 75
                                ? "..."
                                : ""}
                            </span>
                          </>
                        ) : (
                          <span className="muted-text">
                            No recommendation
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="scan-actions">
                        <button
                          className="table-icon-button"
                          title="View scan"
                          onClick={() => setSelectedScan(scan)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="table-icon-button danger"
                          title="Delete scan"
                          disabled={deleting === scan.id}
                          onClick={() =>
                            handleDeleteScan(scan.id)
                          }
                        >
                          {deleting === scan.id ? (
                            <RefreshCw
                              size={16}
                              className="spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showCreate && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreate(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Create Security Scan</h2>
                <p>
                  Start a new security analysis for a database.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateScan}>
              <div className="form-group">
                <label htmlFor="scan_name">Scan Name</label>

                <input
                  id="scan_name"
                  type="text"
                  placeholder="e.g. Production Database Scan"
                  value={form.scan_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scan_name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="database_name">
                  Database Name
                </label>

                <input
                  id="database_name"
                  type="text"
                  placeholder="e.g. production_db"
                  value={form.database_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      database_name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-info">
                <ShieldCheck size={17} />

                <span>
                  The backend security scanner will collect the
                  current database health information and generate
                  the scan result.
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="spin"
                      />
                      Running Scan...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Start Scan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedScan && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedScan(null);
            }
          }}
        >
          <div className="modal scan-details-modal">
            <div className="modal-header">
              <div>
                <h2>{selectedScan.scan_name}</h2>
                <p>Security Scan #{selectedScan.id}</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedScan(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="scan-detail-grid">
              <div>
                <span>Database</span>
                <strong>{selectedScan.database_name}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedScan.status}</strong>
              </div>

              <div>
                <span>Severity</span>
                <strong
                  className={`severity-text ${getSeverityClass(
                    selectedScan.severity
                  )}`}
                >
                  {selectedScan.severity}
                </strong>
              </div>

              <div>
                <span>Vulnerabilities</span>
                <strong>
                  {selectedScan.vulnerabilities_found ?? 0}
                </strong>
              </div>
            </div>

            <div className="recommendation-panel">
              <div className="recommendation-title">
                <ShieldCheck size={17} />
                <span>Security Recommendation</span>
              </div>

              <pre>
                {selectedScan.recommendation ||
                  "No recommendation available."}
              </pre>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelectedScan(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scans;