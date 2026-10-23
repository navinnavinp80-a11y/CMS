import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  Globe,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";
import AdminLayout from "../../components/Layout/AdminLayout";
import { createWebsite } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { PAGE_TEMPLATES } from "../../components/PageBuilder/templates";
import "./Content.css";

const normalizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  type: "post" | "page";
  status: "draft" | "published";
  author: any;
  createdAt: string;
  website?: any;
  websiteId?: string;
}

interface WebsiteItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published";
  homePage?: any;
  owner?: any;
  createdAt?: string;
  updatedAt?: string;
}

export default function Content() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "post" | "page" | "draft" | "published">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPlacement, setMenuPlacement] = useState<"down" | "up">("down");

  // Website creation modal state
  const { isPremium } = useAuth();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("minimal-clean");
  const [showWebsiteModal, setShowWebsiteModal] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [newWebsiteSlug, setNewWebsiteSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [creatingWebsite, setCreatingWebsite] = useState(false);
  const [websiteModalError, setWebsiteModalError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState<{
    message: string;
    currentCount?: number;
    maxAllowed?: number;
  } | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    if (statusParam === "draft") {
      setActiveTab("draft");
    } else if (statusParam === "published") {
      setActiveTab("published");
    } else if (typeParam === "page") {
      setActiveTab("page");
    } else if (typeParam === "post") {
      setActiveTab("post");
    } else {
      setActiveTab("all");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [contentRes, webRes] = await Promise.all([
        fetch("http://localhost:5000/api/content", { headers }),
        fetch("http://localhost:5000/api/websites", { headers }).catch(() => null),
      ]);

      const data = await contentRes.json();
      if (!contentRes.ok) {
        if (contentRes.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
        throw new Error(data.message || "Failed to fetch content");
      }

      setContents(data.contents || data);

      if (webRes && webRes.ok) {
        const webData = await webRes.json();
        setWebsites(
          Array.isArray(webData.websites)
            ? webData.websites
            : webData.website
              ? [webData.website]
              : []
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch contents:", err);
      setError(err instanceof Error ? err.message : "Failed to load contents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    setOpenMenuId(null);
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;

    try {
      setError("");
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const targetItem = displayItems.find((item) => item._id === id);
      if (targetItem?.websiteId) {
        await fetch(`http://localhost:5000/api/websites/${targetItem.websiteId}`, {
          method: "DELETE",
          headers,
        }).catch(() => null);
        setWebsites((prev) => prev.filter((w) => w._id !== targetItem.websiteId));
      }

      const response = await fetch(`http://localhost:5000/api/content/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();
      if (!response.ok && !targetItem?.websiteId) {
        throw new Error(data.message || "Failed to delete content");
      }

      setContents((prev) => prev.filter((item) => item._id !== id));
      void fetchContents();
    } catch (err: any) {
      console.error("Delete content error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete content");
    }
  };

  const handleOpenWebsiteModal = () => {
    setNewWebsiteName("");
    setNewWebsiteSlug("");
    setSelectedTemplateId("minimal-clean");
    setSlugManuallyEdited(false);
    setWebsiteModalError("");
    setUpgradeRequired(null);
    setShowWebsiteModal(true);
  };

  const handleCloseWebsiteModal = () => {
    if (creatingWebsite) return;
    setShowWebsiteModal(false);
    setWebsiteModalError("");
    setUpgradeRequired(null);
  };

  const handleWebsiteNameChange = (val: string) => {
    setNewWebsiteName(val);
    if (!slugManuallyEdited) {
      setNewWebsiteSlug(normalizeSlug(val));
    }
  };

  const handleWebsiteSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setNewWebsiteSlug(normalizeSlug(val));
  };

  const handleCreateWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newWebsiteName.trim();
    const cleanSlug = normalizeSlug(newWebsiteSlug || trimmedName);

    if (!trimmedName) {
      setWebsiteModalError("Website name is required.");
      return;
    }

    const chosenTemplate = PAGE_TEMPLATES.find(
      (t) => t.id === selectedTemplateId || t.legacyId === selectedTemplateId
    );
    if (chosenTemplate?.plan === "premium" && !isPremium) {
      setWebsiteModalError(`"${chosenTemplate.name}" is exclusive to Premium subscribers. Upgrade your account or select a Free template.`);
      return;
    }

    try {
      setCreatingWebsite(true);
      setWebsiteModalError("");
      setUpgradeRequired(null);

      const createdSite = await createWebsite({
        name: trimmedName,
        slug: cleanSlug,
        templateId: selectedTemplateId,
      });

      setShowWebsiteModal(false);
      setNewWebsiteName("");
      setNewWebsiteSlug("");
      setSelectedTemplateId("minimal-clean");
      setSlugManuallyEdited(false);

      await fetchContents();

      const homePageId =
        typeof createdSite.homePage === "object"
          ? createdSite.homePage?._id
          : createdSite.homePage;

      if (homePageId) {
        navigate(`/content/edit-page/${homePageId}`);
      }
    } catch (err: any) {
      console.error("Create website error:", err);
      if (err.status === 403 || err.limitReached) {
        setUpgradeRequired({
          message:
            err.message ||
            "Free plan allows only 2 websites. Upgrade to Premium to create more websites.",
          currentCount: err.currentCount,
          maxAllowed: err.maxAllowed,
        });
      } else {
        setWebsiteModalError(err.message || "Failed to create website");
      }
    } finally {
      setCreatingWebsite(false);
    }
  };

  // Group pages under their respective website so Home, About, and Contact are not listed as individual rows,
  // while ensuring multiple websites are properly listed.
  const displayItems = useMemo(() => {
    const posts = contents.filter((item) => item.type === "post");
    const pages = contents.filter((item) => item.type === "page");

    const groupedPageIds = new Set<string>();
    const websiteEntries: ContentItem[] = [];

    // 1. Process explicit Website documents from /api/websites
    if (websites.length > 0) {
      for (const web of websites) {
        // Find pages belonging to this website
        const sitePages = pages.filter((p) => {
          const pSiteId = typeof p.website === "object" ? p.website?._id : p.website;
          return pSiteId && String(pSiteId) === String(web._id);
        });

        sitePages.forEach((p) => groupedPageIds.add(p._id));

        const homePageDoc =
          sitePages.find(
            (p) =>
              p.slug === "home" ||
              p.title.toLowerCase() === "home" ||
              (web.homePage && (p._id === web.homePage || p._id === (web.homePage as any)._id))
          ) ||
          (web.homePage && typeof web.homePage === "object" ? (web.homePage as any) : null) ||
          sitePages[0];

        websiteEntries.push({
          _id: homePageDoc ? homePageDoc._id : web._id,
          title: web.name || "Untitled Website",
          slug: web.slug || (homePageDoc ? homePageDoc.slug : "home"),
          content: homePageDoc?.content || "[]",
          type: "page",
          status:
            web.status === "published" || sitePages.some((p) => p.status === "published")
              ? "published"
              : "draft",
          author: web.owner || homePageDoc?.author,
          createdAt: web.createdAt || homePageDoc?.createdAt || new Date().toISOString(),
          websiteId: web._id,
        });
      }
    }

    // 2. Process remaining pages that are not linked to an explicit Website document
    const unassignedPages = pages.filter((p) => !groupedPageIds.has(p._id));

    if (unassignedPages.length > 0) {
      // Group default pages: Home, About, Contact
      const defaultPages = unassignedPages.filter((p) => {
        const titleLower = (p.title || "").toLowerCase();
        const slugLower = (p.slug || "").toLowerCase();
        return (
          slugLower === "home" ||
          slugLower === "index" ||
          titleLower === "home" ||
          titleLower === "about" ||
          titleLower === "contact" ||
          slugLower === "about" ||
          slugLower === "contact" ||
          slugLower.startsWith("page-")
        );
      });

      // Other distinct pages/websites (e.g. "Sample", or any custom website created by the user)
      const otherPages = unassignedPages.filter((p) => !defaultPages.includes(p));

      // Only create "My Website" for default pages if we didn't already have one from websites
      const alreadyHasDefault = websiteEntries.some(
        (w) =>
          w.title.toLowerCase() === "my website" ||
          w.slug === "home" ||
          w.slug === "my-website"
      );

      if (defaultPages.length > 0 && !alreadyHasDefault) {
        const homePage =
          defaultPages.find(
            (p) => p.slug === "home" || p.title.toLowerCase() === "home"
          ) || defaultPages[0];

        websiteEntries.unshift({
          _id: homePage._id,
          title: "My Website",
          slug: "home",
          content: homePage.content,
          type: "page",
          status: defaultPages.some((p) => p.status === "published") ? "published" : "draft",
          author: homePage.author,
          createdAt: homePage.createdAt,
        });
      }

      // Add each distinct other page/website as its own entry in the list
      for (const page of otherPages) {
        websiteEntries.push({
          _id: page._id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          type: "page",
          status: page.status,
          author: page.author,
          createdAt: page.createdAt,
          website: page.website,
        });
      }
    }

    return [...websiteEntries, ...posts];
  }, [contents, websites]);

  const filteredContents = displayItems.filter((item) => {
    if (activeTab === "draft" && item.status !== "draft") return false;
    if (activeTab === "published" && item.status !== "published") return false;
    if (activeTab === "page" && item.type !== "page") return false;
    if (activeTab === "post" && item.type !== "post") return false;

    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.slug && item.slug.toLowerCase().includes(query))
    );
  });

  const handleToggleMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
    index: number
  ) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const isNearBottom =
        filteredContents.length > 1 && index >= filteredContents.length - 1;
      const shouldOpenUp = isNearBottom || (spaceBelow < 180 && rect.top > 180);
      setMenuPlacement(shouldOpenUp ? "up" : "down");
      setOpenMenuId(id);
    }
  };

  return (
    <AdminLayout contentCount={displayItems.length}>
      <div className="content-page-wrapper">
        {/* Header */}
        <div className="content-page-header">
          <div className="content-header-title-group">
            <h1>Content Library</h1>
            <p>Create, manage, and publish posts and landing pages across your CMS.</p>
          </div>

          <div className="content-header-actions">
            <button
              type="button"
              className="cms-btn-primary"
              onClick={handleOpenWebsiteModal}
            >
              <Plus size={16} />
              <span>Create Website</span>
            </button>

            <button
              type="button"
              className="cms-btn-secondary"
              onClick={() => navigate("/content/create-page")}
            >
              <Globe size={16} />
              <span>Create Page</span>
            </button>

            <button
              type="button"
              className="cms-btn-secondary"
              onClick={() => navigate("/content/create")}
            >
              <FileText size={16} />
              <span>Create Blog</span>
            </button>
          </div>
        </div>

        {error && <div className="content-error-banner">{error}</div>}

        {/* Filters Toolbar */}
        <div className="content-toolbar-card">
          <div className="content-filter-tabs">
            <button
              type="button"
              className={`filter-tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All ({displayItems.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeTab === "post" ? "active" : ""}`}
              onClick={() => setActiveTab("post")}
            >
              Posts ({displayItems.filter((c) => c.type === "post").length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeTab === "page" ? "active" : ""}`}
              onClick={() => setActiveTab("page")}
            >
              Pages ({displayItems.filter((c) => c.type === "page").length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeTab === "published" ? "active" : ""}`}
              onClick={() => setActiveTab("published")}
            >
              Published ({displayItems.filter((c) => c.status === "published").length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${activeTab === "draft" ? "active" : ""}`}
              onClick={() => setActiveTab("draft")}
            >
              Drafts ({displayItems.filter((c) => c.status === "draft").length})
            </button>
          </div>

          <div className="content-search-input-box">
            <Search size={15} className="content-search-icon" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="content-table-card">
          {loading ? (
            <div className="content-empty-state">
              <div className="empty-icon-box">
                <FileText size={28} />
              </div>
              <h3>Loading content...</h3>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="content-empty-state">
              <div className="empty-icon-box">
                <FileText size={28} />
              </div>
              <h3>No content found</h3>
              <p>
                {searchTerm
                  ? `No posts or pages matched "${searchTerm}". Try a different keyword.`
                  : "Get started by creating your first blog article or landing page."}
              </p>
              <button
                type="button"
                className="cms-btn-primary"
                onClick={() => navigate("/content/create")}
              >
                <Plus size={16} />
                <span>Create New Post</span>
              </button>
            </div>
          ) : (
            <table className="content-table">
              <thead>
                <tr>
                  <th style={{ width: "45%" }}>Title & Slug</th>
                  <th style={{ width: "15%" }}>Type</th>
                  <th style={{ width: "15%" }}>Status</th>
                  <th style={{ width: "15%" }}>Created</th>
                  <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.map((item, index) => {
                  const isMenuOpen = openMenuId === item._id;
                  return (
                    <tr key={item._id} className={isMenuOpen ? "menu-open" : ""}>
                      <td>
                        <div className="content-title-cell">
                          <div className={`content-type-icon ${item.type}`}>
                            {item.type === "page" ? (
                              <Globe size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </div>
                          <div className="content-title-info">
                            <span
                              className="content-item-name"
                              onClick={() =>
                                item.type === "page"
                                  ? navigate(`/content/edit-page/${item._id}`)
                                  : navigate(`/content/edit/${item._id}`)
                              }
                            >
                              {item.title}
                            </span>
                            <span className="content-item-slug">/{item.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`type-pill ${item.type}`}>
                          {item.type === "page" ? "Page" : "Post"}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className={`action-cell ${isMenuOpen ? "menu-open" : ""}`}>
                        <button
                          type="button"
                          className={`action-menu-trigger ${isMenuOpen ? "active" : ""}`}
                          onClick={(e) => handleToggleMenu(e, item._id, index)}
                          aria-label="Actions"
                          aria-expanded={isMenuOpen}
                          aria-haspopup="true"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className={`action-popover-menu ${menuPlacement === "up" ? "open-up" : "open-down"
                              }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="action-menu-item"
                              onClick={() => {
                                setOpenMenuId(null);
                                if (item.type === "page") {
                                  navigate(`/content/edit-page/${item._id}`);
                                } else {
                                  navigate(`/content/edit/${item._id}`);
                                }
                              }}
                            >
                              <Pencil size={14} />
                              <span>Edit</span>
                            </button>

                            {item.type === "page" && (
                              <button
                                type="button"
                                className="action-menu-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  const pageUrl = item.slug === "home" || item.slug === "index" ? "/home" : `/${item.slug}`;
                                  window.open(pageUrl, "_blank");
                                }}
                              >
                                <ExternalLink size={14} />
                                <span>View Public</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="action-menu-item delete"
                              onClick={() => handleDelete(item._id, item.title)}
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Website Creation Modal */}
      {showWebsiteModal && (
        <div className="content-modal-overlay" onClick={handleCloseWebsiteModal}>
          <div className="content-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="content-modal-header">
              <div className="content-modal-title-group">
                <div className="content-modal-icon-badge">
                  <Globe size={18} />
                </div>
                <div>
                  <h2>Create New Website</h2>
                  <p>Launch an independent website with its own pages and navigation.</p>
                </div>
              </div>
              <button
                type="button"
                className="content-modal-close-btn"
                onClick={handleCloseWebsiteModal}
                disabled={creatingWebsite}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {upgradeRequired ? (
              <div className="content-modal-body">
                <div className="content-premium-alert">
                  <div className="content-premium-alert-header">
                    <AlertCircle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <h3 className="content-premium-alert-title">Free Plan Limit Reached</h3>
                      <p className="content-premium-alert-desc">{upgradeRequired.message}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    type="button"
                    className="cms-btn-primary"
                    onClick={handleCloseWebsiteModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateWebsiteSubmit}>
                <div className="content-modal-body">
                  {websiteModalError && (
                    <div
                      style={{
                        padding: "10px 14px",
                        background: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "#DC2626",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{websiteModalError}</span>
                    </div>
                  )}

                  <div className="content-modal-form-group">
                    <label>
                      Website Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="content-modal-form-input"
                      placeholder="e.g. My Portfolio"
                      value={newWebsiteName}
                      onChange={(e) => handleWebsiteNameChange(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="content-modal-form-group">
                    <label>
                      URL Slug <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="content-modal-form-input"
                      placeholder="e.g. my-portfolio"
                      value={newWebsiteSlug}
                      onChange={(e) => handleWebsiteSlugChange(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: "12px", color: "var(--cms-text-muted)" }}>
                      The slug determines the root path for this website instance.
                    </span>
                  </div>

                  <div className="content-modal-form-group">
                    <label>
                      Starting Template <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", marginTop: "6px" }}>
                      {PAGE_TEMPLATES.map((t) => {
                        const isLocked = t.plan === "premium" && !isPremium;
                        const isSelected = selectedTemplateId === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              if (isLocked) {
                                setWebsiteModalError(`"${t.name}" is a Premium template. Upgrade to unlock this design.`);
                              } else {
                                setSelectedTemplateId(t.id);
                                setWebsiteModalError("");
                              }
                            }}
                            style={{
                              border: isSelected ? "2px solid #2563EB" : "1px solid #E2E8F0",
                              background: isSelected ? "#EFF6FF" : isLocked ? "#F8FAFC" : "#FFFFFF",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              cursor: isLocked ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <input
                                type="radio"
                                name="websiteTemplate"
                                checked={isSelected}
                                onChange={() => {
                                  if (!isLocked) {
                                    setSelectedTemplateId(t.id);
                                    setWebsiteModalError("");
                                  }
                                }}
                                disabled={isLocked}
                              />
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <strong style={{ fontSize: "13px", color: isLocked ? "#64748B" : "#0F172A" }}>
                                    {t.name}
                                  </strong>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 700,
                                      padding: "2px 7px",
                                      borderRadius: "10px",
                                      background: t.plan === "premium" ? "linear-gradient(135deg, #7C3AED, #4F46E5)" : "#ECFDF5",
                                      color: t.plan === "premium" ? "#FFFFFF" : "#059669",
                                    }}
                                  >
                                    {t.plan === "premium" ? "👑 Premium" : "Free"}
                                  </span>
                                </div>
                                <span style={{ fontSize: "11px", color: "#64748B", display: "block", marginTop: "2px" }}>
                                  {t.description}
                                </span>
                              </div>
                            </div>
                            {isLocked && (
                              <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 600, flexShrink: 0 }}>
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="content-modal-footer">
                  <button
                    type="button"
                    className="cms-btn-secondary"
                    onClick={handleCloseWebsiteModal}
                    disabled={creatingWebsite}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cms-btn-primary"
                    disabled={creatingWebsite || !newWebsiteName.trim()}
                  >
                    {creatingWebsite ? (
                      <span>Creating...</span>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Create & Open Editor</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}