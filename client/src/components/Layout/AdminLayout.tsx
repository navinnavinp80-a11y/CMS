import { useState, type ReactNode } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

interface AdminLayoutProps {
  children: ReactNode;
  contentCount?: number;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
}

export default function AdminLayout({
  children,
  contentCount,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout-wrapper">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        contentCount={contentCount}
      />

      <div
        className={`admin-main-viewport ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <AdminHeader
          onToggleMobileMenu={() => setMobileOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />

        <main className="admin-content-outlet">{children}</main>
      </div>
    </div>
  );
}
