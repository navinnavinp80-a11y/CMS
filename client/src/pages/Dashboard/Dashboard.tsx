import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Layers,
  Users,
  Menu,
  ChevronDown,
  LogOut,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardStats } from "../../services/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Dashboard.css";

interface CurrentUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalPages: 0,
    totalUsers: 0,
    visitorsToday: 0,
    hourlyTraffic: [],
    popularArticles: [],
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();

        if (data.stats) {
          setStats(data.stats);
        }

        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        if (error?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setStats({
      totalPosts: 0,
      totalPages: 0,
      totalUsers: 0,
      visitorsToday: 0,
      hourlyTraffic: [],
      popularArticles: [],
    });
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const displayName = currentUser?.name || "Admin";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">

      {/* Redesigned Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* Main Area */}
      <div className="main-area">

        {/* Header */}
        <header className="top-header">

          <div className="header-left">
            <button
              type="button"
              className="header-menu-trigger"
              onClick={() => {
                // If on mobile screen, open drawer; if desktop, toggle collapse
                if (window.innerWidth <= 900) {
                  setMobileDrawerOpen(true);
                } else {
                  toggleSidebarCollapse();
                }
              }}
              aria-label="Toggle navigation menu"
              title="Toggle sidebar"
            >
              <Menu size={22} />
            </button>
            <span className="header-logo">Nexus CMS</span>
          </div>

          <div className="header-user-wrapper" ref={dropdownRef}>
            <div
              className="header-user"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              role="button"
              tabIndex={0}
            >
              <div className="user-avatar">
                {avatarLetter}
              </div>

              <span className="user-name">
                {displayName}
              </span>

              <ChevronDown size={16} />
            </div>

            {userMenuOpen && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <strong>{displayName}</strong>
                  {currentUser?.role && (
                    <span className="user-role-badge">{currentUser.role}</span>
                  )}
                  {currentUser?.email && (
                    <small>{currentUser.email}</small>
                  )}
                </div>
                <div className="user-dropdown-divider" />
                <button
                  type="button"
                  className="user-logout-btn"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content">

          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>
              A live overview of your content and audience.
            </p>
          </div>

          <div className="dashboard-cards">

            <div className="dashboard-card">
              <div className="card-top">
                <span>Total Posts</span>
                <FileText size={21} />
              </div>

              <h2>{stats.totalPosts}</h2>
            </div>

            <div className="dashboard-card">
              <div className="card-top">
                <span>Total Pages</span>
                <Layers size={21} />
              </div>

              <h2>{stats.totalPages}</h2>
            </div>

            <div className="dashboard-card">
              <div className="card-top">
                <span>Total Users</span>
                <Users size={21} />
              </div>

              <h2>{stats.totalUsers}</h2>
            </div>

            <div className="dashboard-card">
              <div className="card-top">
                <span>Visitors today</span>
                <span className="visitor-icon">◉</span>
              </div>

              <h2>{stats.visitorsToday}</h2>
            </div>

          </div>


          <div className="traffic-section">
            <div className="traffic-header">
              <div>
                <h2>Hourly Traffic</h2>
                <p>Visitors throughout today</p>
              </div>
            </div>

            <div className="traffic-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.hourlyTraffic}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="_id"
                    tickFormatter={(hour) => `${hour}:00`}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip
                    labelFormatter={(hour) => `${hour}:00`}
                  />

                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#5146e5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="popular-section">
            <div className="popular-header">
              <div>
                <h2>Popular Articles</h2>
                <p>Most visited articles</p>
              </div>
            </div>

            <div className="popular-list">
              {stats.popularArticles.length === 0 ? (
                <p className="empty-popular">
                  No article visits yet.
                </p>
              ) : (
                stats.popularArticles.map((article: any, index: number) => (
                  <div className="popular-item" key={article._id}>
                    <div className="popular-rank">
                      {index + 1}
                    </div>

                    <div className="popular-info">
                      <h3>{article.title}</h3>
                      <span>{article.slug}</span>
                    </div>

                    <div className="popular-visits">
                      {article.visits} visits
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;