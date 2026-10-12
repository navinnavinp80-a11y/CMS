import React, { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Globe,
  Settings,
  Info,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import "./PageSettingsModal.css";

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

interface PageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  status: "draft" | "published";
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  isSlugUserModified: boolean;
  onUpdateTitle: (title: string) => void;
  onUpdateSlug: (slug: string, isManual?: boolean) => void;
  onUpdateStatus: (status: "draft" | "published") => void;
  onUpdateFeaturedImage: (url: string) => void;
  onUpdateMetaTitle: (metaTitle: string) => void;
  onUpdateMetaDescription: (metaDescription: string) => void;
  onOpenMediaLibrary: () => void;
}

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isOpen,
  onClose,
  title,
  slug,
  status,
  featuredImage,
  metaTitle,
  metaDescription,
  isSlugUserModified,
  onUpdateTitle,
  onUpdateSlug,
  onUpdateStatus,
  onUpdateFeaturedImage,
  onUpdateMetaTitle,
  onUpdateMetaDescription,
  onOpenMediaLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    onUpdateTitle(newTitle);
    if (!isSlugUserModified) {
      onUpdateSlug(generateSlug(newTitle), false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const normalized = rawVal
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
    onUpdateSlug(normalized, true);
  };

  const handleSlugBlur = () => {
    if (slug) {
      onUpdateSlug(generateSlug(slug), true);
    }
  };

  // Character counter indicators
  const metaTitleLen = metaTitle.length;
  const metaDescLen = metaDescription.length;

  const metaTitleColor =
    metaTitleLen === 0
      ? "#64748b"
      : metaTitleLen >= 50 && metaTitleLen <= 60
      ? "#16a34a"
      : metaTitleLen > 60
      ? "#eab308"
      : "#64748b";

  const metaDescColor =
    metaDescLen === 0
      ? "#64748b"
      : metaDescLen >= 150 && metaDescLen <= 160
      ? "#16a34a"
      : metaDescLen > 160
      ? "#eab308"
      : "#64748b";

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div
        className="settings-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="settings-modal-header">
          <div className="header-title">
            <Settings size={20} className="header-icon" />
            <div>
              <h2>Page Settings & SEO</h2>
              <p>Configure page metadata, URL slug, and search optimization</p>
            </div>
          </div>
          <button
            className="settings-modal-close"
            onClick={onClose}
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="settings-modal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Globe size={15} />
            <span>General Settings</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "seo" ? "active" : ""}`}
            onClick={() => setActiveTab("seo")}
          >
            <Settings size={15} />
            <span>SEO & Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="settings-modal-body">
          {activeTab === "general" && (
            <div className="settings-tab-content">
              {/* Page Title */}
              <div className="form-group">
                <label htmlFor="settings-page-title">
                  Page Title <span className="required">*</span>
                </label>
                <input
                  id="settings-page-title"
                  type="text"
                  placeholder="e.g. About Our Company"
                  value={title}
                  onChange={handleTitleChange}
                />
                <span className="field-hint">
                  The primary title used across navigation and editor.
                </span>
              </div>

              {/* URL Slug */}
              <div className="form-group">
                <label htmlFor="settings-page-slug">
                  URL Slug <span className="required">*</span>
                </label>
                <div className="slug-input-wrapper">
                  <span className="slug-prefix">http://localhost:5000/</span>
                  <input
                    id="settings-page-slug"
                    type="text"
                    placeholder="about-our-company"
                    value={slug}
                    onChange={handleSlugChange}
                    onBlur={handleSlugBlur}
                  />
                </div>
                {!slug.trim() && (
                  <span className="field-error">
                    Slug cannot be empty. A valid slug will be auto-generated on save if left empty.
                  </span>
                )}
                {slug.trim() && (
                  <span className="field-hint">
                    Unique URL path for this page. Only lowercase letters, numbers, and hyphens.
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Publishing Status</label>
                <div className="status-selector">
                  <label
                    className={`status-option ${
                      status === "draft" ? "selected draft" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="page-status"
                      value="draft"
                      checked={status === "draft"}
                      onChange={() => onUpdateStatus("draft")}
                    />
                    <span className="status-dot draft"></span>
                    <div>
                      <strong>Draft</strong>
                      <p>Visible only to editors, not live to visitors</p>
                    </div>
                  </label>

                  <label
                    className={`status-option ${
                      status === "published" ? "selected published" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="page-status"
                      value="published"
                      checked={status === "published"}
                      onChange={() => onUpdateStatus("published")}
                    />
                    <span className="status-dot published"></span>
                    <div>
                      <strong>Published</strong>
                      <p>Live and publicly accessible on your website</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Featured Image */}
              <div className="form-group">
                <label>Featured Image</label>
                <div className="featured-image-container">
                  {featuredImage ? (
                    <div className="featured-image-preview">
                      <img src={featuredImage} alt="Featured Preview" />
                      <div className="image-overlay-actions">
                        <button
                          type="button"
                          className="image-btn change-btn"
                          onClick={onOpenMediaLibrary}
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          className="image-btn remove-btn"
                          onClick={() => onUpdateFeaturedImage("")}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="featured-image-placeholder">
                      <ImageIcon size={32} className="placeholder-icon" />
                      <p>No featured image selected</p>
                      <button
                        type="button"
                        className="select-media-btn"
                        onClick={onOpenMediaLibrary}
                      >
                        Select from Media Library
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="settings-tab-content">
              {/* Meta Title */}
              <div className="form-group">
                <div className="label-with-counter">
                  <label htmlFor="settings-meta-title">Meta Title</label>
                  <span className="counter-badge" style={{ color: metaTitleColor }}>
                    {metaTitleLen} chars (Rec: 50–60)
                  </span>
                </div>
                <input
                  id="settings-meta-title"
                  type="text"
                  placeholder={title || "Custom title for search engines..."}
                  value={metaTitle}
                  onChange={(e) => onUpdateMetaTitle(e.target.value)}
                />
                <span className="field-hint">
                  Overrides default page title in search engine result headings.
                </span>
              </div>

              {/* Meta Description */}
              <div className="form-group">
                <div className="label-with-counter">
                  <label htmlFor="settings-meta-desc">Meta Description</label>
                  <span className="counter-badge" style={{ color: metaDescColor }}>
                    {metaDescLen} chars (Rec: 150–160)
                  </span>
                </div>
                <textarea
                  id="settings-meta-desc"
                  rows={3}
                  placeholder="Provide a concise summary of this page for search results..."
                  value={metaDescription}
                  onChange={(e) => onUpdateMetaDescription(e.target.value)}
                />
                <span className="field-hint">
                  Summary text displayed under title in search engine results.
                </span>
              </div>

              {/* Search Result Live Preview */}
              <div className="seo-preview-box">
                <div className="seo-preview-header">
                  <Globe size={14} />
                  <span>Google Search Result Preview</span>
                </div>

                <div className="google-result-card">
                  <div className="google-site-info">
                    <div className="google-favicon">G</div>
                    <div className="google-url-details">
                      <span className="google-site-name">Your Website</span>
                      <span className="google-url">
                        http://localhost:5000/
                        {slug ? slug.replace(/^\/+/, "") : "your-page-slug"}
                      </span>
                    </div>
                  </div>

                  <h3 className="google-title">
                    {metaTitle.trim() || title.trim() || "Untitled Page Title"}
                  </h3>

                  <p className="google-snippet">
                    {metaDescription.trim() ||
                      "Please enter a meta description to see how your page will appear in search engine results."}
                  </p>
                </div>
              </div>

              <div className="seo-info-note">
                <Info size={15} />
                <span>
                  Search engines may dynamically choose to display alternative text based on search queries.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="settings-modal-footer">
          <button
            type="button"
            className="done-settings-btn"
            onClick={onClose}
          >
            <CheckCircle2 size={16} />
            <span>Apply & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
