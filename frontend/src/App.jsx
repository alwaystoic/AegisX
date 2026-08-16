import { useState } from "react";
import "./App.css";

import {
  LayoutDashboard,
  Database,
  Search,
  ShieldAlert,
  AlertTriangle,
  Bot,
  GitBranch,
  Clock3,
  FileText,
  Settings,
  LogOut,
  Bell,
  UserCircle,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import Databases from "./pages/Databases";
import Scans from "./pages/Scans";
import Threats from "./pages/Threats";
import Incidents from "./pages/Incidents";
import AIRecommendations from "./pages/AIRecommendations";
import SecurityPipeline from "./pages/SecurityPipeline";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  const [activePage, setActivePage] = useState("Dashboard");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Databases", icon: Database },
    { name: "Scans", icon: Search },
    { name: "Threats", icon: ShieldAlert },
    { name: "Incidents", icon: AlertTriangle },
    { name: "AI Recommendations", icon: Bot },
    { name: "Security Pipeline", icon: GitBranch },
    { name: "Scheduler", icon: Clock3 },
    { name: "Reports", icon: FileText },
  ];

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter your username and password.");
      return;
    }

    setLoggingIn(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", username.trim());
      formData.append("password", password);

      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail || "Invalid username or password."
        );
      }

      if (!data.access_token) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      localStorage.setItem("access_token", data.access_token);

      if (data.token_type) {
        localStorage.setItem("token_type", data.token_type);
      }

      localStorage.setItem("username", username.trim());

      setIsAuthenticated(true);
      setActivePage("Dashboard");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(
        error.message || "Unable to connect to the AegisX backend."
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("username");

    setIsAuthenticated(false);
    setActivePage("Dashboard");
    setUsername("");
    setPassword("");
  };

  /*
   * =========================
   * LOGIN SCREEN
   * =========================
   */

  if (!isAuthenticated) {
    return (
      <div className="login-page">
        <div className="login-background-glow"></div>

        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">
              <ShieldAlert size={28} />
            </div>

            <div>
              <h1>AegisX</h1>
              <span>Security Platform</span>
            </div>
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>

            <p>
              Sign in to access the AegisX security operations platform.
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>

              <div className="login-input-wrapper">
                <User size={18} />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  autoComplete="username"
                  disabled={loggingIn}
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  disabled={loggingIn}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={loggingIn}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="login-error">
                <AlertTriangle size={17} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>
                  <Loader2
                    size={18}
                    className="login-spinner"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <LockKeyhole size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <span className="login-status-dot"></span>
            <span>AegisX Security System</span>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * MAIN APPLICATION
   * =========================
   */

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldAlert size={25} />
          </div>

          <div>
            <h1>AegisX</h1>
            <span>Security Platform</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-title">MAIN MENU</p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}

      <main className="main">

        {/* =========================
            TOPBAR
        ========================= */}

        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Security Operations
            </p>

            <h2>{activePage}</h2>
          </div>

          <div className="topbar-right">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <UserCircle size={34} />

              <div>
                <strong>
                  {localStorage.getItem("username") ||
                    "Administrator"}
                </strong>

                <span>Security Analyst</span>
              </div>
            </div>
          </div>
        </header>

        {/* =========================
            DASHBOARD
        ========================= */}

        {activePage === "Dashboard" && (
          <section className="content">

            <div className="welcome">
              <div>
                <h3>Security Overview</h3>

                <p>
                  Monitor your infrastructure, threats and
                  security posture.
                </p>
              </div>

              <div className="system-status">
                <span className="status-dot"></span>
                System Operational
              </div>
            </div>

            {/* =========================
                STATISTICS
            ========================= */}

            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon score">
                  <ShieldAlert size={22} />
                </div>

                <div>
                  <span>Security Score</span>
                  <strong>85</strong>
                </div>

                <small>
                  Good security posture
                </small>
              </div>

              <div className="stat-card">
                <div className="stat-icon users">
                  <UserCircle size={22} />
                </div>

                <div>
                  <span>Total Users</span>
                  <strong>12</strong>
                </div>

                <small>
                  Active users
                </small>
              </div>

              <div className="stat-card">
                <div className="stat-icon databases">
                  <Database size={22} />
                </div>

                <div>
                  <span>Databases</span>
                  <strong>4</strong>
                </div>

                <small>
                  Connected databases
                </small>
              </div>

              <div className="stat-card">
                <div className="stat-icon scans">
                  <Search size={22} />
                </div>

                <div>
                  <span>Total Scans</span>
                  <strong>48</strong>
                </div>

                <small>
                  Security scans performed
                </small>
              </div>

            </div>

            {/* =========================
                SECURITY + THREATS
            ========================= */}

            <div className="dashboard-grid">

              <section className="panel security-panel">

                <div className="panel-header">
                  <div>
                    <h3>Security Status</h3>

                    <p>
                      Current system security posture
                    </p>
                  </div>

                  <span className="healthy-badge">
                    Healthy
                  </span>
                </div>

                <div className="score-container">

                  <div className="score-circle">
                    <strong>85</strong>
                    <span>/ 100</span>
                  </div>

                  <div className="score-details">
                    <h4>
                      Good Security Posture
                    </h4>

                    <p>
                      Your infrastructure is currently
                      operating within a healthy security
                      range.
                    </p>
                  </div>

                </div>

              </section>

              <section className="panel threat-panel">

                <div className="panel-header">
                  <div>
                    <h3>Threat Overview</h3>

                    <p>
                      Detected security threats
                    </p>
                  </div>
                </div>

                <div className="threat-stats">

                  <div>
                    <span className="threat-number critical">
                      2
                    </span>

                    <small>
                      Critical
                    </small>
                  </div>

                  <div>
                    <span className="threat-number high">
                      5
                    </span>

                    <small>
                      High
                    </small>
                  </div>

                  <div>
                    <span className="threat-number medium">
                      8
                    </span>

                    <small>
                      Medium
                    </small>
                  </div>

                  <div>
                    <span className="threat-number low">
                      12
                    </span>

                    <small>
                      Low
                    </small>
                  </div>

                </div>

              </section>

            </div>

            {/* =========================
                SECURITY PIPELINE
            ========================= */}

            <section className="panel pipeline-panel">

              <div className="panel-header">

                <div>
                  <h3>
                    Security Pipeline
                  </h3>

                  <p>
                    Automated security analysis workflow
                  </p>
                </div>

                <span className="pipeline-running">
                  <span className="status-dot"></span>
                  Running
                </span>

              </div>

              <div className="pipeline">

                <div className="pipeline-step completed">
                  <span>1</span>
                  <strong>
                    Health Scan
                  </strong>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step completed">
                  <span>2</span>
                  <strong>
                    SQL Analysis
                  </strong>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step active-step">
                  <span>3</span>
                  <strong>
                    Threat Detection
                  </strong>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step">
                  <span>4</span>
                  <strong>
                    AI Recommendation
                  </strong>
                </div>

                <div className="pipeline-line"></div>

                <div className="pipeline-step">
                  <span>5</span>
                  <strong>
                    Response Engine
                  </strong>
                </div>

              </div>

            </section>

          </section>
        )}

        {/* =========================
            DATABASES
        ========================= */}

        {activePage === "Databases" && (
          <Databases />
        )}

        {/* =========================
            SCANS
        ========================= */}

        {activePage === "Scans" && (
          <Scans />
        )}

        {/* =========================
            THREATS
        ========================= */}

        {activePage === "Threats" && (
          <Threats />
        )}

        {/* =========================
            INCIDENTS
        ========================= */}

        {activePage === "Incidents" && (
          <Incidents />
        )}

        {/* =========================
            AI RECOMMENDATIONS
        ========================= */}

        {activePage === "AI Recommendations" && (
          <AIRecommendations />
        )}

        {/* =========================
            SECURITY PIPELINE
        ========================= */}

        {activePage === "Security Pipeline" && (
          <SecurityPipeline />
        )}

        {/* =========================
            PLACEHOLDER PAGES
        ========================= */}

        {activePage !== "Dashboard" &&
          activePage !== "Databases" &&
          activePage !== "Scans" &&
          activePage !== "Threats" &&
          activePage !== "Incidents" &&
          activePage !== "AI Recommendations" &&
          activePage !== "Security Pipeline" && (
            <section className="content">
              <div className="panel placeholder-panel">
                <h3>{activePage}</h3>

                <p>
                  This AegisX module is ready for integration.
                </p>
              </div>
            </section>
          )}

      </main>

    </div>
  );
}

export default App;