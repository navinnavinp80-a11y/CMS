import { useState } from "react";
import {
  Settings as SettingsIcon,
  Globe,
  Shield,
  Save,
  Check,
} from "lucide-react";
import AdminLayout from "../../components/Layout/AdminLayout";
import "./Settings.css";

interface StoredSettings {
  siteName: string;
  siteUrl: string;
  metaDescription: string;
  robotsIndex: string;
  autoSaveDrafts: boolean;
  enableAnalytics: boolean;
}

const DEFAULT_SETTINGS: StoredSettings = {
  siteName: "Headless CMS",
  siteUrl: window.location.origin,
  metaDescription: "Visual page building and headless content management system.",
  robotsIndex: "all",
  autoSaveDrafts: true,
  enableAnalytics: true,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"general" | "seo" | "security">("general");
  const [savedNotice, setSavedNotice] = useState(false);

  const [settings, setSettings] = useState<StoredSettings>(() => {
    try {
      const stored = localStorage.getItem("cms_site_settings");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [currentUser] = useState<{
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem("cms_site_settings", JSON.stringify(settings));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  return (
    <AdminLayout>
      <div className="settings-page-wrapper">
        <div className="settings-header">
          <div className="settings-title-group">
            <h1>System Settings</h1>
            <p>Configure global CMS preferences, meta branding, and local editor options.</p>
          </div>

          <button
            type="button"
            className="cms-btn-primary"
            onClick={() => handleSave()}
          >
            {savedNotice ? <Check size={16} /> : <Save size={16} />}
            <span>{savedNotice ? "Saved Successfully" : "Save Changes"}</span>
          </button>
        </div>

        <div className="settings-container-grid">
          {/* Navigation Sidebar Tabs */}
          <div className="settings-nav-card">
            <button
              type="button"
              className={`settings-tab-btn ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              <SettingsIcon size={17} />
              <span>General Settings</span>
            </button>

            <button
              type="button"
              className={`settings-tab-btn ${activeTab === "seo" ? "active" : ""}`}
              onClick={() => setActiveTab("seo")}
            >
              <Globe size={17} />
              <span>SEO & Meta</span>
            </button>

            <button
              type="button"
              className={`settings-tab-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={17} />
              <span>Preferences</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="settings-content-card">
            {activeTab === "general" && (
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h3 className="settings-section-title">Site Profile</h3>
                  <p className="settings-section-desc">
                    These details identify your website instance across landing pages.
                  </p>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label>Website Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, siteName: e.target.value }))
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Public URL</label>
                    <input
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, siteUrl: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="settings-form-group">
                  <label>Default Description</label>
                  <textarea
                    rows={3}
                    value={settings.metaDescription}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, metaDescription: e.target.value }))
                    }
                  />
                </div>

                {currentUser && (
                  <div style={{ marginTop: "10px", padding: "16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid var(--cms-border-light)" }}>
                    <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--cms-text-main)", marginBottom: "4px" }}>
                      Authenticated Account
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--cms-text-muted)" }}>
                      Logged in as <strong>{currentUser.name}</strong> ({currentUser.email}) • Role: <strong style={{ textTransform: "capitalize" }}>{currentUser.role}</strong>
                    </div>
                  </div>
                )}
              </form>
            )}

            {activeTab === "seo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h3 className="settings-section-title">Search Engine Optimization</h3>
                  <p className="settings-section-desc">
                    Default indexing directives for public content.
                  </p>
                </div>

                <div className="settings-form-group">
                  <label>Robots Indexing</label>
                  <select
                    value={settings.robotsIndex}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, robotsIndex: e.target.value }))
                    }
                  >
                    <option value="all">Index all pages (Recommended)</option>
                    <option value="noindex">Noindex (Staging / Private)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div>
                  <h3 className="settings-section-title">Editor Preferences</h3>
                  <p className="settings-section-desc">
                    Configure visual canvas autosave and telemetry.
                  </p>
                </div>

                <div className="toggle-setting-row">
                  <div className="toggle-info">
                    <h4>Auto-save Drafts</h4>
                    <p>Periodically save drafts in the background while composing articles.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoSaveDrafts}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, autoSaveDrafts: e.target.checked }))
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="toggle-setting-row">
                  <div className="toggle-info">
                    <h4>Telemetry & Visitor Tracking</h4>
                    <p>Record visits to public pages in MongoDB Visit collection for analytics.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.enableAnalytics}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, enableAnalytics: e.target.checked }))
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
