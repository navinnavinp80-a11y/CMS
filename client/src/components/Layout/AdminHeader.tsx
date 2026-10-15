import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, User as UserIcon, Settings, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./AdminHeader.css";

interface AdminHeaderProps {
  onToggleMobileMenu?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
}

export default function AdminHeader({
  onToggleMobileMenu,
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search...",
}: AdminHeaderProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("user");
        setCurrentUser(stored ? JSON.parse(stored) : null);
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = currentUser?.name || (currentUser?.email ? currentUser.email.split("@")[0] : "Admin");
  const userInitials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="admin-header">
      <div className="header-left">
        {onToggleMobileMenu && (
          <button
            type="button"
            className="header-menu-toggle"
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="header-search-wrapper">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            type="button"
            className="header-notification-btn"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          {showNotifications && (
            <div
              className="header-dropdown-menu"
              style={{ width: "260px", right: 0 }}
            >
              <div className="dropdown-user-info" style={{ paddingBottom: "6px" }}>
                <span className="dropdown-name" style={{ fontSize: "13px" }}>Notifications</span>
                <span className="dropdown-email">System alerts & updates</span>
              </div>
              <div className="dropdown-divider" />
              <div style={{ padding: "16px 12px", textAlign: "center", fontSize: "12.5px", color: "var(--cms-text-muted)" }}>
                No unread notifications
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="header-user-wrapper" ref={dropdownRef}>
          <div
            className="header-user-pill"
            onClick={() => setDropdownOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <div className="header-avatar" title={displayName}>
              {userInitials}
            </div>
            <span className="header-user-name">{displayName}</span>
          </div>

          {dropdownOpen && (
            <div className="header-dropdown-menu">
              <div className="dropdown-user-info">
                <span className="dropdown-name">{displayName}</span>
                <span className="dropdown-email">{currentUser?.email || "admin@example.com"}</span>
                <span className="dropdown-role">{currentUser?.role || "Administrator"}</span>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/users");
                }}
              >
                <UserIcon size={15} />
                <span>Team & Roles</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
