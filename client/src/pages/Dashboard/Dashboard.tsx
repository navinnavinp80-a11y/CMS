import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Image,
  Brush,
  Users,
  Settings,
  Menu,
  ChevronDown,
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
import "./Dashboard.css";

function Dashboard() {

    const [stats, setStats] = useState({
  totalPosts: 0,
  totalPages: 0,
  totalUsers: 0,
  visitorsToday: 0,
  hourlyTraffic: [],
  popularArticles: [],
});

useEffect(() => {
  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();

      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  fetchStats();
}, []);
  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <span className="logo-mark">▣</span>
        </div>

        <nav className="sidebar-nav">

          <button className="sidebar-item active">
            <LayoutDashboard size={19} />
          </button>

          <button className="sidebar-item">
            <Layers size={19} />
          </button>

          <button className="sidebar-item">
            <FileText size={19} />
          </button>

          <button className="sidebar-item">
            <Image size={19} />
          </button>

          <button className="sidebar-item">
            <Brush size={19} />
          </button>

          <button className="sidebar-item">
            <Users size={19} />
          </button>

          <button className="sidebar-item">
            <Settings size={19} />
          </button>

        </nav>

      </aside>

      {/* Main Area */}
      <div className="main-area">

        {/* Header */}
        <header className="top-header">

          <div className="header-left">
            <Menu size={23} />
            <span className="header-logo">Logo</span>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              U
            </div>

            <span className="user-name">
              Admin
            </span>

            <ChevronDown size={16} />
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

    <h2>{stats.visitorsToday}</h2>
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