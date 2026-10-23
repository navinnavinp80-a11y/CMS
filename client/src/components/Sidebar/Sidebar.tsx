import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  Layers,
  ShoppingBag,
} from "lucide-react";
import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  contentCount?: number;
}

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  contentCount,
}: SidebarProps) {
  const { isPremium } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [internalCount, setInternalCount] = useState<number>(contentCount ?? 0);

  useEffect(() => {
    if (contentCount !== undefined) {
      setInternalCount(contentCount);
      return;
    }

    // Fetch real content count dynamically from API
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/content", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.contents || data;
          if (Array.isArray(list)) {
            setInternalCount(list.length);
          }
        }
      } catch {
        setInternalCount(0);
      }
    };
    fetchCount();
  }, [contentCount]);

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Content",
      path: "/content",
      icon: FileText,
      badge: internalCount,
    },
    {
      label: "Stores",
      path: "/stores",
      icon: ShoppingBag,
    },
    {
      label: "Media",
      path: "/media",
      icon: ImageIcon,
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const isActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`cms-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""
          }`}
        aria-label="CMS Navigation"
      >
        {/* Brand */}
        <div className="sidebar-brand-area">
          <div
            className="sidebar-brand-link"
            onClick={() => handleNavigate("/dashboard")}
            role="button"
            tabIndex={0}
          >
            <div className="brand-badge">
              <Layers size={20} />
            </div>
            {!collapsed && <span className="brand-title-text">CMS</span>}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                onClick={() => handleNavigate(item.path)}
                title={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
              >
                <div className="nav-icon">
                  <Icon size={19} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-text">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Upgrade / Plan Status Card */}
        {!collapsed && (
          <div className="sidebar-footer-container">
            <div
              className={`upgrade-plan-card ${isPremium ? "upgrade-plan-card-premium" : ""}`}
              onClick={() => handleNavigate("/premium")}
              role="button"
              tabIndex={0}
            >
              <div className="upgrade-icon-box">
                <Sparkles size={18} />
              </div>
              <div className="upgrade-text-box">
                <span className="upgrade-title">
                  {isPremium ? "✦ Premium Active" : "Upgrade Plan"}
                </span>
                <span className="upgrade-subtitle">
                  {isPremium ? "Full template access" : "Get unlimited access"}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
