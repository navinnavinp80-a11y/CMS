import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Files,
  FilePlus,
  FileClock,
  Globe,
  Image,
  Tags,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Layers,
  Info,
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Notice toast for features identified for future implementation
  const [notice, setNotice] = useState<string | null>(null);

  // Auto-expand Contents submenu when on a content-related route
  const isContentRoute = location.pathname.startsWith("/content");
  const [contentsExpanded, setContentsExpanded] = useState<boolean>(() => isContentRoute);

  useEffect(() => {
    if (isContentRoute) {
      setContentsExpanded(true);
    }
  }, [isContentRoute]);

  // Auto-dismiss notice toast
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => {
        setNotice(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const handleNavigate = (route?: string, isImplemented: boolean = true, label: string = "") => {
    if (!isImplemented || !route) {
      setNotice(`"${label}" is identified for future implementation.`);
      return;
    }

    navigate(route);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  const isRouteActive = (route?: string, exactSearch?: string): boolean => {
    if (!route) return false;

    if (exactSearch) {
      return location.pathname === route && location.search.includes(exactSearch);
    }

    if (route === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    if (route === "/media") {
      return location.pathname === "/media";
    }

    if (route === "/content") {
      // "All Contents" is active when on /content without specific search filters
      return (
        location.pathname === "/content" &&
        !location.search.includes("status=draft") &&
        !location.search.includes("type=page")
      );
    }

    if (route === "/content/create") {
      return location.pathname === "/content/create";
    }

    return location.pathname === route;
  };

  const isPagesActive =
    (location.pathname === "/content" && location.search.includes("type=page")) ||
    location.pathname === "/content/create-page" ||
    location.pathname.startsWith("/content/edit-page");

  const isDraftsActive =
    location.pathname === "/content" && location.search.includes("status=draft");

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Notice Toast for unbuilt features */}
      {notice && (
        <div className="sidebar-notice-toast" role="status" aria-live="polite">
          <Info size={16} className="notice-icon" />
          <div className="notice-content">
            <span className="notice-title">Feature Roadmap</span>
            <span className="notice-desc">{notice}</span>
          </div>
          <button
            type="button"
            className="notice-close"
            onClick={() => setNotice(null)}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`nexus-sidebar ${collapsed ? "collapsed" : "expanded"} ${
          mobileOpen ? "mobile-open" : ""
        }`}
        aria-label="Admin Navigation"
      >
        {/* Branding Header */}
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => handleNavigate("/dashboard", true, "Dashboard")}
            role="button"
            tabIndex={0}
            title="Nexus CMS Home"
          >
            <div className="brand-logo-container">
              <Layers size={20} className="brand-logo-icon" />
            </div>

            {!collapsed && (
              <div className="brand-text-block">
                <span className="brand-title">Nexus CMS</span>
                <span className="brand-subtitle">Content Management</span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            className="sidebar-toggle-btn desktop-only"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={onCloseMobile}
            aria-label="Close sidebar drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="sidebar-nav-container">
          {/* SECTION: MAIN MENU */}
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">MAIN MENU</span>}

            {/* 1. Dashboard */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className={`nav-item ${isRouteActive("/dashboard") ? "active" : ""}`}
                onClick={() => handleNavigate("/dashboard", true, "Dashboard")}
                aria-current={isRouteActive("/dashboard") ? "page" : undefined}
              >
                <div className="nav-icon-box">
                  <LayoutDashboard size={18} />
                </div>
                {!collapsed && <span className="nav-label">Dashboard</span>}
              </button>
              {collapsed && <div className="collapsed-tooltip">Dashboard</div>}
            </div>

            {/* 2. Contents (Expandable Submenu) */}
            <div className="nav-item-wrapper submenu-wrapper">
              <button
                type="button"
                className={`nav-item has-submenu ${isContentRoute ? "parent-active" : ""}`}
                onClick={() => {
                  if (collapsed) {
                    onToggleCollapse();
                    setContentsExpanded(true);
                  } else {
                    setContentsExpanded(!contentsExpanded);
                  }
                }}
                aria-expanded={contentsExpanded}
              >
                <div className="nav-icon-box">
                  <FileText size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-label">Contents</span>
                    <ChevronDown
                      size={16}
                      className={`submenu-arrow ${contentsExpanded ? "rotated" : ""}`}
                    />
                  </>
                )}
              </button>
              {collapsed && <div className="collapsed-tooltip">Contents</div>}

              {/* Contents Submenu Items */}
              {(!collapsed && contentsExpanded) && (
                <div className="submenu-list">
                  {/* All Contents */}
                  <button
                    type="button"
                    className={`submenu-item ${
                      isRouteActive("/content") ? "active" : ""
                    }`}
                    onClick={() => handleNavigate("/content", true, "All Contents")}
                    aria-current={isRouteActive("/content") ? "page" : undefined}
                  >
                    <Files size={16} className="submenu-icon" />
                    <span>All Contents</span>
                  </button>

                  {/* Create Content */}
                  <button
                    type="button"
                    className={`submenu-item ${
                      isRouteActive("/content/create") ? "active" : ""
                    }`}
                    onClick={() =>
                      handleNavigate("/content/create", true, "Create Content")
                    }
                    aria-current={isRouteActive("/content/create") ? "page" : undefined}
                  >
                    <FilePlus size={16} className="submenu-icon" />
                    <span>Create Content</span>
                  </button>

                  {/* Drafts */}
                  <button
                    type="button"
                    className={`submenu-item ${isDraftsActive ? "active" : ""}`}
                    onClick={() =>
                      handleNavigate("/content?status=draft", true, "Drafts")
                    }
                    aria-current={isDraftsActive ? "page" : undefined}
                  >
                    <FileClock size={16} className="submenu-icon" />
                    <span>Drafts</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Pages */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className={`nav-item ${isPagesActive ? "active" : ""}`}
                onClick={() => handleNavigate("/content?type=page", true, "Pages")}
                aria-current={isPagesActive ? "page" : undefined}
              >
                <div className="nav-icon-box">
                  <Globe size={18} />
                </div>
                {!collapsed && <span className="nav-label">Pages</span>}
              </button>
              {collapsed && <div className="collapsed-tooltip">Pages</div>}
            </div>

            {/* 4. Media Library */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className={`nav-item ${isRouteActive("/media") ? "active" : ""}`}
                onClick={() => handleNavigate("/media", true, "Media Library")}
                aria-current={isRouteActive("/media") ? "page" : undefined}
              >
                <div className="nav-icon-box">
                  <Image size={18} />
                </div>
                {!collapsed && <span className="nav-label">Media Library</span>}
              </button>
              {collapsed && <div className="collapsed-tooltip">Media Library</div>}
            </div>

            {/* 5. Categories & Tags (Identified for future implementation) */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className="nav-item unimplemented"
                onClick={() =>
                  handleNavigate(undefined, false, "Categories & Tags")
                }
              >
                <div className="nav-icon-box">
                  <Tags size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-label">Categories & Tags</span>
                    <span className="unimplemented-badge">Planned</span>
                  </>
                )}
              </button>
              {collapsed && (
                <div className="collapsed-tooltip">
                  Categories & Tags <span className="tooltip-badge">Planned</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION: MANAGEMENT */}
          <div className="nav-section">
            {!collapsed && <span className="nav-section-title">MANAGEMENT</span>}

            {/* 6. Users (Identified for future implementation) */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className="nav-item unimplemented"
                onClick={() => handleNavigate(undefined, false, "Users")}
              >
                <div className="nav-icon-box">
                  <Users size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-label">Users</span>
                    <span className="unimplemented-badge">Planned</span>
                  </>
                )}
              </button>
              {collapsed && (
                <div className="collapsed-tooltip">
                  Users <span className="tooltip-badge">Planned</span>
                </div>
              )}
            </div>

            {/* 7. Analytics (Identified for future implementation) */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className="nav-item unimplemented"
                onClick={() => handleNavigate(undefined, false, "Analytics")}
              >
                <div className="nav-icon-box">
                  <BarChart3 size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-label">Analytics</span>
                    <span className="unimplemented-badge">Planned</span>
                  </>
                )}
              </button>
              {collapsed && (
                <div className="collapsed-tooltip">
                  Analytics <span className="tooltip-badge">Planned</span>
                </div>
              )}
            </div>

            {/* 8. Settings (Identified for future implementation) */}
            <div className="nav-item-wrapper">
              <button
                type="button"
                className="nav-item unimplemented"
                onClick={() => handleNavigate(undefined, false, "Settings")}
              >
                <div className="nav-icon-box">
                  <Settings size={18} />
                </div>
                {!collapsed && (
                  <>
                    <span className="nav-label">Settings</span>
                    <span className="unimplemented-badge">Planned</span>
                  </>
                )}
              </button>
              {collapsed && (
                <div className="collapsed-tooltip">
                  Settings <span className="tooltip-badge">Planned</span>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Status */}
        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="sidebar-footer-card">
              <div className="footer-status-dot" />
              <div className="footer-status-text">
                <span className="status-title">System Status</span>
                <span className="status-sub">All Services Online</span>
              </div>
            </div>
          ) : (
            <div
              className="collapsed-status-indicator"
              title="System Online"
            >
              <div className="footer-status-dot" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
