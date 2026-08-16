import { useState } from "react";
import {
  Bot,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function AIRecommendations() {
  const [overallRisk, setOverallRisk] = useState("MEDIUM");
  const [riskScore, setRiskScore] = useState(50);

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRiskColor = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return "#ef4444";
      case "HIGH":
        return "#f97316";
      case "MEDIUM":
        return "#eab308";
      case "LOW":
        return "#22c55e";
      default:
        return "#3b82f6";
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case "CRITICAL":
        return <ShieldAlert size={24} />;
      case "HIGH":
        return <AlertTriangle size={24} />;
      case "MEDIUM":
        return <Activity size={24} />;
      case "LOW":
        return <ShieldCheck size={24} />;
      default:
        return <ShieldAlert size={24} />;
    }
  };

  const generateRecommendation = async () => {
    setLoading(true);
    setError("");
    setRecommendation(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await fetch(`${API_URL}/ai/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          overall_risk: overallRisk,
          risk_score: Number(riskScore),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to generate AI recommendation."
        );
      }

      setRecommendation(data);
    } catch (err) {
      console.error("AI recommendation error:", err);

      setError(
        err.message ||
          "Unable to connect to the AegisX AI Recommendation Engine."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRiskChange = (event) => {
    const value = event.target.value;
    setOverallRisk(value);

    if (value === "CRITICAL") {
      setRiskScore(90);
    } else if (value === "HIGH") {
      setRiskScore(75);
    } else if (value === "MEDIUM") {
      setRiskScore(50);
    } else {
      setRiskScore(20);
    }
  };

  const styles = {
    page: {
      padding: "28px 34px 40px",
      maxWidth: "1200px",
      margin: "0 auto",
      color: "#e5edf8",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      marginBottom: "28px",
    },

    titleSection: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },

    titleIcon: {
      width: "46px",
      height: "46px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(59, 130, 246, 0.12)",
      border: "1px solid rgba(59, 130, 246, 0.3)",
      color: "#60a5fa",
    },

    title: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 700,
      color: "#f8fafc",
    },

    subtitle: {
      margin: "5px 0 0",
      fontSize: "13px",
      color: "#71809a",
    },

    engineBadge: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 13px",
      borderRadius: "8px",
      border: "1px solid rgba(34, 197, 94, 0.25)",
      background: "rgba(34, 197, 94, 0.07)",
      color: "#4ade80",
      fontSize: "12px",
      fontWeight: 600,
    },

    mainGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(300px, 0.8fr) minmax(420px, 1.2fr)",
      gap: "20px",
      alignItems: "start",
    },

    panel: {
      background: "#0d1522",
      border: "1px solid #1c2a3d",
      borderRadius: "12px",
      overflow: "hidden",
    },

    panelHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid #1c2a3d",
    },

    panelTitle: {
      margin: 0,
      fontSize: "14px",
      fontWeight: 700,
      color: "#f1f5f9",
    },

    panelDescription: {
      margin: "5px 0 0",
      fontSize: "11px",
      color: "#64748b",
    },

    formBody: {
      padding: "22px 20px",
    },

    field: {
      marginBottom: "22px",
    },

    label: {
      display: "block",
      marginBottom: "9px",
      fontSize: "11px",
      fontWeight: 600,
      color: "#8ea0b9",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },

    select: {
      width: "100%",
      padding: "12px 13px",
      borderRadius: "8px",
      border: "1px solid #26364c",
      background: "#080f1a",
      color: "#e2e8f0",
      outline: "none",
      fontSize: "13px",
    },

    scoreBox: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
      padding: "16px",
      borderRadius: "9px",
      background: "#080f1a",
      border: "1px solid #1c2a3d",
    },

    scoreCircle: {
      width: "72px",
      height: "72px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      flexShrink: 0,
      border: "3px solid",
    },

    scoreValue: {
      fontSize: "20px",
      fontWeight: 800,
      lineHeight: 1,
    },

    scoreLabel: {
      fontSize: "9px",
      color: "#64748b",
      marginTop: "4px",
    },

    scoreInfo: {
      flex: 1,
    },

    scoreInfoTitle: {
      margin: 0,
      fontSize: "13px",
      fontWeight: 700,
      color: "#e2e8f0",
    },

    scoreInfoText: {
      margin: "5px 0 0",
      fontSize: "11px",
      color: "#64748b",
      lineHeight: 1.5,
    },

    range: {
      width: "100%",
      marginTop: "15px",
      accentColor: getRiskColor(overallRisk),
      cursor: "pointer",
    },

    generateButton: {
      width: "100%",
      marginTop: "4px",
      padding: "12px 16px",
      border: "none",
      borderRadius: "8px",
      background: "#2563eb",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 700,
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
    },

    error: {
      marginTop: "15px",
      padding: "11px 13px",
      borderRadius: "8px",
      background: "rgba(239, 68, 68, 0.08)",
      border: "1px solid rgba(239, 68, 68, 0.25)",
      color: "#f87171",
      fontSize: "11px",
      lineHeight: 1.5,
    },

    resultEmpty: {
      minHeight: "390px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "30px",
    },

    emptyIcon: {
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(59, 130, 246, 0.08)",
      border: "1px solid rgba(59, 130, 246, 0.2)",
      color: "#60a5fa",
      marginBottom: "18px",
    },

    emptyTitle: {
      margin: 0,
      fontSize: "16px",
      color: "#cbd5e1",
    },

    emptyText: {
      maxWidth: "360px",
      margin: "8px 0 0",
      fontSize: "11px",
      lineHeight: 1.6,
      color: "#64748b",
    },

    resultBody: {
      padding: "22px 20px",
    },

    riskBanner: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "15px",
      padding: "15px",
      borderRadius: "9px",
      background: `${getRiskColor(overallRisk)}10`,
      border: `1px solid ${getRiskColor(overallRisk)}35`,
      marginBottom: "18px",
    },

    riskLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    riskIcon: {
      color: getRiskColor(overallRisk),
    },

    riskText: {
      margin: 0,
      fontSize: "10px",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },

    riskName: {
      margin: "3px 0 0",
      fontSize: "15px",
      fontWeight: 800,
      color: getRiskColor(overallRisk),
    },

    priority: {
      padding: "7px 11px",
      borderRadius: "20px",
      background: `${getRiskColor(overallRisk)}15`,
      color: getRiskColor(overallRisk),
      border: `1px solid ${getRiskColor(overallRisk)}30`,
      fontSize: "10px",
      fontWeight: 700,
    },

    summaryBox: {
      padding: "16px",
      borderRadius: "9px",
      background: "#080f1a",
      border: "1px solid #1c2a3d",
      marginBottom: "18px",
    },

    summaryLabel: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      marginBottom: "9px",
      color: "#60a5fa",
      fontSize: "11px",
      fontWeight: 700,
    },

    summaryText: {
      margin: 0,
      color: "#aab8ca",
      fontSize: "12px",
      lineHeight: 1.7,
    },

    actionsTitle: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "12px",
      color: "#e2e8f0",
      fontSize: "13px",
      fontWeight: 700,
    },

    action: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
      padding: "11px 12px",
      marginBottom: "8px",
      borderRadius: "8px",
      background: "#0a111d",
      border: "1px solid #172438",
    },

    actionNumber: {
      width: "22px",
      height: "22px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(59, 130, 246, 0.1)",
      color: "#60a5fa",
      fontSize: "10px",
      fontWeight: 700,
      flexShrink: 0,
    },

    actionText: {
      margin: 0,
      paddingTop: "2px",
      color: "#94a3b8",
      fontSize: "11px",
      lineHeight: 1.5,
    },
  };

  return (
    <section style={styles.page}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.titleIcon}>
            <Bot size={24} />
          </div>

          <div>
            <h3 style={styles.title}>AI Recommendations</h3>
            <p style={styles.subtitle}>
              Intelligent security recommendations based on your risk posture.
            </p>
          </div>
        </div>

        <div style={styles.engineBadge}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px rgba(34,197,94,0.7)",
            }}
          />
          AI Engine Ready
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* =========================
            INPUT PANEL
        ========================= */}

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h4 style={styles.panelTitle}>Risk Assessment</h4>
            <p style={styles.panelDescription}>
              Provide the current security risk information.
            </p>
          </div>

          <div style={styles.formBody}>
            <div style={styles.field}>
              <label style={styles.label}>Overall Risk</label>

              <select
                value={overallRisk}
                onChange={handleRiskChange}
                style={styles.select}
                disabled={loading}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Risk Score</label>

              <div style={styles.scoreBox}>
                <div
                  style={{
                    ...styles.scoreCircle,
                    borderColor: getRiskColor(overallRisk),
                    color: getRiskColor(overallRisk),
                  }}
                >
                  <span style={styles.scoreValue}>{riskScore}</span>
                  <span style={styles.scoreLabel}>/ 100</span>
                </div>

                <div style={styles.scoreInfo}>
                  <p style={styles.scoreInfoTitle}>
                    Current Risk Score
                  </p>

                  <p style={styles.scoreInfoText}>
                    Adjust the score to represent the current security
                    posture of the infrastructure.
                  </p>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={riskScore}
                onChange={(event) =>
                  setRiskScore(Number(event.target.value))
                }
                style={styles.range}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={generateRecommendation}
              disabled={loading}
              style={styles.generateButton}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    style={{
                      animation: "ai-spin 1s linear infinite",
                    }}
                  />
                  Generating Recommendation...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate AI Recommendation
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {error && <div style={styles.error}>{error}</div>}
          </div>
        </section>

        {/* =========================
            RESULT PANEL
        ========================= */}

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h4 style={styles.panelTitle}>AI Security Analysis</h4>
            <p style={styles.panelDescription}>
              Recommended actions generated by the AegisX intelligence engine.
            </p>
          </div>

          {!recommendation ? (
            <div style={styles.resultEmpty}>
              <div style={styles.emptyIcon}>
                <Bot size={30} />
              </div>

              <h4 style={styles.emptyTitle}>
                No recommendation generated
              </h4>

              <p style={styles.emptyText}>
                Select the current risk level and generate an AI-powered
                security recommendation to see prioritized remediation
                actions.
              </p>
            </div>
          ) : (
            <div style={styles.resultBody}>
              <div style={styles.riskBanner}>
                <div style={styles.riskLeft}>
                  <div style={styles.riskIcon}>
                    {getRiskIcon(overallRisk)}
                  </div>

                  <div>
                    <p style={styles.riskText}>Detected Risk</p>
                    <p style={styles.riskName}>{overallRisk}</p>
                  </div>
                </div>

                <span style={styles.priority}>
                  Priority: {recommendation.priority}
                </span>
              </div>

              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>
                  <Sparkles size={14} />
                  AI SUMMARY
                </div>

                <p style={styles.summaryText}>
                  {recommendation.summary}
                </p>
              </div>

              <div>
                <div style={styles.actionsTitle}>
                  <Zap size={15} />
                  Recommended Actions
                </div>

                {recommendation.recommended_actions?.map(
                  (action, index) => (
                    <div style={styles.action} key={`${action}-${index}`}>
                      <div style={styles.actionNumber}>
                        {index + 1}
                      </div>

                      <p style={styles.actionText}>{action}</p>

                      <CheckCircle2
                        size={14}
                        style={{
                          marginLeft: "auto",
                          marginTop: "3px",
                          color: "#334155",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          @keyframes ai-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .ai-recommendations-page {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </section>
  );
}

export default AIRecommendations;