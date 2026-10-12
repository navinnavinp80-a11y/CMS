import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  GripVertical,
  Type,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointerClick,
  Trash2,
  X,
  Menu,
  Columns,
  Video,
  Minus,
  MoveVertical,
  PanelBottom,
  Copy,
  Pencil,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  Sparkles,
  Send,
  ExternalLink,
} from "lucide-react";
import "./PageBuilder.css";
import { PageSettingsModal, generateSlug } from "../../components/PageBuilder/PageSettingsModal";
import { PAGE_TEMPLATES, type PageTemplateDefinition } from "../../components/PageBuilder/templates";
import { PageTemplatesModal } from "../../components/PageBuilder/PageTemplatesModal";
import { TemplateConfirmModal } from "../../components/PageBuilder/TemplateConfirmModal";

import type { ComponentType, PageComponent } from "../../components/PageBuilder/types";

type DeviceMode = "desktop" | "tablet" | "mobile";

// Canvas Blocks
import { HeroBlock } from "../../components/PageBuilder/blocks/HeroBlock";
import { TextBlock } from "../../components/PageBuilder/blocks/TextBlock";
import { ImageBlock } from "../../components/PageBuilder/blocks/ImageBlock";
import { ButtonBlock } from "../../components/PageBuilder/blocks/ButtonBlock";
import { NavbarBlock } from "../../components/PageBuilder/blocks/NavbarBlock";
import { ColumnsBlock } from "../../components/PageBuilder/blocks/ColumnsBlock";
import { VideoBlock } from "../../components/PageBuilder/blocks/VideoBlock";
import { DividerBlock } from "../../components/PageBuilder/blocks/DividerBlock";
import { SpacerBlock } from "../../components/PageBuilder/blocks/SpacerBlock";
import { FooterBlock } from "../../components/PageBuilder/blocks/FooterBlock";

// Editors
import { HeroEditor } from "../../components/PageBuilder/editors/HeroEditor";
import { TextEditor } from "../../components/PageBuilder/editors/TextEditor";
import { ImageEditor } from "../../components/PageBuilder/editors/ImageEditor";
import { ButtonEditor } from "../../components/PageBuilder/editors/ButtonEditor";
import { NavbarEditor } from "../../components/PageBuilder/editors/NavbarEditor";
import { ColumnsEditor } from "../../components/PageBuilder/editors/ColumnsEditor";
import { VideoEditor } from "../../components/PageBuilder/editors/VideoEditor";
import { DividerEditor } from "../../components/PageBuilder/editors/DividerEditor";
import { SpacerEditor } from "../../components/PageBuilder/editors/SpacerEditor";
import { FooterEditor } from "../../components/PageBuilder/editors/FooterEditor";

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: "image" | "video";
}

const templates = [
  {
    type: "hero" as ComponentType,
    name: "Hero Section",
    description: "Title, subtitle and button",
    icon: LayoutTemplate,
  },
  {
    type: "text" as ComponentType,
    name: "Text Block",
    description: "Simple text content",
    icon: Type,
  },
  {
    type: "image" as ComponentType,
    name: "Image Section",
    description: "Image content section",
    icon: ImageIcon,
  },
  {
    type: "button" as ComponentType,
    name: "Button",
    description: "Clickable button",
    icon: MousePointerClick,
  },
  {
    type: "navbar" as ComponentType,
    name: "Navbar",
    description: "Website navigation header",
    icon: Menu,
  },
  {
    type: "columns" as ComponentType,
    name: "Two Columns",
    description: "Two-column content layout",
    icon: Columns,
  },
  {
    type: "video" as ComponentType,
    name: "Video",
    description: "Video content section",
    icon: Video,
  },
  {
    type: "divider" as ComponentType,
    name: "Divider",
    description: "Horizontal separator line",
    icon: Minus,
  },
  {
    type: "spacer" as ComponentType,
    name: "Spacer",
    description: "Vertical empty space",
    icon: MoveVertical,
  },
  {
    type: "footer" as ComponentType,
    name: "Footer",
    description: "Website footer section",
    icon: PanelBottom,
  },
];

function PageBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [pageTitle, setPageTitle] = useState("");
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<ComponentType | null>(null);
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isSlugUserModified, setIsSlugUserModified] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"component" | "featuredImage" | null>(null);

  const [leftPanelTab, setLeftPanelTab] = useState<"components" | "templates">("components");
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<PageTemplateDefinition | null>(null);

  const handleSelectTemplate = (template: PageTemplateDefinition) => {
    if (components.length > 0) {
      setPendingTemplate(template);
    } else {
      applyTemplateComponents(template);
    }
  };

  const applyTemplateComponents = (template: PageTemplateDefinition) => {
    const newComponents = template.createComponents();
    setComponents(newComponents);
    if (newComponents.length > 0) {
      setSelectedId(newComponents[0].id);
    } else {
      setSelectedId(null);
    }
    setPendingTemplate(null);
    setIsTemplatesModalOpen(false);
  };

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [activeColumnSide, setActiveColumnSide] = useState<"left" | "right" | null>(null);

  const selectedComponent = components.find(
    (component) => component.id === selectedId
  );

  const fetchPage = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/content/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch page");
      }

      const page = data.content || data;

      setPageTitle(page.title || "");
      setSlug(page.slug || "");
      setStatus(page.status || "draft");
      setFeaturedImage(page.featuredImage || "");
      setMetaTitle(page.metaTitle || "");
      setMetaDescription(page.metaDescription || "");
      setIsSlugUserModified(Boolean(page.slug));

      let savedComponents: PageComponent[] = [];
      if (typeof page.content === "string") {
        try {
          savedComponents = JSON.parse(page.content || "[]");
        } catch (e) {
          console.error("Failed to parse page content JSON", e);
        }
      } else if (Array.isArray(page.content)) {
        savedComponents = page.content;
      }

      setComponents(savedComponents);
    } catch (error) {
      console.error("Fetch page error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load page"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchPage();
    }
  }, [isEditMode, id]);

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/media", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch media");
      }

      const media = data.media || data;

      setMediaItems(
        media.filter((item: MediaItem) => item.type === "image")
      );
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setMediaLoading(false);
    }
  };

  const selectMedia = (media: MediaItem) => {
    const imageUrl = `http://localhost:5000${media.url}`;

    if (mediaTarget === "featuredImage") {
      setFeaturedImage(imageUrl);
      setMediaTarget(null);
      setShowMediaLibrary(false);
      return;
    }

    if (!selectedId) return;

    setComponents((previous) =>
      previous.map((component) => {
        if (component.id !== selectedId) return component;

        if (component.type === "columns" && activeColumnSide) {
          const currentCols = component.columns || {
            left: { type: "text", text: "Left column content" },
            right: { type: "text", text: "Right column content" },
          };

          return {
            ...component,
            columns: {
              ...currentCols,
              [activeColumnSide]: {
                ...currentCols[activeColumnSide],
                type: "image",
                imageUrl,
              },
            },
          };
        }

        return {
          ...component,
          imageUrl,
        };
      })
    );

    setActiveColumnSide(null);
    setShowMediaLibrary(false);
  };

  const updateNavItem = (index: number, field: "label" | "url", value: string) => {
    if (!selectedId) return;
    setComponents((previous) =>
      previous.map((comp) => {
        if (comp.id !== selectedId) return comp;
        const currentItems = comp.navbarItems || [];
        const updatedItems = currentItems.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        );
        return { ...comp, navbarItems: updatedItems };
      })
    );
  };

  const addNavItem = () => {
    if (!selectedId) return;
    setComponents((previous) =>
      previous.map((comp) => {
        if (comp.id !== selectedId) return comp;
        const currentItems = comp.navbarItems || [];
        const updatedItems = [
          ...currentItems,
          { label: `Link ${currentItems.length + 1}`, url: "#" },
        ];
        return { ...comp, navbarItems: updatedItems };
      })
    );
  };

  const removeNavItem = (index: number) => {
    if (!selectedId) return;
    setComponents((previous) =>
      previous.map((comp) => {
        if (comp.id !== selectedId) return comp;
        const currentItems = comp.navbarItems || [];
        const updatedItems = currentItems.filter((_, i) => i !== index);
        return { ...comp, navbarItems: updatedItems };
      })
    );
  };

  const updateColumnType = (side: "left" | "right", type: "text" | "image") => {
    if (!selectedId) return;
    setComponents((previous) =>
      previous.map((comp) => {
        if (comp.id !== selectedId) return comp;
        const currentCols = comp.columns || {
          left: { type: "text", text: "Left column content" },
          right: { type: "text", text: "Right column content" },
        };
        const currentSide = currentCols[side];
        return {
          ...comp,
          columns: {
            ...currentCols,
            [side]: {
              ...currentSide,
              type,
              text: currentSide.text || (type === "text" ? "Column content..." : ""),
              imageUrl: currentSide.imageUrl || (type === "image" ? "https://via.placeholder.com/400x250?text=Column+Image" : ""),
            },
          },
        };
      })
    );
  };

  const updateColumnField = (
    side: "left" | "right",
    field: "text" | "imageUrl",
    value: string
  ) => {
    if (!selectedId) return;
    setComponents((previous) =>
      previous.map((comp) => {
        if (comp.id !== selectedId) return comp;
        const currentCols = comp.columns || {
          left: { type: "text", text: "Left column content" },
          right: { type: "text", text: "Right column content" },
        };
        return {
          ...comp,
          columns: {
            ...currentCols,
            [side]: {
              ...currentCols[side],
              [field]: value,
            },
          },
        };
      })
    );
  };

  const createComponent = (type: ComponentType): PageComponent => {
    const id = `${type}-${Date.now()}`;

    if (type === "hero") {
      return {
        id,
        type,
        title: "Welcome to Our Website",
        subtitle: "Create beautiful pages without coding.",
        buttonText: "Get Started",
      };
    }

    if (type === "text") {
      return {
        id,
        type,
        text: "Write your content here...",
      };
    }

    if (type === "button") {
      return {
        id,
        type,
        buttonText: "Get Started",
        buttonUrl: "#",
      };
    }

    if (type === "navbar") {
      return {
        id,
        type,
        navbarLogo: "My Website",
        navbarItems: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Contact", url: "/contact" },
        ],
      };
    }

    if (type === "columns") {
      return {
        id,
        type,
        columns: {
          left: {
            type: "text",
            text: "Left column content",
          },
          right: {
            type: "text",
            text: "Right column content",
          },
        },
      };
    }

    if (type === "video") {
      return {
        id,
        type,
        videoUrl: "",
      };
    }

    if (type === "divider") {
      return {
        id,
        type,
        dividerStyle: "solid",
        dividerWidth: "100%",
      };
    }

    if (type === "spacer") {
      return {
        id,
        type,
        height: 40,
      };
    }

    if (type === "footer") {
      return {
        id,
        type,
        footerLogo: "My Website",
        footerDescription: "Building beautiful digital experiences.",
        footerCopyright: "© 2026 My Website. All rights reserved.",
        footerLinks: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Contact", url: "/contact" },
        ],
      };
    }

    return {
      id,
      type,
      imageUrl: "https://via.placeholder.com/800x400?text=Image+Section",
    };
  };

  const addComponent = (type: ComponentType) => {
    const newComponent = createComponent(type);

    setComponents((previous) => [...previous, newComponent]);

    setSelectedId(newComponent.id);
  };

  const resetDragState = () => {
    setDraggedType(null);
    setDraggedComponentId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleTemplateDragStart = (type: ComponentType) => {
    setDraggedType(type);
    setDraggedComponentId(null);
  };

  const handleComponentDragStart = (e: React.DragEvent, id: string) => {
    setDraggedComponentId(id);
    setDraggedType(null);
    e.stopPropagation();
  };

  const handleComponentDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedComponentId && draggedComponentId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position: "above" | "below" = e.clientY < midY ? "above" : "below";

    setDragOverId(targetId);
    setDropPosition(position);
  };

  const handleComponentDragLeave = (e: React.DragEvent, targetId: string) => {
    e.stopPropagation();
    if (dragOverId === targetId) {
      setDragOverId(null);
      setDropPosition(null);
    }
  };

  const handleComponentDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPosition = dropPosition || "below";

    if (draggedType) {
      const newComponent = createComponent(draggedType);
      setComponents((prev) => {
        const targetIndex = prev.findIndex((c) => c.id === targetId);
        if (targetIndex === -1) return [...prev, newComponent];

        const insertIndex = currentPosition === "below" ? targetIndex + 1 : targetIndex;
        const updated = [...prev];
        updated.splice(insertIndex, 0, newComponent);
        return updated;
      });
      setSelectedId(newComponent.id);
    } else if (draggedComponentId && draggedComponentId !== targetId) {
      setComponents((prev) => {
        const fromIndex = prev.findIndex((c) => c.id === draggedComponentId);
        const targetIndex = prev.findIndex((c) => c.id === targetId);

        if (fromIndex === -1 || targetIndex === -1) return prev;

        const updated = [...prev];
        const [movedItem] = updated.splice(fromIndex, 1);

        const newTargetIndex = updated.findIndex((c) => c.id === targetId);
        const insertIndex = currentPosition === "below" ? newTargetIndex + 1 : newTargetIndex;

        updated.splice(insertIndex, 0, movedItem);
        return updated;
      });
    }

    resetDragState();
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (draggedType) {
      addComponent(draggedType);
    }

    resetDragState();
  };

  const updateComponent = (field: keyof PageComponent, value: any) => {
    if (!selectedId) return;

    setComponents((previous) =>
      previous.map((component) =>
        component.id === selectedId
          ? {
            ...component,
            [field]: value,
          }
          : component
      )
    );
  };

  const deleteComponent = () => {
    if (!selectedId) return;

    setComponents((previous) =>
      previous.filter((component) => component.id !== selectedId)
    );

    setSelectedId(null);
  };

  const duplicateComponent = (idToDuplicate: string) => {
    const original = components.find((c) => c.id === idToDuplicate);
    if (!original) return;

    const newId = `${original.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cloned: PageComponent = {
      ...structuredClone(original),
      id: newId,
    };

    setComponents((previous) => {
      const index = previous.findIndex((c) => c.id === idToDuplicate);
      if (index === -1) return [...previous, cloned];

      const updated = [...previous];
      updated.splice(index + 1, 0, cloned);
      return updated;
    });

    setSelectedId(newId);
  };

  const handleSavePage = async (overrideStatus?: "draft" | "published") => {
    try {
      setLoading(true);
      setError("");

      const nextStatus = overrideStatus || status || "draft";
      setStatus(nextStatus);

      const token = localStorage.getItem("token");
      const contentJson = JSON.stringify(components);

      const finalTitle = pageTitle.trim() || "Untitled Page";
      const finalSlug = slug.trim()
        ? generateSlug(slug)
        : generateSlug(finalTitle) || `page-${Date.now()}`;

      const url = isEditMode
        ? `http://localhost:5000/api/content/${id}`
        : "http://localhost:5000/api/content";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTitle,
          slug: finalSlug,
          content: contentJson,
          type: "page",
          status: nextStatus,
          featuredImage,
          metaTitle,
          metaDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save page");
      }

      const savedContent = data.content || data;
      if (!isEditMode && savedContent?._id) {
        navigate(`/content/edit-page/${savedContent._id}`, { replace: true });
      } else {
        navigate("/content");
      }
    } catch (err) {
      console.error("Save page error:", err);

      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewPage = () => {
    setError("");

    if (!isEditMode) {
      setError("Please save or publish the page first before viewing it.");
      return;
    }

    const finalSlug = slug.trim()
      ? generateSlug(slug)
      : generateSlug(pageTitle);

    if (!finalSlug) {
      setError("Please set a valid page title or slug before viewing the page.");
      return;
    }

    if (status === "draft") {
      setError("This page is currently a draft. Please publish it to make it publicly accessible.");
      return;
    }

    const publicUrl = `${window.location.origin}/p/${finalSlug}`;
    window.open(publicUrl, "_blank");
  };

  return (
    <div className="page-builder">
      {/* HEADER */}
      <div className="builder-header">
        <div className="builder-header-left">
          <button
            className="builder-back"
            onClick={() => navigate("/content")}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1>{isEditMode ? "Edit Page" : "Create Page"}</h1>
            <p>Drag and drop sections to design your page.</p>
          </div>
        </div>

        <div className="builder-header-actions">
          <div className="preview-toggle-group">
            <button
              type="button"
              className={`toggle-btn ${!isPreviewMode ? "active" : ""}`}
              onClick={() => setIsPreviewMode(false)}
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className={`toggle-btn ${isPreviewMode ? "active" : ""}`}
              onClick={() => {
                setSelectedId(null);
                setIsPreviewMode(true);
              }}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>

          <div className="device-toggle-group">
            <button
              type="button"
              className={`device-btn ${deviceMode === "desktop" ? "active" : ""}`}
              title="Desktop (100%)"
              onClick={() => setDeviceMode("desktop")}
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              className={`device-btn ${deviceMode === "tablet" ? "active" : ""}`}
              title="Tablet (768px)"
              onClick={() => setDeviceMode("tablet")}
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              className={`device-btn ${deviceMode === "mobile" ? "active" : ""}`}
              title="Mobile (375px)"
              onClick={() => setDeviceMode("mobile")}
            >
              <Smartphone size={15} />
            </button>
          </div>

          <input
            type="text"
            className="page-title-input"
            placeholder="Page Title..."
            value={pageTitle}
            onChange={(e) => {
              const val = e.target.value;
              setPageTitle(val);
              if (!isSlugUserModified) {
                setSlug(generateSlug(val));
              }
            }}
          />

          <button
            type="button"
            className="settings-toggle-btn"
            title="Page Settings & SEO"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={16} />
            <span>Page Settings</span>
          </button>

          <button
            type="button"
            className="templates-toggle-btn"
            title="Page Templates"
            onClick={() => setIsTemplatesModalOpen(true)}
          >
            <Sparkles size={16} />
            <span>Templates</span>
          </button>

          <button
            type="button"
            className="draft-page-button"
            disabled={loading}
            onClick={() => handleSavePage("draft")}
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="publish-page-button"
            disabled={loading}
            onClick={() => handleSavePage("published")}
          >
            <Send size={16} />
            <span>Publish</span>
          </button>

          <button
            type="button"
            className="view-page-button"
            title="View Published Page"
            onClick={handleViewPage}
          >
            <ExternalLink size={16} />
            <span>View Page</span>
          </button>
        </div>
      </div>

      {error && <div className="builder-error">{error}</div>}

      {/* MAIN BUILDER */}
      <div className={`builder-layout ${isPreviewMode ? "preview-mode-layout" : ""}`}>
        {/* LEFT PANEL */}
        {!isPreviewMode && (
          <aside className="components-panel">
            <div className="sidebar-tab-header">
              <button
                type="button"
                className={`sidebar-tab-btn ${leftPanelTab === "components" ? "active" : ""}`}
                onClick={() => setLeftPanelTab("components")}
              >
                <LayoutTemplate size={14} />
                <span>Components</span>
              </button>
              <button
                type="button"
                className={`sidebar-tab-btn ${leftPanelTab === "templates" ? "active" : ""}`}
                onClick={() => setLeftPanelTab("templates")}
              >
                <Sparkles size={14} />
                <span>Templates</span>
              </button>
            </div>

            {leftPanelTab === "components" ? (
              <>
                <div className="panel-heading">
                  <h2>Components</h2>
                  <p>Drag component or click to add</p>
                </div>

                <div className="template-list">
                  {templates.map((template) => {
                    const Icon = template.icon;

                    return (
                      <div
                        key={template.type}
                        className="template-item"
                        draggable
                        onDragStart={() => handleTemplateDragStart(template.type)}
                        onClick={() => addComponent(template.type)}
                      >
                        <div className="template-icon">
                          <Icon size={18} />
                        </div>

                        <div className="template-info">
                          <strong>{template.name}</strong>
                          <span>{template.description}</span>
                        </div>

                        <GripVertical size={17} className="drag-icon" />
                      </div>
                    );
                  })}
                </div>

                <div className="panel-tip">
                  <MousePointerClick size={17} />
                  <span>
                    Click a component to add it or drag it into the canvas.
                  </span>
                </div>
              </>
            ) : (
              <div className="sidebar-templates-list">
                <div className="panel-heading">
                  <h2>Page Templates</h2>
                  <p>Select a pre-built layout to apply</p>
                </div>

                <div className="sidebar-template-cards">
                  {PAGE_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="sidebar-template-card"
                      onClick={() => handleSelectTemplate(tmpl)}
                    >
                      <div className="tmpl-card-header">
                        <strong>{tmpl.name}</strong>
                        <span className="tmpl-tag">{tmpl.category}</span>
                      </div>
                      <p>{tmpl.description}</p>
                      <div className="tmpl-blocks-preview">
                        {tmpl.blockSummary.map((b, i) => (
                          <span key={i} className="tmpl-block-chip">{b.name}</span>
                        ))}
                      </div>
                      <button type="button" className="apply-sidebar-tmpl-btn">
                        Apply Layout
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* CENTER CANVAS */}
        <main
          className="page-canvas-area"
          onDragOver={(e) => !isPreviewMode && e.preventDefault()}
          onDrop={(e) => !isPreviewMode && handleCanvasDrop(e)}
        >
          {!isPreviewMode && (
            <div className="canvas-toolbar">
              <span>Page Preview</span>
            </div>
          )}

          <div className={`page-canvas ${isPreviewMode ? "preview-canvas" : ""} device-${deviceMode}`}>
            {components.length === 0 ? (
              <div className="canvas-empty">
                <LayoutTemplate size={42} />
                <h2>Start building your page</h2>
                <p>
                  Drag a component from the left panel into this area.
                </p>
              </div>
            ) : (
              components.map((component) => {
                const isDragging = !isPreviewMode && draggedComponentId === component.id;
                const isDropTarget = !isPreviewMode && dragOverId === component.id && !isDragging;
                const targetAbove = isDropTarget && dropPosition === "above";
                const targetBelow = isDropTarget && dropPosition === "below";

                return (
                  <div
                    key={component.id}
                    draggable={!isPreviewMode}
                    onDragStart={(e) => !isPreviewMode && handleComponentDragStart(e, component.id)}
                    onDragOver={(e) => !isPreviewMode && handleComponentDragOver(e, component.id)}
                    onDragLeave={(e) => !isPreviewMode && handleComponentDragLeave(e, component.id)}
                    onDrop={(e) => !isPreviewMode && handleComponentDrop(e, component.id)}
                    onDragEnd={resetDragState}
                    className={`canvas-component ${!isPreviewMode && selectedId === component.id ? "selected" : ""
                      } ${isDragging ? "is-dragging" : ""} ${targetAbove ? "drop-target-above" : ""
                      } ${targetBelow ? "drop-target-below" : ""} ${isPreviewMode ? "preview-block" : ""
                      }`}
                    onClick={() => !isPreviewMode && setSelectedId(component.id)}
                  >
                    {component.type === "hero" && (
                      <HeroBlock component={component} isPreviewMode={isPreviewMode} />
                    )}
                    {component.type === "text" && <TextBlock component={component} />}
                    {component.type === "image" && <ImageBlock component={component} />}
                    {component.type === "button" && (
                      <ButtonBlock component={component} isPreviewMode={isPreviewMode} />
                    )}
                    {component.type === "navbar" && (
                      <NavbarBlock component={component} isPreviewMode={isPreviewMode} />
                    )}
                    {component.type === "columns" && <ColumnsBlock component={component} />}
                    {component.type === "video" && <VideoBlock component={component} />}
                    {component.type === "divider" && <DividerBlock component={component} />}
                    {component.type === "spacer" && <SpacerBlock component={component} />}
                    {component.type === "footer" && (
                      <FooterBlock component={component} isPreviewMode={isPreviewMode} />
                    )}

                    {!isPreviewMode && selectedId === component.id && (
                      <div className="selected-controls">
                        <span className="selected-label">Selected</span>
                        <button
                          type="button"
                          className="action-btn duplicate-btn"
                          title="Duplicate Component"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateComponent(component.id);
                          }}
                        >
                          <Copy size={12} />
                          <span>Duplicate</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* RIGHT PANEL */}
        {!isPreviewMode && (
          <aside className="content-editor-panel">
            <div className="panel-heading">
              <h2>Content Editor</h2>
              <p>Edit selected component values</p>
            </div>

            {!selectedComponent ? (
              <div className="editor-empty">
                <MousePointerClick size={30} />
                <p>
                  Select a component from the canvas to edit its content.
                </p>
              </div>
            ) : (
              <div className="editor-fields">
                <div className="selected-component-name">
                  {selectedComponent.type === "hero"
                    ? "Hero Section"
                    : selectedComponent.type === "text"
                      ? "Text Block"
                      : selectedComponent.type === "image"
                        ? "Image Section"
                        : selectedComponent.type === "button"
                          ? "Button Component"
                          : selectedComponent.type === "navbar"
                            ? "Navbar Header"
                            : selectedComponent.type === "columns"
                              ? "Two-Column Layout"
                              : selectedComponent.type === "video"
                                ? "Video Component"
                                : selectedComponent.type === "divider"
                                  ? "Divider Line"
                                  : selectedComponent.type === "spacer"
                                    ? "Spacer Component"
                                    : "Footer Section"}
                </div>

                {selectedComponent.type === "hero" && (
                  <HeroEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                {selectedComponent.type === "text" && (
                  <TextEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                {selectedComponent.type === "image" && (
                  <ImageEditor
                    component={selectedComponent}
                    openMediaLibrary={() => {
                      fetchMedia();
                      setShowMediaLibrary(true);
                    }}
                  />
                )}

                {selectedComponent.type === "button" && (
                  <ButtonEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                {selectedComponent.type === "navbar" && (
                  <NavbarEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                    updateNavItem={updateNavItem}
                    addNavItem={addNavItem}
                    removeNavItem={removeNavItem}
                  />
                )}

                {selectedComponent.type === "columns" && (
                  <ColumnsEditor
                    component={selectedComponent}
                    updateColumnType={updateColumnType}
                    updateColumnField={updateColumnField}
                    openMediaLibraryForSide={(side) => {
                      setActiveColumnSide(side);
                      fetchMedia();
                      setShowMediaLibrary(true);
                    }}
                  />
                )}

                {selectedComponent.type === "video" && (
                  <VideoEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                {selectedComponent.type === "divider" && (
                  <DividerEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                {selectedComponent.type === "spacer" && (
                  <SpacerEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                {selectedComponent.type === "footer" && (
                  <FooterEditor
                    component={selectedComponent}
                    updateComponent={updateComponent}
                  />
                )}

                <div className="editor-actions">
                  <button
                    type="button"
                    className="duplicate-component"
                    onClick={() => duplicateComponent(selectedComponent.id)}
                  >
                    <Copy size={15} />
                    Duplicate Component
                  </button>

                  <button
                    type="button"
                    className="delete-component"
                    onClick={deleteComponent}
                  >
                    <Trash2 size={15} />
                    Remove Component
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* PAGE SETTINGS MODAL */}
      <PageSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={pageTitle}
        slug={slug}
        status={status}
        featuredImage={featuredImage}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        isSlugUserModified={isSlugUserModified}
        onUpdateTitle={(val) => setPageTitle(val)}
        onUpdateSlug={(val, isManual) => {
          setSlug(val);
          if (isManual) setIsSlugUserModified(true);
        }}
        onUpdateStatus={(val) => setStatus(val)}
        onUpdateFeaturedImage={(url) => setFeaturedImage(url)}
        onUpdateMetaTitle={(val) => setMetaTitle(val)}
        onUpdateMetaDescription={(val) => setMetaDescription(val)}
        onOpenMediaLibrary={() => {
          setMediaTarget("featuredImage");
          fetchMedia();
          setShowMediaLibrary(true);
        }}
      />

      {/* MEDIA LIBRARY MODAL (PORTAL TO BODY) */}
      {showMediaLibrary &&
        createPortal(
          <div
            className="media-modal-overlay"
            onClick={() => setShowMediaLibrary(false)}
          >
            <div
              className="media-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="media-modal-header">
                <div>
                  <h2>Media Library</h2>
                  <p>Select an image for this section.</p>
                </div>

                <button
                  className="media-close-button"
                  onClick={() => setShowMediaLibrary(false)}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="media-modal-content">
                {mediaLoading ? (
                  <div className="media-empty">Loading media...</div>
                ) : mediaItems.length === 0 ? (
                  <div className="media-empty">
                    <ImageIcon size={35} />
                    <h3>No images found</h3>
                    <p>Upload images from the Media section first.</p>
                  </div>
                ) : (
                  <div className="media-grid">
                    {mediaItems.map((media) => {
                      const imageUrl = `http://localhost:5000${media.url}`;

                      return (
                        <button
                          key={media._id}
                          className="media-item"
                          onClick={() => selectMedia(media)}
                        >
                          <img
                            src={imageUrl}
                            alt={media.originalName}
                          />
                          <div className="media-item-name">
                            {media.originalName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* PAGE TEMPLATES MODAL */}
      <PageTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={(tmpl) => handleSelectTemplate(tmpl)}
      />

      {/* TEMPLATE REPLACEMENT CONFIRM MODAL */}
      <TemplateConfirmModal
        isOpen={Boolean(pendingTemplate)}
        template={pendingTemplate}
        componentCount={components.length}
        onClose={() => setPendingTemplate(null)}
        onConfirm={() => {
          if (pendingTemplate) {
            applyTemplateComponents(pendingTemplate);
          }
        }}
      />
    </div>
  );
}

export default PageBuilder;