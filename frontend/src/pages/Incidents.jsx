import { useEffect, useState } from "react";

import {
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileWarning,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  const [selectedIncident, setSelectedIncident] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "Low",
    status: "Open",
  });

  /*
   * =========================
   * AUTH HEADERS
   * =========================
   */

  const getHeaders = (includeJson = false) => {
    const token = localStorage.getItem("access_token");

    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  /*
   * =========================
   * FETCH INCIDENTS
   * =========================
   */

  const fetchIncidents = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/incidents/`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Authentication required. Please log in again."
          );
        }

        throw new Error(
          data?.detail || "Failed to fetch incidents."
        );
      }

      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Incident fetch error:", err);

      setError(
        err.message || "Unable to connect to the AegisX backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    let cancelled = false;

    const loadIncidents = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");

        const headers = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/incidents/`, {
          method: "GET",
          headers,
        });

        const data = await response.json().catch(() => []);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Authentication required. Please log in again."
            );
          }

          throw new Error(
            data?.detail || "Failed to fetch incidents."
          );
        }

        if (!cancelled) {
          setIncidents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Incident fetch error:", err);

        if (!cancelled) {
          setError(
            err.message ||
              "Unable to connect to the AegisX backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadIncidents();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * =========================
   * FORM HELPERS
   * =========================
   */

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      severity: "Low",
      status: "Open",
    });

    setFormError("");
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setSelectedIncident(null);
    setShowModal(true);
  };

  const openEditModal = (incident) => {
    setForm({
      title: incident.title || "",
      description: incident.description || "",
      severity: incident.severity || "Low",
      status: incident.status || "Open",
    });

    setFormError("");
    setSelectedIncident(incident);
    setModalMode("edit");
    setShowModal(true);
  };

  const openViewModal = (incident) => {
    setSelectedIncident(incident);
    setModalMode("view");
    setShowModal(true);
    setFormError("");
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedIncident(null);
    resetForm();
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * =========================
   * CREATE / UPDATE
   * =========================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.title.trim()) {
      setFormError("Incident title is required.");
      return;
    }

    if (!form.description.trim()) {
      setFormError("Incident description is required.");
      return;
    }

    setSaving(true);

    try {
      const isEdit = modalMode === "edit";

      const endpoint = isEdit
        ? `${API_URL}/incidents/${selectedIncident.id}`
        : `${API_URL}/incidents/`;

      const payload = isEdit
        ? {
            title: form.title.trim(),
            description: form.description.trim(),
            severity: form.severity,
            status: form.status,
          }
        : {
            title: form.title.trim(),
            description: form.description.trim(),
            severity: form.severity,
          };

      const response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Authentication required. Please log in again."
          );
        }

        throw new Error(
          data?.detail ||
            `Failed to ${isEdit ? "update" : "create"} incident.`
        );
      }

      setShowModal(false);
      setSelectedIncident(null);
      resetForm();

      await fetchIncidents();
    } catch (err) {
      console.error("Incident save error:", err);

      setFormError(
        err.message || "Unable to save the incident."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================
   * DELETE
   * =========================
   */

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/incidents/${deleteId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Authentication required. Please log in again."
          );
        }

        throw new Error(
          data?.detail || "Failed to delete incident."
        );
      }

      setShowDeleteModal(false);
      setDeleteId(null);

      await fetchIncidents();
    } catch (err) {
      console.error("Incident delete error:", err);

      setError(
        err.message || "Unable to delete the incident."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * =========================
   * FILTERING
   * =========================
   */

  const filteredIncidents = incidents.filter((incident) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      String(incident.title || "")
        .toLowerCase()
        .includes(search) ||
      String(incident.description || "")
        .toLowerCase()
        .includes(search) ||
      String(incident.severity || "")
        .toLowerCase()
        .includes(search) ||
      String(incident.status || "")
        .toLowerCase()
        .includes(search)
    );
  });

  /*
   * =========================
   * STATISTICS
   * =========================
   */

  const totalIncidents = incidents.length;

  const criticalIncidents = incidents.filter(
    (incident) =>
      String(incident.severity || "").toLowerCase() ===
      "critical"
  ).length;

  const highIncidents = incidents.filter(
    (incident) =>
      String(incident.severity || "").toLowerCase() ===
      "high"
  ).length;

  const openIncidents = incidents.filter(
    (incident) =>
      String(incident.status || "").toLowerCase() ===
        "open" ||
      String(incident.status || "").toLowerCase() ===
        "active"
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) =>
      String(incident.status || "").toLowerCase() ===
        "resolved" ||
      String(incident.status || "").toLowerCase() ===
        "closed"
  ).length;

  /*
   * =========================
   * BADGES
   * =========================
   */

  const getSeverityClass = (severity) => {
    const value = String(severity || "").toLowerCase();

    if (value === "critical") {
      return "critical";
    }

    if (value === "high") {
      return "high";
    }

    if (value === "medium") {
      return "medium";
    }

    return "low";
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "resolved" ||
      value === "closed"
    ) {
      return "resolved";
    }

    if (
      value === "investigating" ||
      value === "in progress"
    ) {
      return "investigating";
    }

    return "open";
  };

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <section
        className="content"
        style={{
          minHeight: "calc(100vh - 90px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            color: "#8fa0bd",
          }}
        >
          <RefreshCw
            size={28}
            style={{
              animation: "spin 1s linear infinite",
            }}
          />

          <span>Loading incidents...</span>
        </div>
      </section>
    );
  }

  /*
   * =========================
   * PAGE
   * =========================
   */

  return (
    <section className="content">
      <style>
        {`
          .incidents-page {
            width: 100%;
          }

          .incidents-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 28px;
          }

          .incidents-header h3 {
            margin: 0 0 7px;
            font-size: 22px;
            font-weight: 700;
            color: #f4f7fb;
          }

          .incidents-header p {
            margin: 0;
            color: #71809a;
            font-size: 13px;
          }

          .incidents-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .incident-action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: 1px solid #26344b;
            border-radius: 8px;
            background: #0d1522;
            color: #b9c6da;
            padding: 10px 15px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.18s ease;
          }

          .incident-action-btn:hover {
            border-color: #3c5c86;
            background: #111d2d;
            color: #ffffff;
          }

          .incident-action-btn.primary {
            background: #2563eb;
            border-color: #2563eb;
            color: #ffffff;
          }

          .incident-action-btn.primary:hover {
            background: #1d4ed8;
            border-color: #1d4ed8;
          }

          .incident-action-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .incident-stats {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 18px;
          }

          .incident-stat {
            min-height: 82px;
            padding: 15px;
            border: 1px solid #1e2a3d;
            border-radius: 10px;
            background: #0b121e;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .incident-stat-icon {
            width: 38px;
            height: 38px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: #111f35;
            color: #4d9cff;
          }

          .incident-stat-icon.red {
            background: rgba(220, 38, 38, 0.12);
            color: #ff5b65;
          }

          .incident-stat-icon.orange {
            background: rgba(245, 158, 11, 0.12);
            color: #f59e0b;
          }

          .incident-stat-icon.green {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
          }

          .incident-stat-icon.purple {
            background: rgba(139, 92, 246, 0.12);
            color: #a78bfa;
          }

          .incident-stat-content {
            min-width: 0;
          }

          .incident-stat-content span {
            display: block;
            color: #7787a0;
            font-size: 10px;
            margin-bottom: 4px;
          }

          .incident-stat-content strong {
            display: block;
            color: #f5f7fb;
            font-size: 20px;
            line-height: 1;
          }

          .incident-error {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 11px 13px;
            margin-bottom: 16px;
            border: 1px solid rgba(239, 68, 68, 0.35);
            border-radius: 8px;
            background: rgba(127, 29, 29, 0.18);
            color: #ff7b83;
            font-size: 12px;
          }

          .incident-panel {
            border: 1px solid #1d2a3c;
            border-radius: 10px;
            background: #0b121e;
            overflow: hidden;
          }

          .incident-panel-header {
            min-height: 65px;
            padding: 14px 16px;
            border-bottom: 1px solid #1b2738;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .incident-panel-title h4 {
            margin: 0 0 4px;
            color: #edf2f9;
            font-size: 13px;
          }

          .incident-panel-title span {
            color: #697991;
            font-size: 10px;
          }

          .incident-table-tools {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .incident-search {
            position: relative;
            width: 220px;
          }

          .incident-search svg {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #61728d;
          }

          .incident-search input {
            width: 100%;
            box-sizing: border-box;
            height: 34px;
            padding: 0 10px 0 32px;
            border: 1px solid #26344a;
            border-radius: 7px;
            outline: none;
            background: #080f1a;
            color: #e6edf7;
            font-size: 11px;
          }

          .incident-search input:focus {
            border-color: #3b82f6;
          }

          .incident-count {
            padding: 7px 9px;
            border: 1px solid #25344a;
            border-radius: 7px;
            color: #71839f;
            font-size: 10px;
            white-space: nowrap;
          }

          .incident-table-wrapper {
            width: 100%;
            overflow-x: auto;
          }

          .incident-table {
            width: 100%;
            min-width: 920px;
            border-collapse: collapse;
          }

          .incident-table th {
            padding: 11px 10px;
            text-align: left;
            color: #61728c;
            background: #09101b;
            border-bottom: 1px solid #1c293a;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .incident-table td {
            padding: 11px 10px;
            border-bottom: 1px solid #172335;
            color: #aebbd0;
            font-size: 10px;
            vertical-align: middle;
          }

          .incident-table tbody tr:hover {
            background: rgba(30, 64, 175, 0.06);
          }

          .incident-title-cell {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 180px;
          }

          .incident-row-icon {
            width: 28px;
            height: 28px;
            border: 1px solid #23405e;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4b9bff;
            background: #0b192c;
            flex-shrink: 0;
          }

          .incident-title-main {
            color: #e5edf8;
            font-weight: 600;
            font-size: 11px;
            margin-bottom: 3px;
          }

          .incident-title-id {
            color: #566983;
            font-size: 9px;
          }

          .incident-description {
            max-width: 250px;
            color: #71819a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .severity-badge,
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border-radius: 999px;
            padding: 4px 8px;
            font-size: 9px;
            font-weight: 600;
            white-space: nowrap;
          }

          .severity-badge.critical {
            color: #ff656e;
            background: rgba(239, 68, 68, 0.10);
            border: 1px solid rgba(239, 68, 68, 0.35);
          }

          .severity-badge.high {
            color: #fb923c;
            background: rgba(249, 115, 22, 0.10);
            border: 1px solid rgba(249, 115, 22, 0.35);
          }

          .severity-badge.medium {
            color: #facc15;
            background: rgba(234, 179, 8, 0.10);
            border: 1px solid rgba(234, 179, 8, 0.30);
          }

          .severity-badge.low {
            color: #38bdf8;
            background: rgba(14, 165, 233, 0.10);
            border: 1px solid rgba(14, 165, 233, 0.30);
          }

          .status-badge.open {
            color: #f87171;
            background: rgba(239, 68, 68, 0.09);
            border: 1px solid rgba(239, 68, 68, 0.25);
          }

          .status-badge.investigating {
            color: #fbbf24;
            background: rgba(245, 158, 11, 0.09);
            border: 1px solid rgba(245, 158, 11, 0.25);
          }

          .status-badge.resolved {
            color: #34d399;
            background: rgba(16, 185, 129, 0.09);
            border: 1px solid rgba(16, 185, 129, 0.25);
          }

          .incident-actions-cell {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .table-icon-btn {
            width: 28px;
            height: 28px;
            border: 1px solid #26364c;
            border-radius: 6px;
            background: #0d1624;
            color: #71839e;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.16s ease;
          }

          .table-icon-btn:hover {
            color: #ffffff;
            border-color: #3e5e87;
            background: #132034;
          }

          .table-icon-btn.delete:hover {
            color: #ff6870;
            border-color: rgba(239, 68, 68, 0.4);
            background: rgba(127, 29, 29, 0.18);
          }

          .incident-empty {
            padding: 60px 20px;
            text-align: center;
            color: #65758d;
          }

          .incident-empty-icon {
            width: 46px;
            height: 46px;
            margin: 0 auto 12px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #101a29;
            color: #4c607e;
          }

          .incident-empty strong {
            display: block;
            color: #9aa9bf;
            font-size: 13px;
            margin-bottom: 5px;
          }

          .incident-empty span {
            font-size: 10px;
          }

          .incident-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(2, 6, 13, 0.78);
            backdrop-filter: blur(4px);
          }

          .incident-modal {
            width: min(560px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            border: 1px solid #27364c;
            border-radius: 12px;
            background: #0b121e;
            box-shadow: 0 25px 70px rgba(0, 0, 0, 0.45);
          }

          .incident-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 17px 19px;
            border-bottom: 1px solid #1c293b;
          }

          .incident-modal-heading {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .incident-modal-heading-icon {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #60a5fa;
            background: #10213a;
          }

          .incident-modal-heading h3 {
            margin: 0 0 3px;
            color: #f1f5fb;
            font-size: 14px;
          }

          .incident-modal-heading span {
            color: #687992;
            font-size: 9px;
          }

          .modal-close {
            width: 30px;
            height: 30px;
            border: 1px solid #27364c;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0d1623;
            color: #70809a;
            cursor: pointer;
          }

          .modal-close:hover {
            color: #ffffff;
            border-color: #40516a;
          }

          .incident-form {
            padding: 19px;
          }

          .incident-form-group {
            margin-bottom: 15px;
          }

          .incident-form-group label {
            display: block;
            margin-bottom: 7px;
            color: #9eacc0;
            font-size: 10px;
            font-weight: 600;
          }

          .incident-form-group input,
          .incident-form-group textarea,
          .incident-form-group select {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #26354a;
            border-radius: 7px;
            outline: none;
            background: #080f19;
            color: #e8eef7;
            font-family: inherit;
            font-size: 11px;
          }

          .incident-form-group input,
          .incident-form-group select {
            height: 38px;
            padding: 0 11px;
          }

          .incident-form-group textarea {
            min-height: 100px;
            resize: vertical;
            padding: 10px 11px;
          }

          .incident-form-group input:focus,
          .incident-form-group textarea:focus,
          .incident-form-group select:focus {
            border-color: #3b82f6;
          }

          .incident-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .form-error {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 9px 10px;
            margin-bottom: 14px;
            border: 1px solid rgba(239, 68, 68, 0.30);
            border-radius: 7px;
            background: rgba(127, 29, 29, 0.15);
            color: #ff747b;
            font-size: 10px;
          }

          .incident-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            padding-top: 4px;
          }

          .view-field {
            margin-bottom: 16px;
          }

          .view-field-label {
            color: #60718b;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .view-field-value {
            color: #dce5f2;
            font-size: 12px;
            line-height: 1.55;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .delete-modal {
            width: min(420px, 100%);
          }

          .delete-content {
            padding: 22px 20px;
            text-align: center;
          }

          .delete-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ff6b73;
            background: rgba(239, 68, 68, 0.10);
            border: 1px solid rgba(239, 68, 68, 0.25);
          }

          .delete-content h3 {
            margin: 0 0 7px;
            color: #f1f5fb;
            font-size: 15px;
          }

          .delete-content p {
            margin: 0;
            color: #74839a;
            font-size: 11px;
            line-height: 1.6;
          }

          .delete-footer {
            display: flex;
            justify-content: center;
            gap: 9px;
            padding: 0 20px 20px;
          }

          .delete-confirm {
            border-color: rgba(239, 68, 68, 0.35);
            background: rgba(127, 29, 29, 0.20);
            color: #ff737a;
          }

          .delete-confirm:hover {
            background: rgba(153, 27, 27, 0.35);
            border-color: rgba(239, 68, 68, 0.55);
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1100px) {
            .incident-stats {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .incidents-header {
              flex-direction: column;
            }

            .incidents-actions {
              width: 100%;
            }

            .incident-action-btn {
              flex: 1;
            }

            .incident-stats {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .incident-panel-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .incident-table-tools {
              width: 100%;
            }

            .incident-search {
              flex: 1;
              width: auto;
            }

            .incident-form-row {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="incidents-page">
        {/* =========================
            HEADER
        ========================= */}

        <div className="incidents-header">
          <div>
            <h3>Incidents</h3>
            <p>
              Monitor and manage security incidents across your
              infrastructure.
            </p>
          </div>

          <div className="incidents-actions">
            <button
              type="button"
              className="incident-action-btn"
              onClick={() => fetchIncidents(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                style={
                  refreshing
                    ? {
                        animation:
                          "spin 1s linear infinite",
                      }
                    : undefined
                }
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              className="incident-action-btn primary"
              onClick={openCreateModal}
            >
              <Plus size={15} />
              New Incident
            </button>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="incident-error">
            <AlertTriangle size={15} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="incident-stats">
          <div className="incident-stat">
            <div className="incident-stat-icon">
              <ShieldAlert size={19} />
            </div>

            <div className="incident-stat-content">
              <span>Total Incidents</span>
              <strong>{totalIncidents}</strong>
            </div>
          </div>

          <div className="incident-stat">
            <div className="incident-stat-icon red">
              <AlertTriangle size={19} />
            </div>

            <div className="incident-stat-content">
              <span>Critical</span>
              <strong>{criticalIncidents}</strong>
            </div>
          </div>

          <div className="incident-stat">
            <div className="incident-stat-icon orange">
              <AlertCircle size={19} />
            </div>

            <div className="incident-stat-content">
              <span>High Risk</span>
              <strong>{highIncidents}</strong>
            </div>
          </div>

          <div className="incident-stat">
            <div className="incident-stat-icon purple">
              <Clock3 size={19} />
            </div>

            <div className="incident-stat-content">
              <span>Open</span>
              <strong>{openIncidents}</strong>
            </div>
          </div>

          <div className="incident-stat">
            <div className="incident-stat-icon green">
              <CheckCircle2 size={19} />
            </div>

            <div className="incident-stat-content">
              <span>Resolved</span>
              <strong>{resolvedIncidents}</strong>
            </div>
          </div>
        </div>

        {/* =========================
            INCIDENT TABLE
        ========================= */}

        <section className="incident-panel">
          <div className="incident-panel-header">
            <div className="incident-panel-title">
              <h4>Security Incidents</h4>
              <span>
                Review and manage detected security incidents.
              </span>
            </div>

            <div className="incident-table-tools">
              <div className="incident-search">
                <Search size={14} />

                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <span className="incident-count">
                {filteredIncidents.length} incidents
              </span>
            </div>
          </div>

          <div className="incident-table-wrapper">
            {filteredIncidents.length === 0 ? (
              <div className="incident-empty">
                <div className="incident-empty-icon">
                  <FileWarning size={22} />
                </div>

                <strong>
                  {searchTerm
                    ? "No matching incidents"
                    : "No incidents found"}
                </strong>

                <span>
                  {searchTerm
                    ? "Try a different search term."
                    : "Create a new incident to get started."}
                </span>
              </div>
            ) : (
              <table className="incident-table">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        <div className="incident-title-cell">
                          <div className="incident-row-icon">
                            <AlertTriangle size={14} />
                          </div>

                          <div>
                            <div className="incident-title-main">
                              {incident.title}
                            </div>

                            <div className="incident-title-id">
                              Incident #{incident.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`severity-badge ${getSeverityClass(
                            incident.severity
                          )}`}
                        >
                          {incident.severity || "Low"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            incident.status
                          )}`}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "currentColor",
                            }}
                          ></span>

                          {incident.status || "Open"}
                        </span>
                      </td>

                      <td>
                        <div
                          className="incident-description"
                          title={incident.description}
                        >
                          {incident.description}
                        </div>
                      </td>

                      <td>
                        <div className="incident-actions-cell">
                          <button
                            type="button"
                            className="table-icon-btn"
                            title="View incident"
                            onClick={() =>
                              openViewModal(incident)
                            }
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            className="table-icon-btn"
                            title="Edit incident"
                            onClick={() =>
                              openEditModal(incident)
                            }
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            className="table-icon-btn delete"
                            title="Delete incident"
                            onClick={() =>
                              openDeleteModal(incident.id)
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* =========================
          CREATE / EDIT / VIEW MODAL
      ========================= */}

      {showModal && (
        <div
          className="incident-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="incident-modal">
            <div className="incident-modal-header">
              <div className="incident-modal-heading">
                <div className="incident-modal-heading-icon">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <h3>
                    {modalMode === "create"
                      ? "Create New Incident"
                      : modalMode === "edit"
                      ? "Edit Incident"
                      : "Incident Details"}
                  </h3>

                  <span>
                    {modalMode === "create"
                      ? "Add a security incident to AegisX."
                      : modalMode === "edit"
                      ? "Update the incident information."
                      : `Incident #${
                          selectedIncident?.id || ""
                        }`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={16} />
              </button>
            </div>

            {modalMode === "view" && selectedIncident ? (
              <div className="incident-form">
                <div className="view-field">
                  <div className="view-field-label">
                    Title
                  </div>

                  <div className="view-field-value">
                    {selectedIncident.title}
                  </div>
                </div>

                <div className="incident-form-row">
                  <div className="view-field">
                    <div className="view-field-label">
                      Severity
                    </div>

                    <span
                      className={`severity-badge ${getSeverityClass(
                        selectedIncident.severity
                      )}`}
                    >
                      {selectedIncident.severity}
                    </span>
                  </div>

                  <div className="view-field">
                    <div className="view-field-label">
                      Status
                    </div>

                    <span
                      className={`status-badge ${getStatusClass(
                        selectedIncident.status
                      )}`}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "currentColor",
                        }}
                      ></span>

                      {selectedIncident.status}
                    </span>
                  </div>
                </div>

                <div className="view-field">
                  <div className="view-field-label">
                    Description
                  </div>

                  <div className="view-field-value">
                    {selectedIncident.description}
                  </div>
                </div>

                <div className="incident-modal-footer">
                  <button
                    type="button"
                    className="incident-action-btn"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="incident-action-btn primary"
                    onClick={() =>
                      openEditModal(selectedIncident)
                    }
                  >
                    <Pencil size={14} />
                    Edit Incident
                  </button>
                </div>
              </div>
            ) : (
              <form
                className="incident-form"
                onSubmit={handleSubmit}
              >
                {formError && (
                  <div className="form-error">
                    <AlertTriangle size={13} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="incident-form-group">
                  <label htmlFor="incident-title">
                    Incident Title
                  </label>

                  <input
                    id="incident-title"
                    name="title"
                    type="text"
                    placeholder="Enter incident title"
                    value={form.title}
                    onChange={handleFormChange}
                    disabled={saving}
                    maxLength={200}
                  />
                </div>

                <div className="incident-form-group">
                  <label htmlFor="incident-description">
                    Description
                  </label>

                  <textarea
                    id="incident-description"
                    name="description"
                    placeholder="Describe the security incident..."
                    value={form.description}
                    onChange={handleFormChange}
                    disabled={saving}
                    maxLength={1000}
                  />
                </div>

                <div className="incident-form-row">
                  <div className="incident-form-group">
                    <label htmlFor="incident-severity">
                      Severity
                    </label>

                    <select
                      id="incident-severity"
                      name="severity"
                      value={form.severity}
                      onChange={handleFormChange}
                      disabled={saving}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {modalMode === "edit" && (
                    <div className="incident-form-group">
                      <label htmlFor="incident-status">
                        Status
                      </label>

                      <select
                        id="incident-status"
                        name="status"
                        value={form.status}
                        onChange={handleFormChange}
                        disabled={saving}
                      >
                        <option value="Open">Open</option>
                        <option value="Investigating">
                          Investigating
                        </option>
                        <option value="Resolved">
                          Resolved
                        </option>
                        <option value="Closed">
                          Closed
                        </option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="incident-modal-footer">
                  <button
                    type="button"
                    className="incident-action-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="incident-action-btn primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={14}
                          style={{
                            animation:
                              "spin 1s linear infinite",
                          }}
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        {modalMode === "create" ? (
                          <Plus size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}

                        {modalMode === "create"
                          ? "Create Incident"
                          : "Save Changes"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================
          DELETE MODAL
      ========================= */}

      {showDeleteModal && (
        <div
          className="incident-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="incident-modal delete-modal">
            <div className="incident-modal-header">
              <div className="incident-modal-heading">
                <div className="incident-modal-heading-icon">
                  <Trash2 size={17} />
                </div>

                <div>
                  <h3>Delete Incident</h3>
                  <span>
                    This action cannot be undone.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                <X size={16} />
              </button>
            </div>

            <div className="delete-content">
              <div className="delete-icon">
                <AlertTriangle size={22} />
              </div>

              <h3>Are you sure?</h3>

              <p>
                This will permanently delete the selected
                security incident from AegisX.
              </p>
            </div>

            <div className="delete-footer">
              <button
                type="button"
                className="incident-action-btn"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="incident-action-btn delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{
                        animation:
                          "spin 1s linear infinite",
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete Incident
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Incidents;