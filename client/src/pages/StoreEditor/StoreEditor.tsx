import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Monitor,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  PanelsTopLeft,
  Settings,
  Eye,
  Globe,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { DEFAULT_THEME, createDefaultSection } from "./types";
import type { StoreSection, StoreTheme } from "./types";
import {
  getStoreById,
  getStores,
  updateStore,
  publishStoreById,
  getStoreConfig,
  saveStoreConfig,
  publishStoreConfig,
} from "../../services/api";
import { StorefrontRenderer } from "./StorefrontRenderer";
import { SectionsListPanel } from "./SectionsListPanel";
import { SectionSettingsPanel } from "./SectionSettingsPanel";
import { ThemeSettingsPanel } from "./ThemeSettingsPanel";
import "./StoreEditor.css";

interface EditorSnapshot {
  sections: StoreSection[];
  theme: StoreTheme;
  storeName: string;
}

export default function StoreEditor() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId?: string }>();

  // Mode and view state
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [sidebarTab, setSidebarTab] = useState<"sections" | "theme">("sections");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Store data state
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(storeId || null);
  const [storeName, setStoreName] = useState<string>("My Store");
  const [slug, setSlug] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sections, setSections] = useState<StoreSection[]>([]);
  const [theme, setTheme] = useState<StoreTheme>(DEFAULT_THEME);

  // Network and saving states
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // History for Undo / Redo
  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoingRedoingRef = useRef<boolean>(false);
  const [, setHistoryRenderTrigger] = useState<number>(0);

  // Push state to history stack
  const pushHistorySnapshot = (newSections: StoreSection[], newTheme: StoreTheme, newStoreName: string) => {
    if (isUndoingRedoingRef.current) return;

    const currentHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    const newSnapshot: EditorSnapshot = {
      sections: JSON.parse(JSON.stringify(newSections)),
      theme: JSON.parse(JSON.stringify(newTheme)),
      storeName: newStoreName,
    };

    // Limit history stack size to 30 states
    if (currentHistory.length >= 30) {
      currentHistory.shift();
    }

    currentHistory.push(newSnapshot);
    historyRef.current = currentHistory;
    historyIndexRef.current = currentHistory.length - 1;
    setHistoryRenderTrigger((prev) => prev + 1);
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoingRedoingRef.current = true;
      historyIndexRef.current -= 1;
      const targetSnapshot = historyRef.current[historyIndexRef.current];
      setSections(JSON.parse(JSON.stringify(targetSnapshot.sections)));
      setTheme(JSON.parse(JSON.stringify(targetSnapshot.theme)));
      setStoreName(targetSnapshot.storeName);
      setHistoryRenderTrigger((prev) => prev + 1);
      setTimeout(() => {
        isUndoingRedoingRef.current = false;
      }, 50);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoingRedoingRef.current = true;
      historyIndexRef.current += 1;
      const targetSnapshot = historyRef.current[historyIndexRef.current];
      setSections(JSON.parse(JSON.stringify(targetSnapshot.sections)));
      setTheme(JSON.parse(JSON.stringify(targetSnapshot.theme)));
      setStoreName(targetSnapshot.storeName);
      setHistoryRenderTrigger((prev) => prev + 1);
      setTimeout(() => {
        isUndoingRedoingRef.current = false;
      }, 50);
    }
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // Load store configuration from backend API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        let data: any = null;

        if (storeId) {
          data = await getStoreById(storeId);
        } else {
          // If no storeId in URL, fetch user's stores and pick the first one
          const storesList = await getStores();
          if (storesList && storesList.length > 0) {
            data = storesList[0];
            setCurrentStoreId(data._id);
          } else {
            // Legacy fallback to getStoreConfig
            data = await getStoreConfig();
          }
        }

        if (data) {
          const resolvedId = data._id || storeId || null;
          setCurrentStoreId(resolvedId);
          if (data._id && !storeId) {
            navigate(`/store-editor/${data._id}`, { replace: true });
          }
          const loadedSections = (data.sections as unknown as StoreSection[]) || [];
          const loadedTheme = (data.theme as unknown as StoreTheme) || DEFAULT_THEME;
          const loadedName = data.storeName || data.name || "My Store";
          const loadedSlug = data.slug || "";

          setStoreName(loadedName);
          setSlug(loadedSlug);
          setStatus(data.status || "draft");
          setSections(loadedSections);
          setTheme(loadedTheme);

          // Initialize history
          historyRef.current = [
            {
              sections: JSON.parse(JSON.stringify(loadedSections)),
              theme: JSON.parse(JSON.stringify(loadedTheme)),
              storeName: loadedName,
            },
          ];
          historyIndexRef.current = 0;
          setHistoryRenderTrigger((prev) => prev + 1);
        }
      } catch (err: any) {
        console.error("Failed to load store config:", err);
        // Fallback default sections if network or auth error
        const initialSections: StoreSection[] = [
          createDefaultSection("announcement"),
          createDefaultSection("header"),
          createDefaultSection("hero"),
          createDefaultSection("featured-products"),
          createDefaultSection("footer"),
        ];
        setSections(initialSections);
        historyRef.current = [
          {
            sections: JSON.parse(JSON.stringify(initialSections)),
            theme: DEFAULT_THEME,
            storeName: "My Store",
          },
        ];
        historyIndexRef.current = 0;
        setHistoryRenderTrigger((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [storeId, navigate]);

  // Section Management Handlers
  const handleAddSection = (newSection: StoreSection) => {
    const updated = [...sections, newSection];
    setSections(updated);
    setSelectedSectionId(newSection.id);
    pushHistorySnapshot(updated, theme, storeName);
  };

  const handleDeleteSection = (sectionId: string) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    setSections(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
    pushHistorySnapshot(updated, theme, storeName);
  };

  const handleUpdateSectionSettings = (
    sectionId: string,
    newSettings: Record<string, any>
  ) => {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, settings: newSettings } : s
    );
    setSections(updated);
    pushHistorySnapshot(updated, theme, storeName);
  };

  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, title: newTitle } : s
    );
    setSections(updated);
    pushHistorySnapshot(updated, theme, storeName);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSections(updated);
    pushHistorySnapshot(updated, theme, storeName);
  };

  const handleMoveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSections(updated);
    pushHistorySnapshot(updated, theme, storeName);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const updated = [...sections];
    const [draggedItem] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, draggedItem);
    setSections(updated);
    pushHistorySnapshot(updated, theme, storeName);
  };

  // Theme change handler
  const handleChangeTheme = (newTheme: StoreTheme) => {
    setTheme(newTheme);
    pushHistorySnapshot(sections, newTheme, storeName);
  };

  // Save Draft to Backend
  const handleSaveDraft = async () => {
    try {
      setSaveStatus("saving");
      setStatusMessage("");

      let updated: any = null;
      if (currentStoreId) {
        updated = await updateStore(currentStoreId, {
          storeName,
          slug: slug || undefined,
          sections,
          theme,
        });
      } else {
        updated = await saveStoreConfig({
          storeName,
          sections,
          theme,
        });
      }

      if (updated) {
        setStatus(updated.status);
        if (updated._id) {
          setCurrentStoreId(updated._id);
          if (!storeId) {
            navigate(`/store-editor/${updated._id}`, { replace: true });
          }
        }
        if (updated.slug) setSlug(updated.slug);
      }
      setSaveStatus("saved");
      setStatusMessage("Store draft saved successfully");
      setTimeout(() => {
        setSaveStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setStatusMessage(err.message || "Failed to save store configuration");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 4000);
    }
  };

  // Publish Store to Public Storefront
  const handlePublish = async () => {
    try {
      setPublishStatus("publishing");
      setStatusMessage("");

      let updated: any = null;
      if (currentStoreId) {
        updated = await publishStoreById(currentStoreId, {
          storeName,
          slug: slug || undefined,
          sections,
          theme,
        });
      } else {
        updated = await publishStoreConfig({
          storeName,
          sections,
          theme,
        });
      }

      if (updated) {
        setStatus("published");
        if (updated._id) {
          setCurrentStoreId(updated._id);
          if (!storeId) {
            navigate(`/store-editor/${updated._id}`, { replace: true });
          }
        }
        if (updated.slug) setSlug(updated.slug);
      }
      const liveSlug = updated?.slug || slug;
      const livePath = liveSlug ? `/store/${liveSlug}` : "/store";
      setPublishStatus("published");
      setStatusMessage(`Store published successfully! Live at ${livePath}`);
      setTimeout(() => {
        setPublishStatus("idle");
        setStatusMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("Publish error:", err);
      setPublishStatus("error");
      setStatusMessage(err.message || "Failed to publish store");
      setTimeout(() => {
        setPublishStatus("idle");
      }, 4000);
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  if (loading) {
    return (
      <div className="storefront-public-loading" style={{ minHeight: "100vh" }}>
        <div className="storefront-spinner" />
        <p>Loading Store Editor...</p>
      </div>
    );
  }

  return (
    <div className="store-editor">
      {/* Top Application Toolbar */}
      <header className="store-editor-toolbar">
        <button
          type="button"
          className="store-editor-icon-button"
          title="Back to Stores"
          onClick={() => navigate("/stores")}
        >
          ←
        </button>

        <div className="store-editor-divider" />

        <div className="store-editor-brand">
          <PanelsTopLeft size={19} />
          <span>Store Editor</span>
        </div>

        <div className="store-editor-store-info">
          <input
            type="text"
            className="store-editor-name-input"
            value={storeName}
            onChange={(e) => {
              setStoreName(e.target.value);
              pushHistorySnapshot(sections, theme, e.target.value);
            }}
            title="Edit store display name"
          />
          {slug && (
            <span className="store-editor-slug-chip" title="Public URL slug">
              /store/{slug}
            </span>
          )}
          <span
            className={`store-editor-status ${
              status === "published" ? "status-published" : "status-draft"
            }`}
          >
            {status === "published" ? "Live • Published" : "Draft"}
          </span>
        </div>

        <div className="store-editor-toolbar-actions">
          {/* View Live Store Button */}
          <a
            href={slug ? `/store/${slug}` : "/store"}
            target="_blank"
            rel="noopener noreferrer"
            className="store-editor-view-store-btn"
            title={`Open Live Public Store in new tab (/store/${slug || ""})`}
          >
            <Globe size={15} />
            <span className="view-btn-text">View Store</span>
            <ExternalLink size={12} />
          </a>

          <div className="store-editor-divider small-divider" />

          {/* Desktop/Mobile Viewport Toggles */}
          <button
            type="button"
            className={`store-editor-icon-button ${
              previewMode === "desktop" ? "active" : ""
            }`}
            title="Desktop preview mode"
            onClick={() => setPreviewMode("desktop")}
          >
            <Monitor size={18} />
          </button>

          <button
            type="button"
            className={`store-editor-icon-button ${
              previewMode === "mobile" ? "active" : ""
            }`}
            title="Mobile preview mode"
            onClick={() => setPreviewMode("mobile")}
          >
            <Smartphone size={18} />
          </button>

          {/* Undo and Redo */}
          <button
            type="button"
            className="store-editor-icon-button"
            title="Undo (Ctrl+Z)"
            disabled={!canUndo}
            onClick={handleUndo}
          >
            <Undo2 size={18} />
          </button>

          <button
            type="button"
            className="store-editor-icon-button"
            title="Redo (Ctrl+Y)"
            disabled={!canRedo}
            onClick={handleRedo}
          >
            <Redo2 size={18} />
          </button>

          {/* Save Draft Action */}
          <button
            type="button"
            className="store-editor-save-button"
            onClick={handleSaveDraft}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? (
              <>
                <span className="btn-spinner" /> Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : saveStatus === "error" ? (
              <>
                <AlertCircle size={16} /> Error
              </>
            ) : (
              <>
                <Save size={16} /> Save Draft
              </>
            )}
          </button>

          {/* Publish Live Action */}
          <button
            type="button"
            className="store-editor-publish-button"
            onClick={handlePublish}
            disabled={publishStatus === "publishing"}
            title="Publish current draft live to storefront at /store"
          >
            {publishStatus === "publishing" ? (
              <>
                <span className="btn-spinner white" /> Publishing...
              </>
            ) : publishStatus === "published" ? (
              <>
                <Check size={16} /> Published!
              </>
            ) : (
              <>
                <Globe size={15} /> Publish
              </>
            )}
          </button>
        </div>
      </header>

      {/* Global Status Notification Banner */}
      {statusMessage && (
        <div
          className={`store-editor-toast ${
            saveStatus === "error" || publishStatus === "error"
              ? "toast-error"
              : "toast-success"
          }`}
        >
          {saveStatus === "error" || publishStatus === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <Check size={16} />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Workspace: Left Sidebar + Center Preview Canvas */}
      <div className="store-editor-workspace">
        <aside className="store-editor-sidebar">
          {/* Sidebar Top Nav Tabs: Sections & Theme Settings */}
          <div className="sidebar-tab-switcher">
            <button
              type="button"
              className={`sidebar-tab-btn ${
                sidebarTab === "sections" ? "active" : ""
              }`}
              onClick={() => {
                setSidebarTab("sections");
              }}
            >
              <PanelsTopLeft size={16} />
              Sections
            </button>

            <button
              type="button"
              className={`sidebar-tab-btn ${
                sidebarTab === "theme" ? "active" : ""
              }`}
              onClick={() => {
                setSidebarTab("theme");
                setSelectedSectionId(null);
              }}
            >
              <Settings size={16} />
              Theme settings
            </button>
          </div>

          {/* Sidebar Content Area */}
          <div className="store-editor-sidebar-content">
            {sidebarTab === "theme" ? (
              <ThemeSettingsPanel
                theme={theme}
                onChangeTheme={handleChangeTheme}
              />
            ) : selectedSection ? (
              <SectionSettingsPanel
                section={selectedSection}
                onUpdateSettings={handleUpdateSectionSettings}
                onUpdateTitle={handleUpdateSectionTitle}
                onDeleteSection={handleDeleteSection}
                onBack={() => setSelectedSectionId(null)}
              />
            ) : (
              <SectionsListPanel
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={(id) => setSelectedSectionId(id)}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onReorder={handleReorder}
              />
            )}
          </div>

          <div className="store-editor-sidebar-note">
            <Eye size={18} />
            <div>
              <strong>Live Canvas Editor</strong>
              <p>
                Click any section on the canvas or sidebar to customize content.
                Changes update in real-time.
              </p>
            </div>
          </div>
        </aside>

        {/* Live Storefront Preview Canvas */}
        <main
          className="store-editor-preview-area"
          onClick={() => setSelectedSectionId(null)}
        >
          <div className="store-editor-preview-heading">
            <div className="preview-heading-left">
              <span>Canvas Preview</span>
              <span className="preview-indicator">
                {previewMode === "desktop" ? "Desktop 100%" : "Mobile View (390px)"}
              </span>
            </div>
            <div className="preview-heading-right">
              <span>Status: <strong>{status.toUpperCase()}</strong></span>
            </div>
          </div>

          <div
            className={`store-editor-canvas-container ${
              previewMode === "mobile" ? "mobile-viewport-container" : ""
            }`}
          >
            {previewMode === "mobile" && (
              <div className="mobile-phone-speaker-notch">
                <span className="notch-speaker" />
              </div>
            )}

            <div
              className={`store-editor-storefront ${
                previewMode === "mobile" ? "mobile-preview" : ""
              }`}
              style={{
                maxWidth:
                  previewMode === "mobile"
                    ? "390px"
                    : theme.contentWidth === "compact"
                    ? "1000px"
                    : theme.contentWidth === "full"
                    ? "1440px"
                    : "1200px",
              }}
            >
              <StorefrontRenderer
                sections={sections}
                theme={theme}
                selectedSectionId={selectedSectionId}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  setSidebarTab("sections");
                }}
                isEditor={true}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
