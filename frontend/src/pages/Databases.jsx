import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Database,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Server,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const emptyForm = {
  name: "",
  db_type: "PostgreSQL",
  host: "",
  port: 5432,
  database_name: "",
  username: "",
  password: "",
  owner: "",
};

function Databases() {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const loadDatabases = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/databases/`, {
        headers: getHeaders(),
      });

      if (response.status === 401) {
        throw new Error(
          "Authentication required. Please log in before accessing databases."
        );
      }

      if (!response.ok) {
        throw new Error("Failed to load databases.");
      }

      const data = await response.json();
      setDatabases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialDatabases = async () => {
      await loadDatabases();
    };

    loadInitialDatabases();
  }, [loadDatabases]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "port" ? Number(value) : value,
    }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (database) => {
    setEditingId(database.id);

    setForm({
      name: database.name,
      db_type: database.db_type,
      host: database.host,
      port: database.port,
      database_name: database.database_name,
      username: database.username,
      password: "",
      owner: database.owner || "",
    });

    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `${API_URL}/databases/${editingId}`
        : `${API_URL}/databases/`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        throw new Error(
          "Authentication required. Please log in before managing databases."
        );
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Unable to save database."
        );
      }

      closeForm();
      await loadDatabases();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this database?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/databases/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.status === 401) {
        throw new Error(
          "Authentication required. Please log in before deleting databases."
        );
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Unable to delete database."
        );
      }

      await loadDatabases();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-content">
      <div className="page-header">
        <div>
          <p className="breadcrumb">Security Operations</p>
          <h2>Databases</h2>
          <p className="page-description">
            Manage connected databases and their security configuration.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={loadDatabases}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button className="primary-button" onClick={openCreateForm}>
            <Plus size={17} />
            Add Database
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <RefreshCw size={28} className="loading-icon" />
          <h3>Loading databases...</h3>
          <p>Fetching connected database information.</p>
        </div>
      ) : databases.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Database size={30} />
          </div>

          <h3>No databases connected</h3>

          <p>
            Add your first database to start monitoring its security posture.
          </p>

          <button className="primary-button" onClick={openCreateForm}>
            <Plus size={17} />
            Add Database
          </button>
        </div>
      ) : (
        <div className="database-grid">
          {databases.map((database) => (
            <div className="database-card" key={database.id}>
              <div className="database-card-header">
                <div className="database-icon">
                  <Database size={22} />
                </div>

                <div className="database-title">
                  <h3>{database.name}</h3>
                  <span>{database.db_type}</span>
                </div>

                <span
                  className={
                    database.is_active
                      ? "database-status active"
                      : "database-status inactive"
                  }
                >
                  {database.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="database-details">
                <div>
                  <span>Host</span>
                  <strong>{database.host}</strong>
                </div>

                <div>
                  <span>Port</span>
                  <strong>{database.port}</strong>
                </div>

                <div>
                  <span>Database</span>
                  <strong>{database.database_name}</strong>
                </div>

                <div>
                  <span>Username</span>
                  <strong>{database.username}</strong>
                </div>

                <div>
                  <span>Owner</span>
                  <strong>{database.owner || "Unassigned"}</strong>
                </div>
              </div>

              <div className="database-card-footer">
                <div className="connection-status">
                  <span className="status-dot"></span>
                  Connection configured
                </div>

                <div className="database-actions">
                  <button
                    className="icon-action"
                    title="Edit database"
                    onClick={() => openEditForm(database)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="icon-action danger"
                    title="Delete database"
                    onClick={() => handleDelete(database.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="database-modal">
            <div className="modal-header">
              <div>
                <h3>
                  {editingId ? "Edit Database" : "Add Database"}
                </h3>

                <p>
                  Configure the database connection details.
                </p>
              </div>

              <button className="modal-close" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Database Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Production PostgreSQL"
                    required
                  />
                </label>

                <label>
                  Database Type
                  <select
                    name="db_type"
                    value={form.db_type}
                    onChange={handleChange}
                  >
                    <option>PostgreSQL</option>
                    <option>MySQL</option>
                    <option>MongoDB</option>
                    <option>SQLite</option>
                  </select>
                </label>

                <label>
                  Host
                  <input
                    name="host"
                    value={form.host}
                    onChange={handleChange}
                    placeholder="localhost"
                    required
                  />
                </label>

                <label>
                  Port
                  <input
                    type="number"
                    name="port"
                    value={form.port}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Database
                  <input
                    name="database_name"
                    value={form.database_name}
                    onChange={handleChange}
                    placeholder="aegisx"
                    required
                  />
                </label>

                <label>
                  Username
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="postgres"
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      editingId
                        ? "Enter password"
                        : "Database password"
                    }
                    required={!editingId}
                  />
                </label>

                <label>
                  Owner
                  <input
                    name="owner"
                    value={form.owner}
                    onChange={handleChange}
                    placeholder="Security Team"
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  <Server size={17} />
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Database"
                      : "Connect Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Databases;