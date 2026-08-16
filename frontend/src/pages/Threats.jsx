import { useEffect, useMemo, useState } from "react";

import {
  ShieldAlert,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Activity,
  Bug,
  Pencil,
  CheckCircle2,
  Search,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Threats() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedThreat, setSelectedThreat] = useState(null);
  const [editingThreat, setEditingThreat] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formError, setFormError] = useState("");

  const emptyForm = {
    threat_name: "",
    threat_type: "",
    severity: "Low",
    source: "",
    description: "",
    mitigation: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  /*
   * =========================================================
   * LOAD THREATS
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadThreats = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          if (!cancelled) {
            setError("Authentication required. Please log in again.");
            setLoading(false);
          }
          return;
        }

        const response = await fetch(`${API_URL}/threat/`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            data?.detail || "Failed to fetch threats."
          );
        }

        if (!cancelled) {
          setThreats(Array.isArray(data) ? data : []);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Threat fetch error:", err);

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to connect to the AegisX backend."
          );
          setThreats([]);
          setLoading(false);
        }
      }
    };

    loadThreats();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const fetchThreats = async () => {
    try {
      setRefreshing(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      const response = await fetch(`${API_URL}/threat/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to fetch threats."
        );
      }

      setThreats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Threat refresh error:", err);

      setError(
        err?.message ||
          "Unable to connect to the AegisX backend."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const statistics = useMemo(() => {
    const total = threats.length;

    const critical = threats.filter(
      (threat) =>
        String(threat.severity || "").toLowerCase() ===
        "critical"
    ).length;

    const high = threats.filter(
      (threat) =>
        String(threat.severity || "").toLowerCase() === "high"
    ).length;

    const medium = threats.filter(
      (threat) =>
        String(threat.severity || "").toLowerCase() === "medium"
    ).length;

    const low = threats.filter(
      (threat) =>
        String(threat.severity || "").toLowerCase() === "low"
    ).length;

    const active = threats.filter(
      (threat) =>
        String(threat.status || "").toLowerCase() === "active"
    ).length;

    return {
      total,
      critical,
      high,
      medium,
      low,
      active,
    };
  }, [threats]);

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const filteredThreats = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return threats;
    }

    return threats.filter((threat) => {
      return (
        String(threat.threat_name || "")
          .toLowerCase()
          .includes(search) ||
        String(threat.threat_type || "")
          .toLowerCase()
          .includes(search) ||
        String(threat.source || "")
          .toLowerCase()
          .includes(search) ||
        String(threat.severity || "")
          .toLowerCase()
          .includes(search) ||
        String(threat.status || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [threats, searchTerm]);

  /*
   * =========================================================
   * FORM
   * =========================================================
   */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingThreat(null);
    setSelectedThreat(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (threat) => {
    setEditingThreat(threat);
    setSelectedThreat(null);

    setForm({
      threat_name: threat.threat_name || "",
      threat_type: threat.threat_type || "",
      severity: threat.severity || "Low",
      source: threat.source || "",
      description: threat.description || "",
      mitigation: threat.mitigation || "",
      status: threat.status || "Active",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (creating) {
      return;
    }

    setShowModal(false);
    setEditingThreat(null);
    setForm(emptyForm);
    setFormError("");
  };

  /*
   * =========================================================
   * CREATE / UPDATE
   * =========================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.threat_name.trim()) {
      setFormError("Threat name is required.");
      return;
    }

    if (!form.threat_type.trim()) {
      setFormError("Threat type is required.");
      return;
    }

    if (!form.source.trim()) {
      setFormError("Threat source is required.");
      return;
    }

    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    if (!form.mitigation.trim()) {
      setFormError("Mitigation is required.");
      return;
    }

    try {
      setCreating(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      const isEditing = Boolean(editingThreat);

      const endpoint = isEditing
        ? `${API_URL}/threat/${editingThreat.id}`
        : `${API_URL}/threat/`;

      const method = isEditing ? "PUT" : "POST";

      const payload = isEditing
        ? {
            threat_name: form.threat_name.trim(),
            threat_type: form.threat_type.trim(),
            severity: form.severity,
            source: form.source.trim(),
            description: form.description.trim(),
            mitigation: form.mitigation.trim(),
            status: form.status,
          }
        : {
            threat_name: form.threat_name.trim(),
            threat_type: form.threat_type.trim(),
            source: form.source.trim(),
            description: form.description.trim(),
            mitigation: form.mitigation.trim(),
          };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Failed to ${isEditing ? "update" : "create"} threat.`
        );
      }

      if (isEditing) {
        setThreats((previous) =>
          previous.map((threat) =>
            threat.id === data.id ? data : threat
          )
        );
      } else {
        setThreats((previous) => [data, ...previous]);
      }

      setShowModal(false);
      setEditingThreat(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Threat save error:", err);

      setFormError(
        err?.message ||
          "Unable to save threat."
      );
    } finally {
      setCreating(false);
    }
  };

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  const handleDelete = async (threatId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this threat?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(threatId);

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/threat/${threatId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to delete threat."
        );
      }

      setThreats((previous) =>
        previous.filter((threat) => threat.id !== threatId)
      );

      if (selectedThreat?.id === threatId) {
        setSelectedThreat(null);
        setShowViewModal(false);
      }
    } catch (err) {
      console.error("Threat delete error:", err);

      setError(
        err?.message ||
          "Unable to delete threat."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * =========================================================
   * VIEW
   * =========================================================
   */

  const openViewModal = (threat) => {
    setSelectedThreat(threat);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedThreat(null);
  };

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const getSeverityClass = (severity) => {
    switch (String(severity || "").toLowerCase()) {
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
    return String(status || "").toLowerCase() === "active"
      ? "active"
      : "inactive";
  };

  /*
   * =========================================================
   * COMPONENT
   * =========================================================
   */

  return (
    <section className="content">
      <style>{`
        .threats-page {
          width: 100%;
        }

        .threats-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 22px;
        }

        .threats-heading h3 {
          margin: 0 0 5px;
          font-size: 24px;
          color: #f4f7fb;
        }

        .threats-heading p {
          margin: 0;
          color: #71809a;
          font-size: 13px;
        }

        .threat-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .threat-button {
          border: 1px solid #263550;
          background: #101827;
          color: #b9c6d9;
          border-radius: 7px;
          padding: 10px 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          font-size: 12px;
          transition: 0.2s ease;
        }

        .threat-button:hover {
          border-color: #3979d9;
          color: #fff;
        }

        .threat-button.primary {
          background: #2869df;
          border-color: #2869df;
          color: white;
        }

        .threat-button.primary:hover {
          background: #3477ed;
        }

        .threat-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .threat-error {
          background: #261217;
          border: 1px solid #63303a;
          color: #ff9da8;
          padding: 12px 15px;
          border-radius: 7px;
          margin-bottom: 18px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .threat-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .threat-stat {
          background: #0e1623;
          border: 1px solid #1c2a3e;
          border-radius: 9px;
          padding: 16px;
          min-height: 82px;
        }

        .threat-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .threat-stat-label {
          color: #71809a;
          font-size: 11px;
        }

        .threat-stat-icon {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #13223a;
          color: #4e96ff;
        }

        .threat-stat strong {
          display: block;
          color: #edf3fb;
          font-size: 22px;
          line-height: 1;
        }

        .threat-stat small {
          color: #56657d;
          font-size: 9px;
        }

        .threat-stat.critical .threat-stat-icon {
          color: #ff626c;
          background: #321b22;
        }

        .threat-stat.high .threat-stat-icon {
          color: #ff9a42;
          background: #322518;
        }

        .threat-stat.medium .threat-stat-icon {
          color: #e9c34c;
          background: #302a18;
        }

        .threat-stat.low .threat-stat-icon {
          color: #39d98a;
          background: #132b22;
        }

        .threat-list-panel {
          background: #0e1623;
          border: 1px solid #1c2a3e;
          border-radius: 9px;
          overflow: hidden;
        }

        .threat-list-header {
          padding: 15px 16px;
          border-bottom: 1px solid #1c2a3e;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .threat-list-title h4 {
          margin: 0 0 3px;
          color: #edf3fb;
          font-size: 14px;
        }

        .threat-list-title p {
          margin: 0;
          color: #5e6e87;
          font-size: 10px;
        }

        .threat-count {
          color: #6f819d;
          border: 1px solid #263550;
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 10px;
        }

        .threat-search {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #25344b;
          background: #0a111c;
          border-radius: 6px;
          padding: 7px 10px;
          width: 220px;
        }

        .threat-search svg {
          color: #64748b;
          flex-shrink: 0;
        }

        .threat-search input {
          border: none;
          outline: none;
          background: transparent;
          color: #dbe5f2;
          width: 100%;
          font-size: 11px;
        }

        .threat-search input::placeholder {
          color: #53637b;
        }

        .threat-table-wrapper {
          overflow-x: auto;
        }

        .threat-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        .threat-table th {
          text-align: left;
          padding: 10px 12px;
          color: #60708a;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          background: #0a111c;
          border-bottom: 1px solid #1c2a3e;
        }

        .threat-table td {
          padding: 12px;
          border-bottom: 1px solid #172438;
          color: #aebbd0;
          font-size: 11px;
          vertical-align: middle;
        }

        .threat-table tr:last-child td {
          border-bottom: none;
        }

        .threat-table tbody tr:hover {
          background: #111c2c;
        }

        .threat-name {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .threat-name-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid #25466f;
          background: #102039;
          color: #4e96ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .threat-name strong {
          color: #e5edf8;
          font-size: 11px;
          display: block;
        }

        .threat-name small {
          color: #52647e;
          font-size: 9px;
          display: block;
          margin-top: 2px;
        }

        .severity-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 20px;
          padding: 4px 8px;
          font-size: 9px;
          border: 1px solid;
        }

        .severity-badge.critical {
          color: #ff747d;
          border-color: #66323a;
          background: #28171c;
        }

        .severity-badge.high {
          color: #ffad5c;
          border-color: #67421f;
          background: #2b2015;
        }

        .severity-badge.medium {
          color: #e8c95a;
          border-color: #625321;
          background: #292515;
        }

        .severity-badge.low {
          color: #52b8ed;
          border-color: #214968;
          background: #102433;
        }

        .status-badge.active {
          color: #45d994;
          border-color: #20583e;
          background: #11291f;
        }

        .status-badge.inactive {
          color: #8795aa;
          border-color: #354155;
          background: #171d28;
        }

        .threat-actions-cell {
          display: flex;
          gap: 6px;
        }

        .table-icon-button {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid #27364d;
          background: #111b29;
          color: #71829c;
          cursor: pointer;
        }

        .table-icon-button:hover {
          color: #fff;
          border-color: #3979d9;
        }

        .table-icon-button.danger:hover {
          color: #ff6973;
          border-color: #71343b;
        }

        .empty-threats {
          padding: 55px 20px;
          text-align: center;
          color: #63728a;
        }

        .empty-threats-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 10px;
          background: #111d2e;
          color: #4e96ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-threats h4 {
          color: #cbd5e1;
          margin: 0 0 5px;
          font-size: 13px;
        }

        .empty-threats p {
          margin: 0;
          font-size: 10px;
        }

        .loading-threats {
          padding: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #71809a;
          font-size: 11px;
        }

        .spin {
          animation: threatSpin 1s linear infinite;
        }

        @keyframes threatSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .threat-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 12, 0.78);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .threat-modal {
          width: min(600px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #0d1521;
          border: 1px solid #263750;
          border-radius: 10px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
        }

        .threat-modal-header {
          padding: 17px 18px;
          border-bottom: 1px solid #1d2b40;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .threat-modal-header h3 {
          margin: 0;
          color: #edf3fb;
          font-size: 15px;
        }

        .threat-modal-header p {
          margin: 4px 0 0;
          color: #5f708a;
          font-size: 10px;
        }

        .modal-close {
          width: 30px;
          height: 30px;
          border: 1px solid #26364e;
          border-radius: 6px;
          background: #111b29;
          color: #8291a8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-close:hover {
          color: white;
        }

        .threat-form {
          padding: 18px;
        }

        .threat-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .threat-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .threat-form-group.full {
          grid-column: 1 / -1;
        }

        .threat-form-group label {
          color: #8392a8;
          font-size: 10px;
          font-weight: 600;
        }

        .threat-form-group input,
        .threat-form-group textarea,
        .threat-form-group select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #26364e;
          border-radius: 6px;
          background: #09111d;
          color: #dbe5f2;
          padding: 10px;
          outline: none;
          font-family: inherit;
          font-size: 11px;
        }

        .threat-form-group textarea {
          min-height: 90px;
          resize: vertical;
        }

        .threat-form-group input:focus,
        .threat-form-group textarea:focus,
        .threat-form-group select:focus {
          border-color: #3979d9;
        }

        .threat-form-error {
          margin-bottom: 14px;
          padding: 10px 12px;
          border-radius: 6px;
          background: #28161b;
          border: 1px solid #63303a;
          color: #ff9da8;
          font-size: 10px;
        }

        .threat-form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #1d2b40;
        }

        .detail-grid {
          padding: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-box {
          background: #0a111c;
          border: 1px solid #1d2c41;
          border-radius: 7px;
          padding: 12px;
        }

        .detail-box.full {
          grid-column: 1 / -1;
        }

        .detail-box label {
          display: block;
          color: #5e6e87;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .detail-box span,
        .detail-box p {
          color: #d3dce9;
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (max-width: 900px) {
          .threat-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .threats-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .threat-list-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .threat-search {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .threat-stats {
            grid-template-columns: 1fr;
          }

          .threat-form-grid,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .threat-form-group.full,
          .detail-box.full {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="threats-page">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="threats-header">
          <div className="threats-heading">
            <h3>Threats</h3>
            <p>
              Monitor and manage detected security threats across
              your infrastructure.
            </p>
          </div>

          <div className="threat-actions">
            <button
              className="threat-button"
              onClick={fetchThreats}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                className={refreshing ? "spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              className="threat-button primary"
              onClick={openCreateModal}
            >
              <Plus size={15} />
              New Threat
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="threat-error">
            <AlertTriangle size={15} />
            <span>{error}</span>

            <button
              className="modal-close"
              style={{
                marginLeft: "auto",
                width: 25,
                height: 25,
              }}
              onClick={() => setError("")}
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="threat-stats">

          <div className="threat-stat">
            <div className="threat-stat-top">
              <span className="threat-stat-label">
                Total Threats
              </span>

              <div className="threat-stat-icon">
                <ShieldAlert size={16} />
              </div>
            </div>

            <strong>{statistics.total}</strong>
            <small>Detected threats</small>
          </div>

          <div className="threat-stat critical">
            <div className="threat-stat-top">
              <span className="threat-stat-label">
                Critical
              </span>

              <div className="threat-stat-icon">
                <AlertTriangle size={16} />
              </div>
            </div>

            <strong>{statistics.critical}</strong>
            <small>Critical severity</small>
          </div>

          <div className="threat-stat high">
            <div className="threat-stat-top">
              <span className="threat-stat-label">
                High Risk
              </span>

              <div className="threat-stat-icon">
                <Bug size={16} />
              </div>
            </div>

            <strong>{statistics.high}</strong>
            <small>High severity</small>
          </div>

          <div className="threat-stat medium">
            <div className="threat-stat-top">
              <span className="threat-stat-label">
                Medium Risk
              </span>

              <div className="threat-stat-icon">
                <Activity size={16} />
              </div>
            </div>

            <strong>{statistics.medium}</strong>
            <small>Medium severity</small>
          </div>

          <div className="threat-stat low">
            <div className="threat-stat-top">
              <span className="threat-stat-label">
                Active
              </span>

              <div className="threat-stat-icon">
                <CheckCircle2 size={16} />
              </div>
            </div>

            <strong>{statistics.active}</strong>
            <small>Currently active</small>
          </div>

        </div>

        {/* =====================================================
            THREAT TABLE
        ===================================================== */}

        <div className="threat-list-panel">

          <div className="threat-list-header">

            <div className="threat-list-title">
              <h4>Security Threats</h4>
              <p>
                Review and manage detected security threats.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div className="threat-search">
                <Search size={14} />

                <input
                  type="text"
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <span className="threat-count">
                {filteredThreats.length} threats
              </span>
            </div>

          </div>

          {loading ? (
            <div className="loading-threats">
              <RefreshCw size={25} className="spin" />
              <span>Loading threats...</span>
            </div>
          ) : filteredThreats.length === 0 ? (
            <div className="empty-threats">

              <div className="empty-threats-icon">
                <ShieldAlert size={22} />
              </div>

              <h4>
                {searchTerm
                  ? "No matching threats"
                  : "No threats detected"}
              </h4>

              <p>
                {searchTerm
                  ? "Try changing your search criteria."
                  : "Detected security threats will appear here."}
              </p>

            </div>
          ) : (
            <div className="threat-table-wrapper">

              <table className="threat-table">

                <thead>
                  <tr>
                    <th>Threat</th>
                    <th>Type</th>
                    <th>Source</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredThreats.map((threat) => (
                    <tr key={threat.id}>

                      <td>
                        <div className="threat-name">

                          <div className="threat-name-icon">
                            <ShieldAlert size={15} />
                          </div>

                          <div>
                            <strong>
                              {threat.threat_name}
                            </strong>

                            <small>
                              Threat #{threat.id}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        {threat.threat_type || "—"}
                      </td>

                      <td>
                        {threat.source || "—"}
                      </td>

                      <td>
                        <span
                          className={`severity-badge ${getSeverityClass(
                            threat.severity
                          )}`}
                        >
                          {threat.severity || "Low"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            threat.status
                          )}`}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background:
                                String(
                                  threat.status || ""
                                ).toLowerCase() === "active"
                                  ? "#45d994"
                                  : "#8795aa",
                            }}
                          ></span>

                          {threat.status || "Inactive"}
                        </span>
                      </td>

                      <td
                        style={{
                          maxWidth: 220,
                          color: "#71809a",
                        }}
                      >
                        {threat.description
                          ? threat.description.length > 75
                            ? `${threat.description.slice(
                                0,
                                75
                              )}...`
                            : threat.description
                          : "—"}
                      </td>

                      <td>
                        <div className="threat-actions-cell">

                          <button
                            className="table-icon-button"
                            title="View threat"
                            onClick={() =>
                              openViewModal(threat)
                            }
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            className="table-icon-button"
                            title="Edit threat"
                            onClick={() =>
                              openEditModal(threat)
                            }
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            className="table-icon-button danger"
                            title="Delete threat"
                            disabled={
                              deletingId === threat.id
                            }
                            onClick={() =>
                              handleDelete(threat.id)
                            }
                          >
                            {deletingId === threat.id ? (
                              <RefreshCw
                                size={14}
                                className="spin"
                              />
                            ) : (
                              <Trash2 size={14} />
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

        </div>

      </div>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================= */}

      {showModal && (
        <div
          className="threat-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="threat-modal">

            <div className="threat-modal-header">

              <div>
                <h3>
                  {editingThreat
                    ? "Edit Threat"
                    : "Create New Threat"}
                </h3>

                <p>
                  {editingThreat
                    ? "Update the security threat information."
                    : "Add a new security threat to AegisX."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={creating}
              >
                <X size={15} />
              </button>

            </div>

            <form
              className="threat-form"
              onSubmit={handleSubmit}
            >

              {formError && (
                <div className="threat-form-error">
                  {formError}
                </div>
              )}

              <div className="threat-form-grid">

                <div className="threat-form-group">
                  <label htmlFor="threat_name">
                    Threat Name
                  </label>

                  <input
                    id="threat_name"
                    name="threat_name"
                    type="text"
                    placeholder="e.g. SQL Injection"
                    value={form.threat_name}
                    onChange={handleFormChange}
                    disabled={creating}
                  />
                </div>

                <div className="threat-form-group">
                  <label htmlFor="threat_type">
                    Threat Type
                  </label>

                  <input
                    id="threat_type"
                    name="threat_type"
                    type="text"
                    placeholder="e.g. Database Attack"
                    value={form.threat_type}
                    onChange={handleFormChange}
                    disabled={creating}
                  />
                </div>

                <div className="threat-form-group">
                  <label htmlFor="source">
                    Source
                  </label>

                  <input
                    id="source"
                    name="source"
                    type="text"
                    placeholder="e.g. PostgreSQL"
                    value={form.source}
                    onChange={handleFormChange}
                    disabled={creating}
                  />
                </div>

                {editingThreat && (
                  <div className="threat-form-group">
                    <label htmlFor="severity">
                      Severity
                    </label>

                    <select
                      id="severity"
                      name="severity"
                      value={form.severity}
                      onChange={handleFormChange}
                      disabled={creating}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">
                        Critical
                      </option>
                    </select>
                  </div>
                )}

                {editingThreat && (
                  <div className="threat-form-group">
                    <label htmlFor="status">
                      Status
                    </label>

                    <select
                      id="status"
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      disabled={creating}
                    >
                      <option value="Active">Active</option>
                      <option value="Resolved">
                        Resolved
                      </option>
                      <option value="Investigating">
                        Investigating
                      </option>
                      <option value="Blocked">
                        Blocked
                      </option>
                    </select>
                  </div>
                )}

                <div className="threat-form-group full">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the security threat..."
                    value={form.description}
                    onChange={handleFormChange}
                    disabled={creating}
                  />
                </div>

                <div className="threat-form-group full">
                  <label htmlFor="mitigation">
                    Mitigation
                  </label>

                  <textarea
                    id="mitigation"
                    name="mitigation"
                    placeholder="Describe the recommended mitigation..."
                    value={form.mitigation}
                    onChange={handleFormChange}
                    disabled={creating}
                  />
                </div>

              </div>

              <div className="threat-form-footer">

                <button
                  type="button"
                  className="threat-button"
                  onClick={closeModal}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="threat-button primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingThreat ? (
                        <Pencil size={14} />
                      ) : (
                        <Plus size={14} />
                      )}

                      {editingThreat
                        ? "Update Threat"
                        : "Create Threat"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =======================================================
          VIEW MODAL
      ======================================================= */}

      {showViewModal && selectedThreat && (
        <div
          className="threat-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewModal();
            }
          }}
        >
          <div className="threat-modal">

            <div className="threat-modal-header">

              <div>
                <h3>
                  Threat Details
                </h3>

                <p>
                  Security threat #{selectedThreat.id}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeViewModal}
              >
                <X size={15} />
              </button>

            </div>

            <div className="detail-grid">

              <div className="detail-box">
                <label>Threat Name</label>
                <span>
                  {selectedThreat.threat_name || "—"}
                </span>
              </div>

              <div className="detail-box">
                <label>Threat Type</label>
                <span>
                  {selectedThreat.threat_type || "—"}
                </span>
              </div>

              <div className="detail-box">
                <label>Source</label>
                <span>
                  {selectedThreat.source || "—"}
                </span>
              </div>

              <div className="detail-box">
                <label>Severity</label>

                <span>
                  <span
                    className={`severity-badge ${getSeverityClass(
                      selectedThreat.severity
                    )}`}
                  >
                    {selectedThreat.severity || "Low"}
                  </span>
                </span>
              </div>

              <div className="detail-box">
                <label>Status</label>

                <span>
                  <span
                    className={`status-badge ${getStatusClass(
                      selectedThreat.status
                    )}`}
                  >
                    {selectedThreat.status || "Inactive"}
                  </span>
                </span>
              </div>

              <div className="detail-box">
                <label>Record ID</label>
                <span>
                  #{selectedThreat.id}
                </span>
              </div>

              <div className="detail-box full">
                <label>Description</label>

                <p>
                  {selectedThreat.description ||
                    "No description available."}
                </p>
              </div>

              <div className="detail-box full">
                <label>Mitigation</label>

                <p>
                  {selectedThreat.mitigation ||
                    "No mitigation information available."}
                </p>
              </div>

            </div>

            <div
              className="threat-form-footer"
              style={{
                padding: "0 18px 18px",
                marginTop: 0,
                borderTop: "none",
              }}
            >
              <button
                className="threat-button"
                onClick={() => {
                  closeViewModal();
                  openEditModal(selectedThreat);
                }}
              >
                <Pencil size={14} />
                Edit Threat
              </button>

              <button
                className="threat-button primary"
                onClick={closeViewModal}
              >
                <CheckCircle2 size={14} />
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default Threats;