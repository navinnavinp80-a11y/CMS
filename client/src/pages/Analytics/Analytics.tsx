import { useEffect, useState } from "react";
import {
  Eye,
  FileText,
  Layers,
  Calendar,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardStats } from "../../services/api";
import AdminLayout from "../../components/Layout/AdminLayout";
import "./Analytics.css";

interface PopularArticle {
  _id: string;
  title: string;
  slug: string;
  visits: number;
}

interface HourlyVisit {
  _id: number;
  visitors: number;
}

export default function Analytics() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalPages: 0,
    visitorsToday: 0,
    hourlyTraffic: [] as HourlyVisit[],
    popularArticles: [] as PopularArticle[],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getDashboardStats();
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

  const hourlyChartData = stats.hourlyTraffic.map((item) => ({
    time: `${item._id}:00`,
    visitors: item.visitors,
  }));

  const totalArticleVisits = stats.popularArticles.reduce((sum, item) => sum + item.visits, 0);

  return (
    <AdminLayout>
      <div className="analytics-page-wrapper">
        <div className="analytics-header">
          <div className="analytics-title-group">
            <h1>Analytics & Traffic Insights</h1>
            <p>Live metrics and performance logs recorded from published content.</p>
          </div>

          <div className="analytics-date-picker">
            <Calendar size={15} color="#2563EB" />
            <span>Today's Real-time Data</span>
          </div>
        </div>

        {/* 4 Real Metric Cards */}
        <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="metric-card">
            <div className="metric-card-top">
              <span className="metric-label">Visitors Today</span>
              <div className="metric-icon-box blue">
                <Eye size={17} />
              </div>
            </div>
            <div className="metric-value">{stats.visitorsToday.toLocaleString()}</div>
            <div className="metric-indicator positive">
              <span className="metric-indicator-label">Logged visits today</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-top">
              <span className="metric-label">Top Articles Visited</span>
              <div className="metric-icon-box green">
                <FileText size={17} />
              </div>
            </div>
            <div className="metric-value">{stats.popularArticles.length}</div>
            <div className="metric-indicator positive">
              <span className="metric-indicator-label">Ranked articles</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-top">
              <span className="metric-label">Total Articles</span>
              <div className="metric-icon-box purple">
                <FileText size={17} />
              </div>
            </div>
            <div className="metric-value">{stats.totalPosts.toLocaleString()}</div>
            <div className="metric-indicator positive">
              <span className="metric-indicator-label">Authored blog posts</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-top">
              <span className="metric-label">Standalone Pages</span>
              <div className="metric-icon-box orange">
                <Layers size={17} />
              </div>
            </div>
            <div className="metric-value">{stats.totalPages.toLocaleString()}</div>
            <div className="metric-indicator positive">
              <span className="metric-indicator-label">Landing pages</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="analytics-grid-two">
          {/* Real Hourly Traffic Curve */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h2 className="chart-title">Hourly Visitor Traffic (Today)</h2>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot visitor" />
                  <span>Visitors Today ({stats.visitorsToday})</span>
                </div>
              </div>
            </div>

            <div className="chart-container-inner" style={{ height: "300px" }}>
              {hourlyChartData.length === 0 ? (
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
                  <Eye size={36} style={{ marginBottom: "10px", opacity: 0.5 }} />
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>No traffic recorded today</span>
                  <span style={{ fontSize: "12px", marginTop: "4px" }}>
                    Visits recorded on public page routes (/p/:slug) will plot here in real time.
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyChartData}>
                    <defs>
                      <linearGradient id="realAnalyticsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} allowDecimals={false} />
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
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#realAnalyticsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Real Popular Articles Performance */}
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Top Visited Content</h2>
            </div>

            {stats.popularArticles.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--cms-text-muted)",
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <Activity size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>No article visits logged yet</span>
                <span style={{ fontSize: "12px", marginTop: "4px" }}>
                  When visitors view your articles, top ranking content will appear here.
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                {stats.popularArticles.map((item) => {
                  const pct = totalArticleVisits > 0 ? Math.round((item.visits / totalArticleVisits) * 100) : 100;
                  return (
                    <div key={item._id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ fontWeight: 600, color: "var(--cms-text-main)" }}>
                          {item.title}
                        </span>
                        <span style={{ color: "var(--cms-text-muted)" }}>
                          {item.visits} {item.visits === 1 ? "visit" : "visits"}
                        </span>
                      </div>
                      <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "99px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "var(--cms-primary)",
                            borderRadius: "99px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
