import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  GripVertical,
  Type,
  Image,
  LayoutTemplate,
  MousePointerClick,
  Trash2,
  X,
} from "lucide-react";
import "./PageBuilder.css";

type ComponentType = "hero" | "text" | "image";

interface PageComponent {
  id: string;
  type: ComponentType;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  text?: string;
  imageUrl?: string;
}

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
    icon: Image,
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

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
    if (!selectedId) return;

    const imageUrl = `http://localhost:5000${media.url}`;

    setComponents((previous) =>
      previous.map((component) =>
        component.id === selectedId
          ? {
              ...component,
              imageUrl,
            }
          : component
      )
    );

    setShowMediaLibrary(false);
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

  const handleDragStart = (type: ComponentType) => {
    setDraggedType(type);
  };

  const handleDrop = () => {
    if (!draggedType) return;

    addComponent(draggedType);
    setDraggedType(null);
  };

  const updateComponent = (field: keyof PageComponent, value: string) => {
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

  const handleSave = async () => {
    if (!pageTitle.trim()) {
      setError("Please enter a page title.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const slug = pageTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

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
          title: pageTitle,
          slug,
          content: JSON.stringify(components),
          type: "page",
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save page");
      }

      navigate("/content");
    } catch (error) {
      console.error("Save page error:", error);

      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-builder">
      {/* Top Bar */}
      <header className="builder-header">
        <div className="builder-header-left">
          <button
            className="builder-back"
            onClick={() => navigate("/content")}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1>Page Builder</h1>
            <p>Build your page visually.</p>
          </div>
        </div>

        <div className="builder-header-actions">
          <input
            className="page-title-input"
            type="text"
            placeholder="Page title..."
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />

          <button
            className="save-page-button"
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={17} />
            {loading ? "Saving..." : "Save Page"}
          </button>
        </div>
      </header>

      {error && <div className="builder-error">{error}</div>}

      {/* Builder Layout */}
      <div className="builder-layout">
        {/* LEFT PANEL */}
        <aside className="components-panel">
          <div className="panel-heading">
            <h2>Components</h2>
            <p>Drag components to the canvas</p>
          </div>

          <div className="template-list">
            {templates.map((template) => {
              const Icon = template.icon;

              return (
                <div
                  key={template.type}
                  className="template-item"
                  draggable
                  onDragStart={() => handleDragStart(template.type)}
                  onClick={() => addComponent(template.type)}
                >
                  <div className="template-icon">
                    <Icon size={19} />
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
        </aside>

        {/* CENTER CANVAS */}
        <main
          className="page-canvas-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="canvas-toolbar">
            <span>Page Preview</span>
          </div>

          <div className="page-canvas">
            {components.length === 0 ? (
              <div className="canvas-empty">
                <LayoutTemplate size={42} />
                <h2>Start building your page</h2>
                <p>
                  Drag a component from the left panel into this area.
                </p>
              </div>
            ) : (
              components.map((component) => (
                <div
                  key={component.id}
                  className={`canvas-component ${
                    selectedId === component.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedId(component.id)}
                >
                  {component.type === "hero" && (
                    <section className="preview-hero">
                      <h1>{component.title}</h1>
                      <p>{component.subtitle}</p>
                      <button>{component.buttonText}</button>
                    </section>
                  )}

                  {component.type === "text" && (
                    <section className="preview-text">
                      <p>{component.text}</p>
                    </section>
                  )}

                  {component.type === "image" && (
                    <section className="preview-image">
                      <img src={component.imageUrl} alt="Page section" />
                    </section>
                  )}

                  {selectedId === component.id && (
                    <div className="selected-label">Selected</div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        {/* RIGHT PANEL */}
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
                  : "Image Section"}
              </div>

              {selectedComponent.type === "hero" && (
                <>
                  <div className="editor-field">
                    <label>Title</label>
                    <input
                      type="text"
                      value={selectedComponent.title || ""}
                      onChange={(e) =>
                        updateComponent("title", e.target.value)
                      }
                    />
                    <small>{"{{TITLE}}"}</small>
                  </div>

                  <div className="editor-field">
                    <label>Subtitle</label>
                    <textarea
                      rows={4}
                      value={selectedComponent.subtitle || ""}
                      onChange={(e) =>
                        updateComponent("subtitle", e.target.value)
                      }
                    />
                    <small>{"{{SUBTITLE}}"}</small>
                  </div>

                  <div className="editor-field">
                    <label>Button Text</label>
                    <input
                      type="text"
                      value={selectedComponent.buttonText || ""}
                      onChange={(e) =>
                        updateComponent("buttonText", e.target.value)
                      }
                    />
                    <small>{"{{BUTTON_TEXT}}"}</small>
                  </div>
                </>
              )}

              {selectedComponent.type === "text" && (
                <div className="editor-field">
                  <label>Text Content</label>
                  <textarea
                    rows={8}
                    value={selectedComponent.text || ""}
                    onChange={(e) =>
                      updateComponent("text", e.target.value)
                    }
                  />
                </div>
              )}

              {selectedComponent.type === "image" && (
                <>
                  <div className="editor-field">
                    <label>Image</label>

                    {selectedComponent.imageUrl && (
                      <div className="selected-image-preview">
                        <img
                          src={selectedComponent.imageUrl}
                          alt="Selected"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      className="media-library-button"
                      onClick={() => {
                        fetchMedia();
                        setShowMediaLibrary(true);
                      }}
                    >
                      <Image size={16} />
                      Select from Media Library
                    </button>
                  </div>

                  
                </>
              )}

              <button
                className="delete-component"
                onClick={deleteComponent}
              >
                <Trash2 size={16} />
                Remove Component
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* MEDIA LIBRARY MODAL */}
      {showMediaLibrary && (
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
                  <Image size={35} />
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
        </div>
      )}
    </div>
  );
}

export default PageBuilder;