import { useEffect, useState } from "react";
import {
  UserPlus,
  Users as UsersIcon,
  ShieldCheck,
  UserCheck,
  X,
  Check,
} from "lucide-react";
import { getDashboardStats } from "../../services/api";
import AdminLayout from "../../components/Layout/AdminLayout";
import "./Users.css";

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function Users() {
  const [currentUser, setCurrentUser] = useState<ActiveUser | null>(null);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createdUsers, setCreatedUsers] = useState<ActiveUser[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getDashboardStats();
        if (data.user) {
          setCurrentUser({
            id: data.user.id || "1",
            name: data.user.name || "Administrator",
            email: data.user.email || "",
            role: data.user.role || "admin",
            status: "active",
          });
        }
        if (data.stats && data.stats.totalUsers) {
          setTotalUsersCount(data.stats.totalUsers);
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    try {
      setLoading(true);
      setNotification(null);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register user");
      }

      const createdUser: ActiveUser = {
        id: data.user?.id || Date.now().toString(),
        name: data.user?.name || newName,
        email: data.user?.email || newEmail,
        role: data.user?.role || "editor",
        status: "active",
      };

      setCreatedUsers((prev) => [createdUser, ...prev]);
      setTotalUsersCount((prev) => prev + 1);
      setNotification({
        type: "success",
        message: `User "${newName}" was successfully registered in the database.`,
      });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setShowAddModal(false);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Registration failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const allDisplayUsers = currentUser
    ? [currentUser, ...createdUsers.filter((u) => u.email !== currentUser.email)]
    : createdUsers;

  return (
    <AdminLayout>
      <div className="users-page-wrapper">
        <div className="users-header">
          <div className="users-title-group">
            <h1>User & Team Management</h1>
            <p>Authenticated accounts and registered team members in your CMS database.</p>
          </div>

          <button
            type="button"
            className="cms-btn-primary"
            onClick={() => {
              setNotification(null);
              setShowAddModal(true);
            }}
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </div>

        {notification && (
          <div
            className={`content-error-banner`}
            style={{
              background: notification.type === "success" ? "var(--cms-success-light)" : "var(--cms-danger-light)",
              color: notification.type === "success" ? "var(--cms-success)" : "var(--cms-danger)",
              borderColor: notification.type === "success" ? "#A7F3D0" : "#FECACA",
            }}
          >
            {notification.message}
          </div>
        )}

        {/* Real Metric Cards */}
        <div className="media-metrics-grid">
          <div className="media-metric-card">
            <div className="media-metric-icon blue">
              <UsersIcon size={20} />
            </div>
            <div className="media-metric-info">
              <span className="media-metric-label">Total Registered Users</span>
              <span className="media-metric-val">{totalUsersCount}</span>
            </div>
          </div>

          <div className="media-metric-card">
            <div className="media-metric-icon green">
              <UserCheck size={20} />
            </div>
            <div className="media-metric-info">
              <span className="media-metric-label">Active Session</span>
              <span className="media-metric-val">{allDisplayUsers.length}</span>
            </div>
          </div>

          <div className="media-metric-card">
            <div className="media-metric-icon purple">
              <ShieldCheck size={20} />
            </div>
            <div className="media-metric-info">
              <span className="media-metric-label">Account Role</span>
              <span className="media-metric-val" style={{ textTransform: "capitalize", fontSize: "18px" }}>
                {currentUser?.role || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="content-table-card">
          <table className="content-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>User Name & Email</th>
                <th style={{ width: "25%" }}>Role</th>
                <th style={{ width: "25%" }}>Status</th>
                <th style={{ width: "10%", textAlign: "right" }}>Account ID</th>
              </tr>
            </thead>
            <tbody>
              {allDisplayUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="content-title-cell">
                      <div className="user-avatar-cell">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="content-title-info">
                        <strong className="content-item-name">{user.name}</strong>
                        <span className="content-item-slug">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`user-role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge published">
                      {user.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", color: "var(--cms-text-muted)", fontSize: "12px" }}>
                    {user.id ? user.id.slice(-6) : "Active"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Real Register User Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Register New User</h2>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegisterUser}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Initial Password</label>
                    <input
                      type="password"
                      placeholder="Enter secure password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="cms-btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="cms-btn-primary" disabled={loading}>
                    <Check size={16} />
                    <span>{loading ? "Registering..." : "Create Account"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
