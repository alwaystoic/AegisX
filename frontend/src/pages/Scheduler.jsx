import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  GitBranch,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Square,
  Timer,
  Zap,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Scheduler() {
  const [status, setStatus] = useState({
    scheduler_running: false,
    interval_minutes: 1,
    last_run: null,
    next_run: null,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  }, []);

  const fetchStatus = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/scheduler/status`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to fetch scheduler status."
        );
      }

      setStatus({
        scheduler_running: Boolean(data.scheduler_running),
        interval_minutes: Number(data.interval_minutes ?? 1),
        last_run: data.last_run ?? null,
        next_run: data.next_run ?? null,
      });
    } catch (err) {
      console.error("Scheduler status error:", err);

      setError(
        err?.message ||
          "Unable to connect to the AegisX backend."
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [getHeaders]);

  useEffect(() => {
    let cancelled = false;

    const loadStatus = async () => {
      if (cancelled) {
        return;
      }

      await fetchStatus(true);
    };

    loadStatus();

    const interval = window.setInterval(() => {
      if (!cancelled) {
        fetchStatus(false);
      }
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [fetchStatus]);

  const handleSchedulerAction = async (action) => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/scheduler/${action}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Unable to ${action} the scheduler.`
        );
      }

      setStatus({
        scheduler_running: Boolean(
          data.scheduler_running
        ),
        interval_minutes: Number(
          data.interval_minutes ?? 1
        ),
        last_run: data.last_run ?? null,
        next_run: data.next_run ?? null,
      });
    } catch (err) {
      console.error(
        `Scheduler ${action} error:`,
        err
      );

      setError(
        err?.message ||
          "Unable to connect to the AegisX backend."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = useCallback((value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  }, []);

  const getRelativeTime = useCallback(
    (value) => {
      if (!value) {
        return "Not available";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "Not available";
      }

      const difference = date.getTime() - Date.now();

      if (difference <= 0) {
        return "Due now";
      }

      const seconds = Math.floor(
        difference / 1000
      );

      if (seconds < 60) {
        return `${seconds}s`;
      }

      const minutes = Math.floor(
        seconds / 60
      );

      if (minutes < 60) {
        return `${minutes}m`;
      }

      const hours = Math.floor(
        minutes / 60
      );

      return `${hours}h ${minutes % 60}m`;
    },
    []
  );

  const schedulerLabel = useMemo(() => {
    return status.scheduler_running
      ? "Scheduler Running"
      : "Scheduler Stopped";
  }, [status.scheduler_running]);

  const cardStyle = {
    background: "#0d1522",
    border: "1px solid #1d2b3f",
    borderRadius: "8px",
  };

  const iconBoxStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#10213b",
    border: "1px solid #1b3b68",
    color: "#3b82f6",
    flexShrink: 0,
  };

  const statValueStyle = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f8fafc",
    lineHeight: 1.2,
  };

  const mutedStyle = {
    color: "#64748b",
    fontSize: "10px",
  };

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "100%",
        padding: "24px 28px 36px",
        boxSizing: "border-box",
      }}
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "5px",
            }}
          >
            <div style={iconBoxStyle}>
              <Clock3 size={18} />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Security Scheduler
              </h3>

              <p
                style={{
                  margin: "3px 0 0",
                  color: "#64748b",
                  fontSize: "10px",
                }}
              >
                Manage automated AegisX security
                pipeline execution.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "6px 10px",
              borderRadius: "5px",
              border: `1px solid ${
                status.scheduler_running
                  ? "#14532d"
                  : "#164e63"
              }`,
              background: status.scheduler_running
                ? "rgba(16,185,129,0.07)"
                : "rgba(14,165,233,0.06)",
              color: status.scheduler_running
                ? "#34d399"
                : "#38bdf8",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "currentColor",
                boxShadow:
                  "0 0 6px currentColor",
              }}
            />

            {schedulerLabel}
          </div>

          <button
            type="button"
            onClick={() => fetchStatus(true)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 11px",
              borderRadius: "5px",
              border: "1px solid #26364d",
              background: "#101a29",
              color: "#cbd5e1",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "10px",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw
              size={13}
              style={{
                animation: loading
                  ? "scheduler-spin 1s linear infinite"
                  : "none",
              }}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "10px 12px",
            marginBottom: "16px",
            borderRadius: "6px",
            border: "1px solid #5f2028",
            background: "rgba(127,29,29,0.12)",
            color: "#fca5a5",
            fontSize: "11px",
          }}
        >
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ==========================================
          MAIN CONTROL CARD
      ========================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "18px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: 650,
              }}
            >
              <Zap size={15} color="#3b82f6" />
              Scheduler Control
            </div>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "10px",
              }}
            >
              Start or stop automated security
              pipeline execution.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "5px 9px",
              borderRadius: "5px",
              background: status.scheduler_running
                ? "rgba(16,185,129,0.08)"
                : "rgba(100,116,139,0.08)",
              color: status.scheduler_running
                ? "#34d399"
                : "#94a3b8",
              fontSize: "9px",
              fontWeight: 600,
            }}
          >
            <Activity size={12} />

            {status.scheduler_running
              ? "ACTIVE"
              : "INACTIVE"}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) auto",
            gap: "18px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#64748b",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "5px",
              }}
            >
              Current Status
            </div>

            <div
              style={{
                color: status.scheduler_running
                  ? "#34d399"
                  : "#e2e8f0",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "3px",
              }}
            >
              {status.scheduler_running
                ? "Running"
                : "Stopped"}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "10px",
              }}
            >
              {status.scheduler_running
                ? "The automated security pipeline is running."
                : "The automated security pipeline is currently stopped."}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                handleSchedulerAction("start")
              }
              disabled={
                status.scheduler_running ||
                actionLoading
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                minWidth: "112px",
                padding: "9px 13px",
                borderRadius: "5px",
                border: "1px solid #2563eb",
                background:
                  status.scheduler_running
                    ? "#162033"
                    : "#2563eb",
                color: status.scheduler_running
                  ? "#475569"
                  : "#ffffff",
                cursor:
                  status.scheduler_running ||
                  actionLoading
                    ? "not-allowed"
                    : "pointer",
                fontSize: "10px",
                fontWeight: 600,
              }}
            >
              {actionLoading ? (
                <Loader2
                  size={13}
                  style={{
                    animation:
                      "scheduler-spin 1s linear infinite",
                  }}
                />
              ) : (
                <Play size={13} />
              )}

              Start Scheduler
            </button>

            <button
              type="button"
              onClick={() =>
                handleSchedulerAction("stop")
              }
              disabled={
                !status.scheduler_running ||
                actionLoading
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                minWidth: "112px",
                padding: "9px 13px",
                borderRadius: "5px",
                border: "1px solid #334155",
                background:
                  !status.scheduler_running
                    ? "#101725"
                    : "#17202d",
                color:
                  !status.scheduler_running
                    ? "#475569"
                    : "#cbd5e1",
                cursor:
                  !status.scheduler_running ||
                  actionLoading
                    ? "not-allowed"
                    : "pointer",
                fontSize: "10px",
                fontWeight: 600,
              }}
            >
              <Square size={12} />

              Stop Scheduler
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        {/* Status */}

        <div
          style={{
            ...cardStyle,
            padding: "13px",
            minHeight: "78px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div style={iconBoxStyle}>
              <Activity size={16} />
            </div>

            <div>
              <div style={mutedStyle}>
                Scheduler Status
              </div>

              <div
                style={{
                  ...statValueStyle,
                  fontSize: "16px",
                  color: status.scheduler_running
                    ? "#34d399"
                    : "#94a3b8",
                }}
              >
                {status.scheduler_running
                  ? "Active"
                  : "Inactive"}
              </div>
            </div>
          </div>
        </div>

        {/* Interval */}

        <div
          style={{
            ...cardStyle,
            padding: "13px",
            minHeight: "78px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div style={iconBoxStyle}>
              <Timer size={16} />
            </div>

            <div>
              <div style={mutedStyle}>
                Execution Interval
              </div>

              <div style={statValueStyle}>
                {status.interval_minutes}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 400,
                    color: "#64748b",
                    marginLeft: "4px",
                  }}
                >
                  min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Run */}

        <div
          style={{
            ...cardStyle,
            padding: "13px",
            minHeight: "78px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div style={iconBoxStyle}>
              <RotateCcw size={16} />
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div style={mutedStyle}>
                Last Run
              </div>

              <div
                style={{
                  color: "#f8fafc",
                  fontSize: "12px",
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={formatDateTime(
                  status.last_run
                )}
              >
                {status.last_run
                  ? formatDateTime(
                      status.last_run
                    )
                  : "Not available"}
              </div>
            </div>
          </div>
        </div>

        {/* Next Run */}

        <div
          style={{
            ...cardStyle,
            padding: "13px",
            minHeight: "78px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div style={iconBoxStyle}>
              <Clock3 size={16} />
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div style={mutedStyle}>
                Next Run
              </div>

              <div
                style={{
                  color: "#f8fafc",
                  fontSize: "12px",
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={formatDateTime(
                  status.next_run
                )}
              >
                {status.next_run
                  ? formatDateTime(
                      status.next_run
                    )
                  : "Not available"}
              </div>

              {status.next_run && (
                <div
                  style={{
                    marginTop: "2px",
                    color: "#38bdf8",
                    fontSize: "9px",
                  }}
                >
                  In {getRelativeTime(
                    status.next_run
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          SCHEDULE + PIPELINE
      ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(230px, 0.8fr) minmax(0, 2fr)",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        {/* Schedule Information */}

        <div
          style={{
            ...cardStyle,
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "13px",
            }}
          >
            <div style={iconBoxStyle}>
              <Clock3 size={15} />
            </div>

            <div>
              <h4
                style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontSize: "12px",
                  fontWeight: 650,
                }}
              >
                Schedule Information
              </h4>

              <p
                style={{
                  margin: "3px 0 0",
                  color: "#64748b",
                  fontSize: "9px",
                }}
              >
                Current automated pipeline schedule.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "9px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom:
                  "1px solid #172235",
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: "9px",
                }}
              >
                Interval
              </span>

              <strong
                style={{
                  color: "#e2e8f0",
                  fontSize: "10px",
                }}
              >
                Every {status.interval_minutes} minute
                {status.interval_minutes !== 1
                  ? "s"
                  : ""}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom:
                  "1px solid #172235",
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: "9px",
                }}
              >
                Last Pipeline Run
              </span>

              <strong
                style={{
                  color: "#e2e8f0",
                  fontSize: "10px",
                }}
              >
                {status.last_run
                  ? formatDateTime(
                      status.last_run
                    )
                  : "Not available"}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: "9px",
                }}
              >
                Next Pipeline Run
              </span>

              <strong
                style={{
                  color: status.next_run
                    ? "#38bdf8"
                    : "#e2e8f0",
                  fontSize: "10px",
                }}
              >
                {status.next_run
                  ? getRelativeTime(
                      status.next_run
                    )
                  : "Not available"}
              </strong>
            </div>
          </div>
        </div>

        {/* Automated Pipeline */}

        <div
          style={{
            ...cardStyle,
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={iconBoxStyle}>
                <GitBranch size={15} />
              </div>

              <div>
                <h4
                  style={{
                    margin: 0,
                    color: "#f8fafc",
                    fontSize: "12px",
                    fontWeight: 650,
                  }}
                >
                  Automated Security Pipeline
                </h4>

                <p
                  style={{
                    margin: "3px 0 0",
                    color: "#64748b",
                    fontSize: "9px",
                  }}
                >
                  Complete AegisX security workflow.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#34d399",
                fontSize: "9px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow:
                    "0 0 6px #34d399",
                }}
              />

              Automated
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {[
              {
                number: 1,
                label: "Health Scan",
                icon: ShieldCheck,
              },
              {
                number: 2,
                label: "SQL Analysis",
                icon: SearchIcon,
              },
              {
                number: 3,
                label: "Threat Detection",
                icon: AlertTriangle,
              },
              {
                number: 4,
                label: "AI Recommendation",
                icon: Zap,
              },
              {
                number: 5,
                label: "Response Engine",
                icon: GitBranch,
              },
            ].map((step, index, array) => {
              const StepIcon = step.icon;

              return (
                <div
                  key={step.number}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: "75px",
                    }}
                  >
                    <div
                      style={{
                        width: "27px",
                        height: "27px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border:
                          "1px solid #14532d",
                        background:
                          "rgba(16,185,129,0.08)",
                        color: "#34d399",
                        position: "relative",
                      }}
                    >
                      <StepIcon
                        size={12}
                      />
                    </div>

                    <span
                      style={{
                        marginTop: "6px",
                        color: "#94a3b8",
                        fontSize: "8px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index <
                    array.length - 1 && (
                    <div
                      style={{
                        height: "1px",
                        background:
                          "#26364d",
                        flex: 1,
                        marginTop: "13px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==========================================
          STATUS FOOTER
      ========================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          borderRadius: "6px",
          border: "1px solid #17263a",
          background: "rgba(13,21,34,0.65)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            color: "#64748b",
            fontSize: "9px",
          }}
        >
          <CheckCircle2
            size={13}
            color={
              status.scheduler_running
                ? "#34d399"
                : "#64748b"
            }
          />

          AegisX scheduler service
        </div>

        <span
          style={{
            color: status.scheduler_running
              ? "#34d399"
              : "#64748b",
            fontSize: "9px",
            fontWeight: 600,
          }}
        >
          {status.scheduler_running
            ? "Ready for automated execution"
            : "Waiting for scheduler start"}
        </span>
      </div>

      <style>
        {`
          @keyframes scheduler-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1100px) {
            .scheduler-page {
              padding-left: 18px;
              padding-right: 18px;
            }
          }
        `}
      </style>
    </section>
  );
}

/*
 * Small local icon component so the scheduler
 * remains self-contained.
 */
function SearchIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default Scheduler;