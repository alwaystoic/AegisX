import { useCallback, useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Scheduler() {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FETCH SCHEDULER STATUS
  // ============================================================

  const fetchStatus = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/scheduler/status`);

      if (!response.ok) {
        throw new Error(
          `Scheduler status request failed (${response.status})`
        );
      }

      const data = await response.json();

      setSchedulerStatus(data);
    } catch (err) {
      console.error("Scheduler status error:", err);

      setError(
        err.message || "Unable to connect to the scheduler service."
      );
    } finally {
      if (showLoader) {
        setRefreshing(false);
      }
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    /*
      Delay the initial request by one event-loop cycle.

      This prevents React's:
      "Calling setState synchronously within an effect..."
      warning caused by fetchStatus() updating state immediately.
    */

    const initialLoad = setTimeout(() => {
      fetchStatus(false);
    }, 0);

    const interval = setInterval(() => {
      fetchStatus(false);
    }, 10000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [fetchStatus]);

  // ============================================================
  // START SCHEDULER
  // ============================================================

  const startScheduler = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/scheduler/start`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Unable to start scheduler (${response.status})`
        );
      }

      setMessage(
        data.message || "Security scheduler started successfully."
      );

      await fetchStatus(false);
    } catch (err) {
      console.error("Start scheduler error:", err);

      setError(
        err.message || "Unable to start the scheduler."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STOP SCHEDULER
  // ============================================================

  const stopScheduler = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/scheduler/stop`, {
        method: "POST",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Unable to stop scheduler (${response.status})`
        );
      }

      setMessage(
        data.message || "Security scheduler stopped successfully."
      );

      await fetchStatus(false);
    } catch (err) {
      console.error("Stop scheduler error:", err);

      setError(
        err.message || "Unable to stop the scheduler."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DATE FORMATTER
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  };

  // ============================================================
  // STATUS
  // ============================================================

  const isRunning = Boolean(
    schedulerStatus?.scheduler_running
  );

  const intervalMinutes =
    schedulerStatus?.interval_minutes ?? 1;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="scheduler-page">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div
        className="scheduler-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "6px",
              letterSpacing: "0.4px",
            }}
          >
            SECURITY OPERATIONS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            Security Scheduler
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Manage the automated AegisX security pipeline.
          </p>
        </div>

        {/* STATUS BADGE */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: `1px solid ${
              isRunning ? "#14532d" : "#334155"
            }`,
            background: isRunning
              ? "rgba(34, 197, 94, 0.08)"
              : "rgba(100, 116, 139, 0.08)",
            color: isRunning ? "#4ade80" : "#94a3b8",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: isRunning
                ? "#22c55e"
                : "#64748b",
              boxShadow: isRunning
                ? "0 0 8px rgba(34,197,94,0.7)"
                : "none",
            }}
          />

          {isRunning ? "Running" : "Stopped"}
        </div>
      </div>

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            background: "rgba(34, 197, 94, 0.07)",
            color: "#4ade80",
            fontSize: "13px",
          }}
        >
          ✓ {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            background: "rgba(239, 68, 68, 0.07)",
            color: "#f87171",
            fontSize: "13px",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* SCHEDULER STATUS */}

        <div className="scheduler-card">
          <div className="scheduler-card-icon">⚙</div>

          <div className="scheduler-card-label">
            SCHEDULER STATUS
          </div>

          <div
            className="scheduler-card-value"
            style={{
              color: isRunning ? "#4ade80" : "#94a3b8",
            }}
          >
            {isRunning ? "Running" : "Stopped"}
          </div>

          <div className="scheduler-card-description">
            The automated security pipeline is currently{" "}
            <strong>
              {isRunning ? "running" : "stopped"}
            </strong>
            .
          </div>
        </div>

        {/* EXECUTION INTERVAL */}

        <div className="scheduler-card">
          <div className="scheduler-card-icon">⏱</div>

          <div className="scheduler-card-label">
            EXECUTION INTERVAL
          </div>

          <div className="scheduler-card-value">
            Every {intervalMinutes} minute
            {intervalMinutes !== 1 ? "s" : ""}
          </div>

          <div className="scheduler-card-description">
            The security pipeline executes automatically at
            this interval.
          </div>
        </div>

        {/* LAST RUN */}

        <div className="scheduler-card">
          <div className="scheduler-card-icon">▶</div>

          <div className="scheduler-card-label">
            LAST RUN
          </div>

          <div className="scheduler-card-value small">
            {formatDate(schedulerStatus?.last_run)}
          </div>

          <div className="scheduler-card-description">
            Most recent automated pipeline execution.
          </div>
        </div>

        {/* NEXT RUN */}

        <div className="scheduler-card">
          <div className="scheduler-card-icon">⏭</div>

          <div className="scheduler-card-label">
            NEXT RUN
          </div>

          <div className="scheduler-card-value small">
            {formatDate(schedulerStatus?.next_run)}
          </div>

          <div className="scheduler-card-description">
            Next scheduled security pipeline execution.
          </div>
        </div>
      </div>

      {/* ======================================================
          SCHEDULER CONTROLS
      ====================================================== */}

      <div
        className="scheduler-section-card"
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 className="scheduler-section-title">
              Scheduler Controls
            </h2>

            <p className="scheduler-section-description">
              Start or stop the automated security pipeline.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={startScheduler}
              disabled={isRunning || loading}
              className="scheduler-button scheduler-button-primary"
            >
              {loading && !isRunning
                ? "Starting..."
                : "▶ Start Scheduler"}
            </button>

            <button
              type="button"
              onClick={stopScheduler}
              disabled={!isRunning || loading}
              className="scheduler-button scheduler-button-danger"
            >
              {loading && isRunning
                ? "Stopping..."
                : "■ Stop Scheduler"}
            </button>

            <button
              type="button"
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="scheduler-button scheduler-button-secondary"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh Status"}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <div className="scheduler-section-card">
        <div className="scheduler-section-heading">
          <div className="scheduler-heading-icon">
            ℹ
          </div>

          <div>
            <h2 className="scheduler-section-title">
              How It Works
            </h2>

            <p className="scheduler-section-description">
              AegisX continuously automates the security
              analysis workflow.
            </p>
          </div>
        </div>

        <div className="scheduler-steps">
          <div className="scheduler-step">
            <div className="scheduler-step-number">
              1
            </div>

            <div>
              <div className="scheduler-step-title">
                Background Process
              </div>

              <p>
                The scheduler starts an APScheduler
                background process.
              </p>
            </div>
          </div>

          <div className="scheduler-step">
            <div className="scheduler-step-number">
              2
            </div>

            <div>
              <div className="scheduler-step-title">
                Automated Execution
              </div>

              <p>
                The security pipeline runs automatically
                at the configured interval.
              </p>
            </div>
          </div>

          <div className="scheduler-step">
            <div className="scheduler-step-number">
              3
            </div>

            <div>
              <div className="scheduler-step-title">
                Execution Tracking
              </div>

              <p>
                AegisX records the last and next scheduled
                execution times.
              </p>
            </div>
          </div>

          <div className="scheduler-step">
            <div className="scheduler-step-number">
              4
            </div>

            <div>
              <div className="scheduler-step-title">
                Manual Control
              </div>

              <p>
                You can stop or restart the scheduler at
                any time from this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          INLINE STYLES
      ====================================================== */}

      <style>{`
        .scheduler-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 34px 50px;
          box-sizing: border-box;
          color: #f8fafc;
        }

        .scheduler-card {
          min-height: 165px;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #1e293b;
          background: #0b111c;
          box-sizing: border-box;
          transition:
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .scheduler-card:hover {
          border-color: #334155;
          transform: translateY(-1px);
        }

        .scheduler-card-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          margin-bottom: 16px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.18);
          color: #60a5fa;
          font-size: 14px;
        }

        .scheduler-card-label {
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .scheduler-card-value {
          color: #f8fafc;
          font-size: 19px;
          font-weight: 650;
          line-height: 1.35;
          word-break: break-word;
        }

        .scheduler-card-value.small {
          font-size: 14px;
        }

        .scheduler-card-description {
          margin-top: 9px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .scheduler-section-card {
          padding: 22px;
          border-radius: 10px;
          border: 1px solid #1e293b;
          background: #0b111c;
          box-sizing: border-box;
        }

        .scheduler-section-title {
          margin: 0;
          color: #f8fafc;
          font-size: 17px;
          font-weight: 650;
        }

        .scheduler-section-description {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .scheduler-button {
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            opacity 0.2s ease;
        }

        .scheduler-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .scheduler-button-primary {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        .scheduler-button-primary:hover:not(:disabled) {
          background: #1d4ed8;
          border-color: #1d4ed8;
        }

        .scheduler-button-danger {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .scheduler-button-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.45);
        }

        .scheduler-button-secondary {
          background: #111827;
          border-color: #334155;
          color: #cbd5e1;
        }

        .scheduler-button-secondary:hover:not(:disabled) {
          background: #172033;
          border-color: #475569;
        }

        .scheduler-section-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .scheduler-heading-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.18);
          color: #60a5fa;
          font-size: 14px;
          flex-shrink: 0;
        }

        .scheduler-steps {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .scheduler-step {
          display: flex;
          gap: 13px;
          padding: 16px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid #172033;
        }

        .scheduler-step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .scheduler-step-title {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .scheduler-step p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.55;
        }

        @media (max-width: 800px) {
          .scheduler-page {
            padding: 24px 20px 40px;
          }

          .scheduler-header {
            flex-direction: column !important;
          }

          .scheduler-steps {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 550px) {
          .scheduler-page {
            padding: 20px 14px 35px;
          }

          .scheduler-card {
            min-height: auto;
          }

          .scheduler-section-card {
            padding: 16px;
          }

          .scheduler-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Scheduler;