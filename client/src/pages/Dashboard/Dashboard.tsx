import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Eye,
  Users,
  Image as ImageIcon,
  ChevronLeft,
  Plus,
  Upload,
  TrendingUp,
  Clock,
  Layers,
  Activity,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { getDashboardStats } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/Layout/AdminLayout";
import "./Dashboard.css";

const BAR_COLORS = [
  "#2563EB",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
];

interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  type: "post" | "page";
  createdAt: string;
  updatedAt?: string;
}

interface MediaItem {
  _id: string;
  originalName: string;
  type: string;
  createdAt?: string;
}

interface ActivityEvent {
  id: string;
  title: string;
  type: string;
  timeAgo: string;
  rawDate: Date;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalPages: 0,
    totalUsers: 0,
    visitorsToday: 0,
    hourlyTraffic: [] as Array<{ _id: number; visitors: number }>,
    popularArticles: [] as Array<{ _id: string; title: string; slug: string; visits: number }>,
    globalPosts: 0,
    globalPages: 0,
  });

  const [recentItems, setRecentItems] = useState<ContentItem[]>([]);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    const loadRealDashboardData = async () => {
      try {
        // 1. Fetch dashboard statistics
        const dashData = await getDashboardStats();
        if (dashData.stats) {
          setStats(dashData.stats);
        }

        // 2. Fetch real content records
        const contentRes = await fetch("http://localhost:5000/api/content", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let fetchedContents: ContentItem[] = [];
        if (contentRes.ok) {
          const contentJson = await contentRes.json();
          const list = contentJson.contents || contentJson;
          if (Array.isArray(list)) {
            fetchedContents = list;
            setRecentItems(list.slice(0, 5));
          }
        }

        // 3. Fetch real media records
        const mediaRes = await fetch("http://localhost:5000/api/media", {
          headers: { Authorization: `Bearer ${token}` },
        });
        let fetchedMedia: MediaItem[] = [];
        if (mediaRes.ok) {
          const mediaJson = await mediaRes.json();
          const mediaList = mediaJson.media || mediaJson;
          if (Array.isArray(mediaList)) {
            fetchedMedia = mediaList;
            setMediaCount(mediaList.length);
          }
        }

        // 4. Derive actual team & system activity from real DB entities
        const activityList: ActivityEvent[] = [];

        fetchedContents.forEach((c) => {
          const d = new Date(c.createdAt || Date.now());
          activityList.push({
            id: `c-${c._id}`,
            title: `Content "${c.title}" was created as a ${c.type}`,
            type: c.type,
            rawDate: d,
            timeAgo: formatRelativeTime(d),
          });
        });

        fetchedMedia.forEach((m) => {
          const d = new Date(m.createdAt || Date.now());
          activityList.push({
            id: `m-${m._id}`,
            title: `Media asset "${m.originalName}" was uploaded`,
            type: "media",
            rawDate: d,
            timeAgo: formatRelativeTime(d),
          });
        });

        // Sort descending by date
        activityList.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
        setActivities(activityList.slice(0, 5));
      } catch (err: any) {
        console.error("Dashboard data load error:", err);
        if (err?.status === 401) {
          logout();
          navigate("/login", { replace: true });
        }
      }
    };

    loadRealDashboardData();
  }, [navigate]);

  function formatRelativeTime(date: Date): string {
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Construct chart data purely from real backend data
  const performanceData =
    stats.popularArticles.length > 0
      ? stats.popularArticles.map((item) => ({
          name: item.title.length > 14 ? `${item.title.slice(0, 12)}…` : item.title,
          value: item.visits,
        }))
      : [
          { name: "Posts", value: stats.totalPosts },
          { name: "Pages", value: stats.totalPages },
        ];

  const hasPerformanceData =
    stats.popularArticles.length > 0 || stats.totalPosts > 0 || stats.totalPages > 0;

  // Hourly traffic from real Visit aggregation
  const hourlyTrafficChartData = stats.hourlyTraffic.map((h) => ({
    hour: `${h._id}:00`,
    visitors: h.visitors,
  }));

  return (
    <AdminLayout contentCount={recentItems.length}>
      {/* Top Title Bar */}
      <div className="dashboard-top-bar">
        <div className="dashboard-title-group">
          <button
            type="button"
            className="dashboard-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="dashboard-heading">Dashboard</h1>
        </div>
      </div>

      {/* Top 5 Stat Cards with Real API Responses */}
      <div className="dashboard-metrics-grid">
        {/* Card 1: Total Posts */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Posts</span>
            <div className="metric-icon-box blue">
              <FileText size={17} />
            </div>
          </div>
          <div className="metric-value">{stats.totalPosts.toLocaleString()}</div>
          <div className="metric-indicator positive">
            <span className="metric-indicator-label">Authored blog posts</span>
          </div>
        </div>

        {/* Card 2: Total Pages */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Pages</span>
            <div className="metric-icon-box purple">
              <Layers size={17} />
            </div>
          </div>
          <div className="metric-value">{stats.totalPages.toLocaleString()}</div>
          <div className="metric-indicator positive">
            <span className="metric-indicator-label">Standalone pages</span>
          </div>
        </div>

        {/* Card 3: Total Users */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Total Users</span>
            <div className="metric-icon-box green">
              <Users size={17} />
            </div>
          </div>
          <div className="metric-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="metric-indicator positive">
            <span className="metric-indicator-label">Registered accounts</span>
          </div>
        </div>

        {/* Card 4: Visitors Today */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Visitors Today</span>
            <div className="metric-icon-box red">
              <Eye size={17} />
            </div>
          </div>
          <div className="metric-value">{stats.visitorsToday.toLocaleString()}</div>
          <div className="metric-indicator positive">
            <span className="metric-indicator-label">Live traffic today</span>
          </div>
        </div>

        {/* Card 5: Media Assets */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-label">Media Assets</span>
            <div className="metric-icon-box orange">
              <ImageIcon size={17} />
            </div>
          </div>
          <div className="metric-value">{mediaCount.toLocaleString()}</div>
          <div className="metric-indicator positive">
            <span className="metric-indicator-label">Uploaded media</span>
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Charts */}
      <div className="dashboard-charts-grid">
        {/* Left Chart: Content Performance */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">
                {stats.popularArticles.length > 0 ? "Top Content Visits" : "Content Distribution"}
              </h2>
            </div>
          </div>

          <div className="chart-container-inner">
            {!hasPerformanceData ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--cms-text-muted)",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <Activity size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>No content created yet</span>
                <span style={{ fontSize: "12px", marginTop: "4px" }}>
                  Create posts or pages to view performance distribution.
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={32}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="chart-custom-tooltip">
                            <div className="tooltip-val-row">
                              <span>{payload[0].payload.name}</span>
                              <span className="tooltip-val-num">{payload[0].value}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {performanceData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Chart: Hourly Traffic (Real Visit Aggregation) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Hourly Traffic (Today)</h2>
            </div>
            <div className="chart-header-actions">
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot visitor" />
                  <span>Visitors Today ({stats.visitorsToday})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-container-inner">
            {hourlyTrafficChartData.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--cms-text-muted)",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <Eye size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>No visits recorded today</span>
                <span style={{ fontSize: "12px", marginTop: "4px" }}>
                  Visits to published articles or pages will appear here in real time.
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyTrafficChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="realVisitorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="chart-custom-tooltip">
                            <div className="tooltip-month-row">
                              <span>Time: {label}</span>
                            </div>
                            <div className="tooltip-val-row">
                              <span>Visitors</span>
                              <span className="tooltip-val-num">{payload[0].value}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#realVisitorGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Cards Grid */}
      <div className="dashboard-bottom-grid">
        {/* Card 1: Recent Content */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Recent Content</h2>
            <button
              type="button"
              className="panel-link-btn"
              onClick={() => navigate("/content")}
            >
              View All
            </button>
          </div>

          <div className="recent-content-list">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div
                  key={item._id}
                  className="recent-content-item"
                  onClick={() =>
                    item.type === "page"
                      ? navigate(`/content/edit-page/${item._id}`)
                      : navigate(`/content/edit/${item._id}`)
                  }
                >
                  <div className="recent-item-thumb-placeholder">
                    {item.type === "page" ? <Globe size={22} /> : <FileText size={22} />}
                  </div>
                  <div className="recent-item-body">
                    <div className="recent-item-top">
                      <h3 className="recent-item-title">{item.title}</h3>
                      <span className={`recent-status-pill ${item.status}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="recent-item-desc">Slug: /{item.slug}</p>
                    <div className="recent-item-meta">
                      <span className="recent-meta-point">
                        <Clock size={13} />{" "}
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--cms-text-muted)",
                }}
              >
                <FileText size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                <p style={{ margin: "0 0 12px", fontSize: "13px" }}>No content created yet.</p>
                <button
                  type="button"
                  className="cms-btn-primary"
                  onClick={() => navigate("/content/create")}
                  style={{ padding: "6px 14px", fontSize: "12.5px" }}
                >
                  <Plus size={14} />
                  <span>Create Content</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Team & System Activity */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Recent Activity</h2>
          </div>

          <div className="team-activity-list">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div className="team-activity-item" key={act.id}>
                  <div
                    className="activity-avatar"
                    style={{
                      background:
                        act.type === "page"
                          ? "#8B5CF6"
                          : act.type === "media"
                          ? "#F59E0B"
                          : "#2563EB",
                    }}
                  >
                    {act.type === "media" ? "M" : act.type === "page" ? "P" : "B"}
                  </div>
                  <div className="activity-info">
                    <span className="activity-text">{act.title}</span>
                    <span className="activity-time">{act.timeAgo}</span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--cms-text-muted)",
                }}
              >
                <Activity size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: "13px" }}>No activity recorded yet.</p>
                <span style={{ fontSize: "11.5px" }}>Actions will appear here as content is published.</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Quick Actions */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Quick Actions</h2>
          </div>

          <div className="quick-actions-list">
            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate("/content/create")}
            >
              <div className="quick-icon-box blue">
                <Plus size={16} />
              </div>
              <span>Create New Post</span>
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate("/content/create-page")}
            >
              <div className="quick-icon-box purple">
                <Layers size={16} />
              </div>
              <span>Create Page</span>
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate("/media")}
            >
              <div className="quick-icon-box green">
                <Upload size={16} />
              </div>
              <span>Upload Media</span>
            </button>

            <button
              type="button"
              className="quick-action-btn"
              onClick={() => navigate("/analytics")}
            >
              <div className="quick-icon-box orange">
                <TrendingUp size={16} />
              </div>
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}