import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Database,
  GitBranch,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Terminal,
  Zap,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function formatLabel(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRiskClass(value) {
  const risk = String(value || "").toLowerCase();

  if (risk.includes("critical")) return "critical";
  if (risk.includes("high")) return "high";
  if (risk.includes("medium")) return "medium";
  if (risk.includes("low")) return "low";

  return "default";
}

function ValueDisplay({ value }) {
  if (value === null || value === undefined) {
    return <span className="pipeline-muted">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span className={value ? "pipeline-value-success" : "pipeline-value-danger"}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="pipeline-muted">None</span>;
    }

    return (
      <div className="pipeline-list">
        {value.map((item, index) => (
          <div className="pipeline-list-item" key={index}>
            <span className="pipeline-list-number">{index + 1}</span>
            <span>
              {typeof item === "object"
                ? JSON.stringify(item)
                : String(item)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="pipeline-object">
        {Object.entries(value).map(([key, childValue]) => (
          <div className="pipeline-object-row" key={key}>
            <span className="pipeline-object-label">
              {formatLabel(key)}
            </span>
            <ValueDisplay value={childValue} />
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

function PipelineSection({
  number,
  icon: Icon,
  title,
  subtitle,
  children,
  status = "Completed",
}) {
  return (
    <div className="pipeline-section">
      <div className="pipeline-section-header">
        <div className="pipeline-step">
          <div className="pipeline-step-number">{number}</div>

          <div className="pipeline-section-icon">
            <Icon size={18} />
          </div>

          <div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
        </div>

        <span className="pipeline-completed">
          <CheckCircle2 size={13} />
          {status}
        </span>
      </div>

      <div className="pipeline-section-body">
        {children}
      </div>
    </div>
  );
}

function DataGrid({ data }) {
  if (!data || typeof data !== "object") {
    return <ValueDisplay value={data} />;
  }

  return (
    <div className="pipeline-data-grid">
      {Object.entries(data).map(([key, value]) => (
        <div className="pipeline-data-card" key={key}>
          <span className="pipeline-data-label">
            {formatLabel(key)}
          </span>

          <div className="pipeline-data-value">
            {typeof value === "string" &&
            ["critical", "high", "medium", "low"].includes(
              value.toLowerCase()
            ) ? (
              <span
                className={`pipeline-risk-badge ${getRiskClass(value)}`}
              >
                {value}
              </span>
            ) : (
              <ValueDisplay value={value} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SecurityPipeline() {
  const [query, setQuery] = useState(
    "SELECT * FROM users WHERE id = 1;"
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runPipeline = async () => {
    if (!query.trim()) {
      setError("Please enter a SQL query before running the pipeline.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/pipeline/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          query: query.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Security pipeline request failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Security pipeline error:", err);

      setError(
        err?.message ||
          "Unable to connect to the AegisX backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearPipeline = () => {
    setResult(null);
    setError("");
  };

  const risk =
    result?.threat_detection?.overall_risk ||
    result?.ai_recommendation?.priority ||
    "Unknown";

  const riskScore = result?.threat_detection?.risk_score;

  return (
    <div className="pipeline-page">
      <style>{`
        .pipeline-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 34px 50px;
          box-sizing: border-box;
          color: #f4f7fb;
        }

        .pipeline-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }

        .pipeline-title-wrap {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .pipeline-main-icon {
          width: 42px;
          height: 42px;
          border: 1px solid #24436b;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b1626;
          color: #3b91ff;
          flex-shrink: 0;
        }

        .pipeline-title-wrap h1 {
          margin: 0;
          font-size: 23px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .pipeline-title-wrap p {
          margin: 5px 0 0;
          color: #7890ad;
          font-size: 12px;
        }

        .pipeline-ready {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #075d3b;
          background: #071d17;
          color: #22d995;
          padding: 7px 11px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
        }

        .pipeline-ready-dot {
          width: 6px;
          height: 6px;
          background: #20d78e;
          border-radius: 50%;
        }

        .pipeline-input-card {
          border: 1px solid #1b2a3e;
          background: #0a111c;
          border-radius: 9px;
          overflow: hidden;
          margin-bottom: 22px;
        }

        .pipeline-card-header {
          padding: 15px 18px;
          border-bottom: 1px solid #1b2a3e;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .pipeline-card-title {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .pipeline-card-title svg {
          color: #398eff;
        }

        .pipeline-card-title h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 650;
        }

        .pipeline-card-title span {
          display: block;
          color: #7188a4;
          font-size: 10px;
          margin-top: 3px;
        }

        .pipeline-input-body {
          padding: 18px;
        }

        .pipeline-input-label {
          display: block;
          font-size: 10px;
          color: #7f96b2;
          text-transform: uppercase;
          letter-spacing: .5px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .pipeline-textarea {
          width: 100%;
          min-height: 105px;
          box-sizing: border-box;
          resize: vertical;
          background: #070d16;
          border: 1px solid #24344a;
          border-radius: 7px;
          padding: 13px 14px;
          color: #dbe8f7;
          font-family: Consolas, Monaco, monospace;
          font-size: 12px;
          outline: none;
          transition: border .15s ease;
        }

        .pipeline-textarea:focus {
          border-color: #2778e7;
          box-shadow: 0 0 0 2px rgba(39,120,231,.10);
        }

        .pipeline-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 13px;
        }

        .pipeline-btn {
          border: 1px solid #263951;
          background: #0c1522;
          color: #9bb0c8;
          border-radius: 6px;
          padding: 9px 14px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .pipeline-btn:hover {
          background: #111d2c;
          color: #dbe8f7;
        }

        .pipeline-btn-primary {
          background: #2168e8;
          border-color: #2874f5;
          color: white;
        }

        .pipeline-btn-primary:hover {
          background: #2874f5;
          color: white;
        }

        .pipeline-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .pipeline-error {
          border: 1px solid #61242c;
          background: #1d0c10;
          color: #ff8f9a;
          border-radius: 7px;
          padding: 11px 13px;
          font-size: 11px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .pipeline-empty {
          border: 1px dashed #1c2c40;
          background: #090f19;
          border-radius: 9px;
          min-height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #687f9b;
        }

        .pipeline-empty-icon {
          width: 50px;
          height: 50px;
          border: 1px solid #1e3552;
          background: #0b1726;
          color: #388eff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .pipeline-empty h3 {
          color: #dbe6f4;
          font-size: 14px;
          margin: 0 0 5px;
        }

        .pipeline-empty p {
          max-width: 420px;
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
        }

        .pipeline-result {
          margin-top: 20px;
        }

        .pipeline-result-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 13px;
        }

        .pipeline-result-heading h2 {
          margin: 0;
          font-size: 15px;
        }

        .pipeline-result-heading span {
          color: #627994;
          font-size: 10px;
        }

        .pipeline-risk-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }

        .pipeline-risk-card {
          border: 1px solid #1b2a3e;
          background: #0a111c;
          border-radius: 8px;
          padding: 14px;
        }

        .pipeline-risk-card-label {
          color: #7188a4;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .5px;
          margin-bottom: 7px;
        }

        .pipeline-risk-card-value {
          font-size: 20px;
          font-weight: 700;
        }

        .pipeline-risk-card-value.critical {
          color: #ff5967;
        }

        .pipeline-risk-card-value.high {
          color: #ff9c35;
        }

        .pipeline-risk-card-value.medium {
          color: #e7bf2f;
        }

        .pipeline-risk-card-value.low {
          color: #27d995;
        }

        .pipeline-section {
          border: 1px solid #1b2a3e;
          background: #0a111c;
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .pipeline-section-header {
          min-height: 62px;
          box-sizing: border-box;
          padding: 12px 15px;
          border-bottom: 1px solid #19283a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .pipeline-step {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pipeline-step-number {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #10233c;
          color: #438fff;
          border: 1px solid #1d4778;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
        }

        .pipeline-section-icon {
          width: 31px;
          height: 31px;
          border-radius: 7px;
          background: #0d1b2d;
          color: #3d8ef8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pipeline-section-header h3 {
          margin: 0;
          font-size: 12px;
          font-weight: 650;
        }

        .pipeline-section-header p {
          margin: 3px 0 0;
          color: #667d99;
          font-size: 9px;
        }

        .pipeline-completed {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #22cf8a;
          font-size: 9px;
          border: 1px solid #104c36;
          background: #071c16;
          padding: 5px 8px;
          border-radius: 5px;
        }

        .pipeline-section-body {
          padding: 14px;
        }

        .pipeline-data-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .pipeline-data-card {
          border: 1px solid #19293d;
          background: #080f19;
          border-radius: 6px;
          padding: 10px;
          min-height: 48px;
          box-sizing: border-box;
        }

        .pipeline-data-label {
          display: block;
          color: #637b98;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: .45px;
          margin-bottom: 6px;
        }

        .pipeline-data-value {
          color: #d5e1ef;
          font-size: 11px;
          line-height: 1.45;
          word-break: break-word;
        }

        .pipeline-risk-badge {
          display: inline-flex;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 700;
        }

        .pipeline-risk-badge.critical {
          color: #ff6572;
          border: 1px solid #74303a;
          background: #250f13;
        }

        .pipeline-risk-badge.high {
          color: #ffab45;
          border: 1px solid #70451e;
          background: #21160a;
        }

        .pipeline-risk-badge.medium {
          color: #e9c436;
          border: 1px solid #665719;
          background: #1c1909;
        }

        .pipeline-risk-badge.low {
          color: #26d995;
          border: 1px solid #145d42;
          background: #071d17;
        }

        .pipeline-risk-badge.default {
          color: #91a7c0;
          border: 1px solid #2b4059;
          background: #0c1623;
        }

        .pipeline-muted {
          color: #566d87;
        }

        .pipeline-value-success {
          color: #26d995;
          font-weight: 600;
        }

        .pipeline-value-danger {
          color: #ff6471;
          font-weight: 600;
        }

        .pipeline-object {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .pipeline-object-row {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          gap: 12px;
          border-bottom: 1px solid #132134;
          padding-bottom: 7px;
        }

        .pipeline-object-row:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .pipeline-object-label {
          color: #68819e;
          font-size: 10px;
        }

        .pipeline-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .pipeline-list-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          border: 1px solid #19293d;
          background: #080f19;
          border-radius: 6px;
          padding: 9px;
        }

        .pipeline-list-number {
          min-width: 19px;
          height: 19px;
          border-radius: 5px;
          background: #10233c;
          color: #4a95fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 700;
        }

        .pipeline-ai-summary {
          border: 1px solid #1c3858;
          background: #091525;
          border-radius: 7px;
          padding: 13px;
          margin-bottom: 11px;
        }

        .pipeline-ai-summary-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #4594ff;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .4px;
          margin-bottom: 7px;
        }

        .pipeline-ai-summary p {
          margin: 0;
          color: #b6c9df;
          font-size: 11px;
          line-height: 1.55;
        }

        .pipeline-action {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          padding: 10px;
          border: 1px solid #19293d;
          background: #080f19;
          border-radius: 6px;
          margin-bottom: 7px;
        }

        .pipeline-action:last-child {
          margin-bottom: 0;
        }

        .pipeline-action-icon {
          width: 21px;
          height: 21px;
          border-radius: 5px;
          background: #10233c;
          color: #438fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pipeline-action-text {
          color: #c6d5e7;
          font-size: 10px;
          line-height: 1.45;
        }

        .pipeline-query-preview {
          font-family: Consolas, Monaco, monospace;
          color: #8ebfff;
          background: #070d16;
          border: 1px solid #17283d;
          border-radius: 6px;
          padding: 11px;
          font-size: 10px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (max-width: 850px) {
          .pipeline-page {
            padding: 20px 15px 40px;
          }

          .pipeline-top {
            flex-direction: column;
          }

          .pipeline-data-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pipeline-risk-summary {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .pipeline-data-grid {
            grid-template-columns: 1fr;
          }

          .pipeline-section-header {
            align-items: flex-start;
          }

          .pipeline-completed {
            display: none;
          }

          .pipeline-object-row {
            grid-template-columns: 1fr;
            gap: 4px;
          }
        }
      `}</style>

      <div className="pipeline-top">
        <div className="pipeline-title-wrap">
          <div className="pipeline-main-icon">
            <GitBranch size={21} />
          </div>

          <div>
            <h1>Security Pipeline</h1>
            <p>
              Execute the complete AegisX security analysis pipeline.
            </p>
          </div>
        </div>

        <div className="pipeline-ready">
          <span className="pipeline-ready-dot" />
          Pipeline Ready
        </div>
      </div>

      <div className="pipeline-input-card">
        <div className="pipeline-card-header">
          <div className="pipeline-card-title">
            <Terminal size={16} />

            <div>
              <h2>Security Pipeline Execution</h2>
              <span>
                Submit a SQL query for end-to-end security analysis.
              </span>
            </div>
          </div>
        </div>

        <div className="pipeline-input-body">
          <label className="pipeline-input-label">
            SQL Query
          </label>

          <textarea
            className="pipeline-textarea"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter a SQL query..."
            spellCheck={false}
          />

          <div className="pipeline-actions">
            <button
              type="button"
              className="pipeline-btn"
              onClick={clearPipeline}
              disabled={loading}
            >
              <RefreshCw size={13} />
              Clear
            </button>

            <button
              type="button"
              className="pipeline-btn pipeline-btn-primary"
              onClick={runPipeline}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={13}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Running Pipeline...
                </>
              ) : (
                <>
                  <Play size={13} />
                  Run Security Pipeline
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="pipeline-error">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="pipeline-empty">
          <div className="pipeline-empty-icon">
            <Zap size={22} />
          </div>

          <h3>No Pipeline Execution</h3>

          <p>
            Enter a SQL query above and run the security pipeline to
            perform database health analysis, SQL analysis, threat
            detection, AI recommendations, and automated response
            actions.
          </p>
        </div>
      )}

      {loading && (
        <div className="pipeline-empty">
          <div className="pipeline-empty-icon">
            <Activity
              size={22}
              style={{
                animation: "spin 1s linear infinite",
              }}
            />
          </div>

          <h3>Running Security Pipeline</h3>

          <p>
            AegisX is processing database health, SQL analysis,
            threat detection, AI recommendations, and response actions.
          </p>
        </div>
      )}

      {result && (
        <div className="pipeline-result">
          <div className="pipeline-result-heading">
            <div>
              <h2>Pipeline Results</h2>
              <span>
                Complete security pipeline execution
              </span>
            </div>
          </div>

          <div className="pipeline-risk-summary">
            <div className="pipeline-risk-card">
              <div className="pipeline-risk-card-label">
                Overall Risk
              </div>

              <div
                className={`pipeline-risk-card-value ${getRiskClass(
                  risk
                )}`}
              >
                {String(risk)}
              </div>
            </div>

            <div className="pipeline-risk-card">
              <div className="pipeline-risk-card-label">
                Risk Score
              </div>

              <div className="pipeline-risk-card-value">
                {riskScore !== undefined && riskScore !== null
                  ? `${riskScore}/100`
                  : "—"}
              </div>
            </div>
          </div>

          <PipelineSection
            number="1"
            icon={Database}
            title="Database Health"
            subtitle="Database connectivity and health assessment"
          >
            <DataGrid data={result.database_health} />
          </PipelineSection>

          <PipelineSection
            number="2"
            icon={Search}
            title="SQL Analysis"
            subtitle="Analyze the submitted SQL query"
          >
            <div className="pipeline-query-preview">
              {query}
            </div>

            <div style={{ marginTop: 11 }}>
              <DataGrid data={result.sql_analysis} />
            </div>
          </PipelineSection>

          <PipelineSection
            number="3"
            icon={ShieldAlert}
            title="Threat Detection"
            subtitle="Identify vulnerabilities and calculate security risk"
          >
            <DataGrid data={result.threat_detection} />
          </PipelineSection>

          <PipelineSection
            number="4"
            icon={Bot}
            title="AI Recommendation"
            subtitle="Generate security recommendations based on detected risk"
          >
            {result.ai_recommendation?.summary && (
              <div className="pipeline-ai-summary">
                <div className="pipeline-ai-summary-title">
                  <Bot size={12} />
                  AI Security Summary
                </div>

                <p>
                  {result.ai_recommendation.summary}
                </p>
              </div>
            )}

            <DataGrid
              data={{
                priority: result.ai_recommendation?.priority,
              }}
            />

            {Array.isArray(
              result.ai_recommendation?.recommended_actions
            ) &&
              result.ai_recommendation.recommended_actions.length >
                0 && (
                <div style={{ marginTop: 11 }}>
                  {result.ai_recommendation.recommended_actions.map(
                    (action, index) => (
                      <div
                        className="pipeline-action"
                        key={index}
                      >
                        <div className="pipeline-action-icon">
                          <CheckCircle2 size={12} />
                        </div>

                        <div className="pipeline-action-text">
                          {action}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
          </PipelineSection>

          <PipelineSection
            number="5"
            icon={Activity}
            title="Response Actions"
            subtitle="Automated security response actions"
          >
            {Array.isArray(result.response_actions) ? (
              result.response_actions.length > 0 ? (
                result.response_actions.map((action, index) => (
                  <div
                    className="pipeline-action"
                    key={index}
                  >
                    <div className="pipeline-action-icon">
                      <CheckCircle2 size={12} />
                    </div>

                    <div className="pipeline-action-text">
                      {typeof action === "object"
                        ? JSON.stringify(action)
                        : String(action)}
                    </div>
                  </div>
                ))
              ) : (
                <ValueDisplay value={result.response_actions} />
              )
            ) : (
              <DataGrid data={result.response_actions} />
            )}
          </PipelineSection>

          <div className="pipeline-section">
            <div className="pipeline-section-body">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#25d794",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={15} />
                Security pipeline completed successfully
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "#617994",
                  fontSize: 9,
                }}
              >
                Database Health → SQL Analysis → Threat Detection →
                AI Recommendation → Response Engine
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}