import { useEffect, useState } from "react";

import {
  FileText,
  Download,
  RefreshCw,
  ShieldCheck,
  Database,
  ScanSearch,
  AlertTriangle,
  Siren,
  Users,
  CheckCircle2,
  Activity,
  FileDown,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/reports/security`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate security report."
        );
      }

      setReport(data);
    } catch (err) {
      console.error("Report fetch error:", err);

      setError(
        err.message ||
          "Unable to connect to the AegisX backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadReport = async () => {
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/reports/security`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Failed to generate security report."
          );
        }

        setReport(data);
      } catch (err) {
        console.error("Report fetch error:", err);

        setError(
          err.message ||
            "Unable to connect to the AegisX backend."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, []);

  const downloadFile = async (type) => {
    const isPdf = type === "pdf";

    if (isPdf) {
      setDownloadingPdf(true);
    } else {
      setDownloadingCsv(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/reports/security/${type}`
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail ||
            `Failed to download ${type.toUpperCase()} report.`
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = isPdf
        ? "AegisX_Security_Report.pdf"
        : "AegisX_Security_Report.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report download error:", err);

      setError(
        err.message ||
          `Unable to download the ${type.toUpperCase()} report.`
      );
    } finally {
      if (isPdf) {
        setDownloadingPdf(false);
      } else {
        setDownloadingCsv(false);
      }
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "good";
    if (score >= 50) return "warning";
    return "critical";
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value.includes("healthy")) return "good";
    if (value.includes("warning")) return "warning";

    return "critical";
  };

  const score = report?.security_score ?? 0;

  return (
    <div className="reports-page">
      <style>{`
        .reports-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 34px 50px;
          box-sizing: border-box;
          color: #f8fafc;
        }

        .reports-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .reports-title-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .reports-title-icon {
          width: 42px;
          height: 42px;
          border: 1px solid #17345d;
          background: #0b1b31;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .reports-title {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
        }

        .reports-subtitle {
          margin: 4px 0 0;
          color: #71819a;
          font-size: 11px;
        }

        .reports-header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .report-button {
          height: 34px;
          padding: 0 13px;
          border-radius: 6px;
          border: 1px solid #223450;
          background: #0b1422;
          color: #b9c7da;
          font-size: 11px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
        }

        .report-button:hover:not(:disabled) {
          background: #111f32;
          border-color: #31517a;
          color: #ffffff;
        }

        .report-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .report-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 28px;
          padding: 0 10px;
          border-radius: 6px;
          border: 1px solid #123e2b;
          background: #071d15;
          color: #34d399;
          font-size: 10px;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        .report-error {
          border: 1px solid #5b2025;
          background: #1c0d10;
          color: #fca5a5;
          padding: 11px 13px;
          border-radius: 7px;
          font-size: 11px;
          margin-bottom: 18px;
        }

        .report-loading {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #18263a;
          border-radius: 8px;
          background: #0b1421;
          color: #7d8da5;
          font-size: 12px;
        }

        .report-overview {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .report-card {
          border: 1px solid #192a40;
          background: #0b1421;
          border-radius: 8px;
          overflow: hidden;
        }

        .report-card-header {
          min-height: 50px;
          padding: 13px 16px;
          border-bottom: 1px solid #192a40;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .report-card-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 700;
          color: #e8eef7;
        }

        .report-card-title svg {
          color: #3b82f6;
        }

        .report-card-body {
          padding: 17px;
        }

        .security-score-layout {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .score-circle {
          width: 108px;
          height: 108px;
          flex: 0 0 108px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07101c;
          border: 8px solid #17345d;
        }

        .score-circle.good {
          border-color: #166534;
        }

        .score-circle.warning {
          border-color: #a16207;
        }

        .score-circle.critical {
          border-color: #991b1b;
        }

        .score-number {
          font-size: 29px;
          font-weight: 800;
          line-height: 1;
          text-align: center;
        }

        .score-number.good {
          color: #34d399;
        }

        .score-number.warning {
          color: #fbbf24;
        }

        .score-number.critical {
          color: #f87171;
        }

        .score-label {
          color: #687b95;
          font-size: 9px;
          margin-top: 5px;
          text-align: center;
        }

        .score-details {
          flex: 1;
        }

        .score-details-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .score-details-text {
          color: #71819a;
          font-size: 10px;
          line-height: 1.6;
        }

        .system-status {
          margin-top: 13px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 9px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 700;
        }

        .system-status.good {
          color: #34d399;
          background: #062219;
          border: 1px solid #104d36;
        }

        .system-status.warning {
          color: #fbbf24;
          background: #211b07;
          border: 1px solid #5a470d;
        }

        .system-status.critical {
          color: #f87171;
          background: #260e11;
          border: 1px solid #5b2025;
        }

        .report-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .download-card {
          padding: 16px;
          border: 1px solid #192a40;
          background: #0b1421;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .download-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          border-radius: 7px;
          background: #0d1e35;
          border: 1px solid #1b3b66;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }

        .download-content {
          flex: 1;
        }

        .download-title {
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .download-description {
          color: #657892;
          font-size: 9px;
          line-height: 1.4;
        }

        .download-button {
          height: 29px;
          padding: 0 9px;
          border-radius: 5px;
          border: 1px solid #263a56;
          background: #0d1726;
          color: #a9bad0;
          font-size: 9px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .download-button:hover:not(:disabled) {
          border-color: #3266a3;
          color: #ffffff;
        }

        .download-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }

        .metric-card {
          border: 1px solid #192a40;
          background: #0b1421;
          border-radius: 8px;
          padding: 14px;
          min-height: 78px;
          box-sizing: border-box;
        }

        .metric-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .metric-icon {
          width: 27px;
          height: 27px;
          border-radius: 6px;
          background: #0c1b2f;
          border: 1px solid #183b66;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 800;
          color: #f8fafc;
        }

        .metric-label {
          font-size: 9px;
          color: #657892;
        }

        .report-bottom {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 16px;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #192a40;
        }

        .stat-item {
          background: #0b1421;
          padding: 13px 15px;
          min-height: 48px;
        }

        .stat-label {
          color: #647791;
          font-size: 9px;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 700;
          color: #e7edf6;
        }

        .recommendations {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .recommendation {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 10px;
          border: 1px solid #17273c;
          background: #09121e;
          border-radius: 6px;
        }

        .recommendation-number {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          border-radius: 5px;
          background: #0d2340;
          color: #60a5fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
        }

        .recommendation-text {
          color: #9aabc0;
          font-size: 10px;
          line-height: 1.5;
          padding-top: 2px;
        }

        .empty-recommendations {
          color: #687b95;
          font-size: 10px;
          padding: 10px 0;
        }

        @media (max-width: 1000px) {
          .report-overview,
          .report-bottom {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .reports-page {
            padding: 20px 15px 35px;
          }

          .reports-header {
            flex-direction: column;
          }

          .reports-header-actions {
            width: 100%;
          }

          .report-button {
            flex: 1;
          }

          .report-actions {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: 1fr 1fr;
          }

          .security-score-layout {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="reports-header">
        <div className="reports-title-section">
          <div className="reports-title-icon">
            <FileText size={21} />
          </div>

          <div>
            <h1 className="reports-title">
              Security Reports
            </h1>

            <p className="reports-subtitle">
              Generate and download comprehensive AegisX security reports.
            </p>
          </div>
        </div>

        <div className="reports-header-actions">
          <div className="report-status">
            <span className="status-dot" />
            Report Engine Ready
          </div>

          <button
            className="report-button"
            onClick={fetchReport}
            disabled={loading}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {loading && !report ? (
        <div className="report-loading">
          Generating security report...
        </div>
      ) : (
        <>
          <div className="report-overview">
            <div className="report-card">
              <div className="report-card-header">
                <div className="report-card-title">
                  <ShieldCheck size={15} />
                  Security Assessment
                </div>

                <span
                  style={{
                    color: "#62748e",
                    fontSize: "9px",
                  }}
                >
                  Current posture
                </span>
              </div>

              <div className="report-card-body">
                <div className="security-score-layout">
                  <div
                    className={`score-circle ${getScoreClass(
                      score
                    )}`}
                  >
                    <div>
                      <div
                        className={`score-number ${getScoreClass(
                          score
                        )}`}
                      >
                        {score}
                      </div>

                      <div className="score-label">
                        / 100
                      </div>
                    </div>
                  </div>

                  <div className="score-details">
                    <div className="score-details-title">
                      Security Score
                    </div>

                    <div className="score-details-text">
                      Overall security posture based on
                      databases, scans, threats and
                      security incidents detected by AegisX.
                    </div>

                    <div
                      className={`system-status ${getStatusClass(
                        report?.system_status
                      )}`}
                    >
                      <Activity size={11} />

                      {report?.system_status ||
                        "Unknown"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-card-header">
                <div className="report-card-title">
                  <Download size={15} />
                  Export Security Report
                </div>
              </div>

              <div className="report-card-body">
                <div className="report-actions">
                  <div className="download-card">
                    <div className="download-icon">
                      <FileDown size={17} />
                    </div>

                    <div className="download-content">
                      <div className="download-title">
                        PDF Report
                      </div>

                      <div className="download-description">
                        Complete formatted security report.
                      </div>
                    </div>

                    <button
                      className="download-button"
                      onClick={() =>
                        downloadFile("pdf")
                      }
                      disabled={downloadingPdf}
                    >
                      <Download size={11} />
                      {downloadingPdf ? "..." : "PDF"}
                    </button>
                  </div>

                  <div className="download-card">
                    <div className="download-icon">
                      <FileText size={17} />
                    </div>

                    <div className="download-content">
                      <div className="download-title">
                        CSV Report
                      </div>

                      <div className="download-description">
                        Structured report data for analysis.
                      </div>
                    </div>

                    <button
                      className="download-button"
                      onClick={() =>
                        downloadFile("csv")
                      }
                      disabled={downloadingCsv}
                    >
                      <Download size={11} />
                      {downloadingCsv ? "..." : "CSV"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-top">
                <div className="metric-label">
                  Total Users
                </div>

                <div className="metric-icon">
                  <Users size={14} />
                </div>
              </div>

              <div className="metric-value">
                {report?.total_users ?? 0}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <div className="metric-label">
                  Databases
                </div>

                <div className="metric-icon">
                  <Database size={14} />
                </div>
              </div>

              <div className="metric-value">
                {report?.total_databases ?? 0}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <div className="metric-label">
                  Total Scans
                </div>

                <div className="metric-icon">
                  <ScanSearch size={14} />
                </div>
              </div>

              <div className="metric-value">
                {report?.total_scans ?? 0}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-top">
                <div className="metric-label">
                  Completed Scans
                </div>

                <div className="metric-icon">
                  <CheckCircle2 size={14} />
                </div>
              </div>

              <div className="metric-value">
                {report?.completed_scans ?? 0}
              </div>
            </div>
          </div>

          <div className="report-bottom">
            <div className="report-card">
              <div className="report-card-header">
                <div className="report-card-title">
                  <AlertTriangle size={15} />
                  Security Statistics
                </div>
              </div>

              <div className="statistics-grid">
                <div className="stat-item">
                  <div className="stat-label">
                    Total Threats
                  </div>

                  <div className="stat-value">
                    {report?.total_threats ?? 0}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    Critical Threats
                  </div>

                  <div
                    className="stat-value"
                    style={{
                      color:
                        (report?.critical_threats ?? 0) > 0
                          ? "#f87171"
                          : "#e7edf6",
                    }}
                  >
                    {report?.critical_threats ?? 0}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    Total Incidents
                  </div>

                  <div className="stat-value">
                    {report?.total_incidents ?? 0}
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    Scan Completion
                  </div>

                  <div className="stat-value">
                    {report?.total_scans
                      ? `${Math.round(
                          (report.completed_scans /
                            report.total_scans) *
                            100
                        )}%`
                      : "0%"}
                  </div>
                </div>
              </div>
            </div>

            <div className="report-card">
              <div className="report-card-header">
                <div className="report-card-title">
                  <Siren size={15} />
                  Security Recommendations
                </div>
              </div>

              <div className="report-card-body">
                <div className="recommendations">
                  {report?.recommendations?.length ? (
                    report.recommendations.map(
                      (recommendation, index) => (
                        <div
                          className="recommendation"
                          key={`${recommendation}-${index}`}
                        >
                          <div className="recommendation-number">
                            {index + 1}
                          </div>

                          <div className="recommendation-text">
                            {recommendation}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="empty-recommendations">
                      No recommendations available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;