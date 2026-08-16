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
} from "lucide-react";



function App() {
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Databases", icon: Database },
    { name: "Scans", icon: Search },
    { name: "Threats", icon: ShieldAlert },
    { name: "Incidents", icon: AlertTriangle },
    { name: "AI Recommendations", icon: Bot },
    { name: "Security Pipeline", icon: GitBranch },
    { name: "Scheduler", icon: Clock3 },
    { name: "Reports", icon: FileText },
  ];

  return (
    <div className="app">
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
                className={`nav-item ${item.active ? "active" : ""}`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button className="nav-item logout">
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Security Operations</p>
            <h2>Dashboard</h2>
          </div>

          <div className="topbar-right">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <UserCircle size={34} />
              <div>
                <strong>Administrator</strong>
                <span>Security Analyst</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <h3>Security Overview</h3>
              <p>
                Monitor your infrastructure, threats and security posture.
              </p>
            </div>

            <div className="system-status">
              <span className="status-dot"></span>
              System Operational
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon score">
                <ShieldAlert size={22} />
              </div>
              <div>
                <span>Security Score</span>
                <strong>85</strong>
              </div>
              <small>Good security posture</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon users">
                <UserCircle size={22} />
              </div>
              <div>
                <span>Total Users</span>
                <strong>12</strong>
              </div>
              <small>Active users</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon databases">
                <Database size={22} />
              </div>
              <div>
                <span>Databases</span>
                <strong>4</strong>
              </div>
              <small>Connected databases</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon scans">
                <Search size={22} />
              </div>
              <div>
                <span>Total Scans</span>
                <strong>48</strong>
              </div>
              <small>Security scans performed</small>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="panel security-panel">
              <div className="panel-header">
                <div>
                  <h3>Security Status</h3>
                  <p>Current system security posture</p>
                </div>

                <span className="healthy-badge">Healthy</span>
              </div>

              <div className="score-container">
                <div className="score-circle">
                  <strong>85</strong>
                  <span>/ 100</span>
                </div>

                <div className="score-details">
                  <h4>Good Security Posture</h4>
                  <p>
                    Your infrastructure is currently operating within a
                    healthy security range.
                  </p>
                </div>
              </div>
            </section>

            <section className="panel threat-panel">
              <div className="panel-header">
                <div>
                  <h3>Threat Overview</h3>
                  <p>Detected security threats</p>
                </div>
              </div>

              <div className="threat-stats">
                <div>
                  <span className="threat-number critical">2</span>
                  <small>Critical</small>
                </div>

                <div>
                  <span className="threat-number high">5</span>
                  <small>High</small>
                </div>

                <div>
                  <span className="threat-number medium">8</span>
                  <small>Medium</small>
                </div>

                <div>
                  <span className="threat-number low">12</span>
                  <small>Low</small>
                </div>
              </div>
            </section>
          </div>

          <section className="panel pipeline-panel">
            <div className="panel-header">
              <div>
                <h3>Security Pipeline</h3>
                <p>Automated security analysis workflow</p>
              </div>

              <span className="pipeline-running">
                <span className="status-dot"></span>
                Running
              </span>
            </div>

            <div className="pipeline">
              <div className="pipeline-step completed">
                <span>1</span>
                <strong>Health Scan</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step completed">
                <span>2</span>
                <strong>SQL Analysis</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step active-step">
                <span>3</span>
                <strong>Threat Detection</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>4</span>
                <strong>AI Recommendation</strong>
              </div>

              <div className="pipeline-line"></div>

              <div className="pipeline-step">
                <span>5</span>
                <strong>Response Engine</strong>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;