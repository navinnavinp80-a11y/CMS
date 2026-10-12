import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  Settings,
  Eye,
  X,
  Upload,
  Search,
  Check,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Unlink,
  Video,
  ChevronDown,
  Sparkles,
  FileText,
  HelpCircle,
  Maximize2,
  Trash2,
  Palette,
  Highlighter,
  Eraser,
} from "lucide-react";
import "./BlogEditor.css";
import { ImageResizeOverlay } from "./ImageResizeOverlay";

const TEXT_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Dark Slate", hex: "#334155" },
  { name: "Gray", hex: "#64748b" },
  { name: "Red", hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Amber", hex: "#d97706" },
  { name: "Green", hex: "#16a34a" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Purple", hex: "#9333ea" },
  { name: "Pink", hex: "#db2777" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", hex: "#fef08a" },
  { name: "Green", hex: "#bbf7d0" },
  { name: "Blue", hex: "#bfdbfe" },
  { name: "Pink", hex: "#fbcfe8" },
  { name: "Purple", hex: "#e9d5ff" },
  { name: "Orange", hex: "#fed7aa" },
  { name: "Red", hex: "#fecaca" },
  { name: "None", hex: "transparent" },
];


interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: "image" | "video";
  createdAt?: string;
}

interface BlogEditorProps {
  mode: "create" | "edit";
}

const API_URL = "http://localhost:5000";

function BlogEditor({ mode }: BlogEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Image for Resizing
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  // Post Data States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Editor UI States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSlugAuto, setIsSlugAuto] = useState(true);

  // Panels & Modals
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Color Pickers States
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("#fef08a");

  // Media Library States
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  // Saved Cursor Selection
  const savedSelectionRef = useRef<Range | null>(null);

  // Statistics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Fetch Existing Post (if mode === 'edit')
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchPost();
    }
  }, [mode, id]);

  // Fetch Media Items on mount or open
  useEffect(() => {
    fetchMedia();
  }, []);

  // Close menus & popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".editor-menu-item")) {
        setActiveMenu(null);
      }
      if (!target.closest(".color-picker-popover-container")) {
        setShowTextColorPicker(false);
        setShowHighlightPicker(false);
      }
      if (
        !target.closest(".image-resize-overlay-wrapper") &&
        !target.closest(".image-properties-toolbar") &&
        target.tagName !== "IMG"
      ) {
        setSelectedImage(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Text and Highlight Color Handlers
  const applyTextColor = (color: string) => {
    setSelectedTextColor(color);
    restoreSelection();
    execCommand("foreColor", color);
    setShowTextColorPicker(false);
  };

  const applyHighlightColor = (color: string) => {
    setSelectedHighlightColor(color);
    restoreSelection();
    if (color === "transparent") {
      try {
        document.execCommand("hiliteColor", false, "transparent");
      } catch {
        document.execCommand("backColor", false, "transparent");
      }
    } else {
      try {
        document.execCommand("hiliteColor", false, color);
      } catch {
        document.execCommand("backColor", false, color);
      }
    }
    handleEditorInput();
    setShowHighlightPicker(false);
  };

  const handleClearFormatting = () => {
    restoreSelection();
    execCommand("removeFormat");
  };

  const handleDeleteSelection = () => {
    restoreSelection();
    execCommand("delete");
  };


  // Sync content HTML to editor innerHTML on initial load
  useEffect(() => {
    if (!fetching && editorRef.current && content !== editorRef.current.innerHTML) {
      // Only set if editor innerHTML is empty or drastically different on initial load
      if (!editorRef.current.innerHTML || mode === "edit") {
        editorRef.current.innerHTML = content;
        updateCounts();
      }
    }
  }, [fetching, content, mode]);

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isSlugAuto) {
      const generatedSlug = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  };

  const fetchPost = async () => {
    try {
      setFetching(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/content/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch post");
      }

      const post = data.content || data;
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setContent(post.content || "");
      setStatus(post.status || "draft");
      setFeaturedImage(post.featuredImage || "");
      setMetaTitle(post.metaTitle || "");
      setMetaDescription(post.metaDescription || "");
      setIsSlugAuto(false);

      if (editorRef.current) {
        editorRef.current.innerHTML = post.content || "";
        updateCounts();
      }
    } catch (err) {
      console.error("Fetch post error:", err);
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setFetching(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/media`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMediaItems(data.media || data);
      }
    } catch (err) {
      console.error("Fetch media error:", err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setMediaUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      await fetchMedia();
      setSuccessMsg("Media uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Upload media error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setMediaUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Content Input Handler & Statistics
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      updateCounts();
    }
  };

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const trimmed = text.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
    }
  };

  // Save Cursor Selection Position
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  // Formatting commands helper
  const execCommand = (command: string, value: string = "") => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  // Insert HTML snippet at cursor
  const insertHtmlAtCursor = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const tempEl = document.createElement("div");
      tempEl.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = tempEl.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += html;
    }
    handleEditorInput();
  };

  // Media Insertion Handlers
  const insertMediaToEditor = (item: MediaItem) => {
    const fullUrl = item.url.startsWith("http") ? item.url : `${API_URL}${item.url}`;
    let html = "";
    if (item.type === "image") {
      html = `<p style="text-align: center;"><img src="${fullUrl}" alt="${item.originalName}" style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin: 16px auto; display: block;" data-align="center" /></p><p><br/></p>`;
    } else {
      html = `<p><video src="${fullUrl}" controls style="max-width: 100%; border-radius: 8px; margin: 12px 0;"></video></p><p><br/></p>`;
    }
    insertHtmlAtCursor(html);
    setSuccessMsg(`Inserted ${item.type} into article`);
    setTimeout(() => setSuccessMsg(""), 2500);

    if (item.type === "image" && editorRef.current) {
      setTimeout(() => {
        const images = editorRef.current?.querySelectorAll("img");
        if (images && images.length > 0) {
          const lastImg = images[images.length - 1];
          setSelectedImage(lastImg);
        }
      }, 50);
    }
  };

  const handleSetFeatured = (item: MediaItem) => {
    const fullUrl = item.url.startsWith("http") ? item.url : `${API_URL}${item.url}`;
    setFeaturedImage(fullUrl);
    setSuccessMsg("Set as featured image!");
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  const handlePromptLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handlePromptVideo = () => {
    const url = window.prompt("Enter Video Embed or MP4 URL:", "https://");
    if (url) {
      let embedHtml = "";
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        if (url.includes("youtu.be")) {
          videoId = url.split("/").pop() || "";
        } else {
          const match = url.match(/[?&]v=([^&]+)/);
          if (match) videoId = match[1];
        }
        embedHtml = `<p><iframe src="https://www.youtube.com/embed/${videoId}" width="100%" height="400" frameborder="0" allowfullscreen style="border-radius: 8px; margin: 12px 0;"></iframe></p><p><br/></p>`;
      } else {
        embedHtml = `<p><video src="${url}" controls style="max-width: 100%; border-radius: 8px; margin: 12px 0;"></video></p><p><br/></p>`;
      }
      insertHtmlAtCursor(embedHtml);
    }
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (targetStatus: "draft" | "published") => {
    if (!title.trim()) {
      setError("Blog title is required");
      return;
    }
    if (!slug.trim()) {
      setError("Blog slug is required");
      return;
    }

    const currentContent = editorRef.current?.innerHTML || content;
    if (!currentContent.trim() || currentContent === "<p><br></p>") {
      setError("Blog content is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus(targetStatus);

      const token = localStorage.getItem("token");
      const payload = {
        title,
        slug,
        content: currentContent,
        type: "post",
        status: targetStatus,
        featuredImage,
        metaTitle,
        metaDescription,
      };

      const url = mode === "edit" ? `${API_URL}/api/content/${id}` : `${API_URL}/api/content`;
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save blog");
      }

      setSuccessMsg(
        mode === "edit"
          ? `Post updated successfully as ${targetStatus}!`
          : `Post created successfully as ${targetStatus}!`
      );

      setTimeout(() => {
        navigate("/content");
      }, 1200);
    } catch (err) {
      console.error("Save blog error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    if (!mediaSearch.trim()) return true;
    return item.originalName.toLowerCase().includes(mediaSearch.toLowerCase());
  });

  if (fetching) {
    return (
      <div className="blog-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading Blog Editor...</p>
      </div>
    );
  }

  return (
    <div className="blog-editor-container">
      {/* Notifications */}
      {error && (
        <div className="blog-editor-alert error">
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={15} /></button>
        </div>
      )}
      {successMsg && (
        <div className="blog-editor-alert success">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Header */}
      <header className="blog-editor-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate("/content")}
            title="Back to Content"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="title-input-wrapper">
            <input
              type="text"
              className="blog-title-input"
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            <span className={`status-badge ${status}`}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="header-right">
          <button
            className={`icon-action-btn ${showMediaLibrary ? "active" : ""}`}
            onClick={() => setShowMediaLibrary(!showMediaLibrary)}
            title="Toggle Media Library"
          >
            <ImageIcon size={16} />
            <span>Media</span>
          </button>

          <button
            className={`icon-action-btn ${showSeoModal ? "active" : ""}`}
            onClick={() => setShowSeoModal(true)}
            title="SEO & Settings"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          <button
            className="icon-action-btn"
            onClick={() => setShowPreviewModal(true)}
            title="Preview Article"
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>

          <button
            className="btn-secondary"
            disabled={loading}
            onClick={() => handleSubmit("draft")}
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>

          <button
            className="btn-primary"
            disabled={loading}
            onClick={() => handleSubmit("published")}
          >
            <Send size={16} />
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Menu Bar & Rich-Text Toolbar */}
      <div className="blog-editor-toolbar-section">
        {/* Menu Bar Tabs */}
        <nav className="editor-menu-bar">
          {/* File Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "file" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}
            >
              File <ChevronDown size={12} />
            </button>
            {activeMenu === "file" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); handleSubmit("draft"); }}>
                  <Save size={14} /> Save Draft
                </button>
                <button onClick={() => { setActiveMenu(null); handleSubmit("published"); }}>
                  <Send size={14} /> Publish Article
                </button>
                <button onClick={() => { setActiveMenu(null); setShowPreviewModal(true); }}>
                  <Eye size={14} /> Preview Article
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { setActiveMenu(null); setShowSeoModal(true); }}>
                  <Settings size={14} /> Post & SEO Settings
                </button>
                <button onClick={() => { setActiveMenu(null); navigate("/content"); }}>
                  <ArrowLeft size={14} /> Exit Editor
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "edit" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "edit" ? null : "edit")}
            >
              Edit <ChevronDown size={12} />
            </button>
            {activeMenu === "edit" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); execCommand("undo"); }}>
                  <Undo size={14} /> Undo
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("redo"); }}>
                  <Redo size={14} /> Redo
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { setActiveMenu(null); execCommand("selectAll"); }}>
                  Select All
                </button>
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    if (editorRef.current && window.confirm("Clear all editor content?")) {
                      editorRef.current.innerHTML = "";
                      handleEditorInput();
                    }
                  }}
                >
                  <Trash2 size={14} /> Clear Content
                </button>
              </div>
            )}
          </div>

          {/* Insert Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "insert" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "insert" ? null : "insert")}
            >
              Insert <ChevronDown size={12} />
            </button>
            {activeMenu === "insert" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); setShowMediaLibrary(true); }}>
                  <ImageIcon size={14} /> Insert Image from Media
                </button>
                <button onClick={() => { setActiveMenu(null); handlePromptVideo(); }}>
                  <Video size={14} /> Insert Video Embed
                </button>
                <button onClick={() => { setActiveMenu(null); handlePromptLink(); }}>
                  <LinkIcon size={14} /> Insert Link
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { setActiveMenu(null); execCommand("insertHorizontalRule"); }}>
                  <Minus size={14} /> Horizontal Divider
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("formatBlock", "blockquote"); }}>
                  <Quote size={14} /> Blockquote
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("formatBlock", "pre"); }}>
                  <Code size={14} /> Code Block
                </button>
              </div>
            )}
          </div>

          {/* Format Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "format" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "format" ? null : "format")}
            >
              Format <ChevronDown size={12} />
            </button>
            {activeMenu === "format" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); execCommand("bold"); }}>
                  <Bold size={14} /> Bold
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("italic"); }}>
                  <Italic size={14} /> Italic
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("underline"); }}>
                  <Underline size={14} /> Underline
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("strikeThrough"); }}>
                  <Strikethrough size={14} /> Strikethrough
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { setActiveMenu(null); execCommand("formatBlock", "p"); }}>
                  Paragraph
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("formatBlock", "h1"); }}>
                  Heading 1
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("formatBlock", "h2"); }}>
                  Heading 2
                </button>
                <button onClick={() => { setActiveMenu(null); execCommand("formatBlock", "h3"); }}>
                  Heading 3
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { setActiveMenu(null); saveSelection(); setShowTextColorPicker(true); }}>
                  <Palette size={14} /> Text Color
                </button>
                <button onClick={() => { setActiveMenu(null); saveSelection(); setShowHighlightPicker(true); }}>
                  <Highlighter size={14} /> Highlight Color
                </button>
                <button onClick={() => { setActiveMenu(null); handleClearFormatting(); }}>
                  <Eraser size={14} /> Clear Formatting
                </button>
                <button onClick={() => { setActiveMenu(null); handleDeleteSelection(); }}>
                  <Trash2 size={14} /> Delete Selected Content
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "tools" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "tools" ? null : "tools")}
            >
              Tools <ChevronDown size={12} />
            </button>
            {activeMenu === "tools" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); alert(`Word Count: ${wordCount}\nCharacter Count: ${charCount}`); }}>
                  <FileText size={14} /> Word & Character Count
                </button>
                <button onClick={() => { setActiveMenu(null); handleTitleChange(title); }}>
                  <Sparkles size={14} /> Regenerate Slug from Title
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "view" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "view" ? null : "view")}
            >
              View <ChevronDown size={12} />
            </button>
            {activeMenu === "view" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); setShowMediaLibrary(!showMediaLibrary); }}>
                  <ImageIcon size={14} /> Toggle Media Library
                </button>
                <button onClick={() => { setActiveMenu(null); setShowSeoModal(true); }}>
                  <Settings size={14} /> Toggle Post Settings
                </button>
                <button onClick={() => { setActiveMenu(null); setShowPreviewModal(true); }}>
                  <Maximize2 size={14} /> Fullscreen Preview
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="editor-menu-item">
            <button
              className={`menu-btn ${activeMenu === "help" ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "help" ? null : "help")}
            >
              Help <ChevronDown size={12} />
            </button>
            {activeMenu === "help" && (
              <div className="menu-dropdown">
                <button onClick={() => { setActiveMenu(null); setShowHelpModal(true); }}>
                  <HelpCircle size={14} /> Keyboard Shortcuts & Tips
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Action Icon Formatting Toolbar */}
        <div className="editor-formatting-toolbar">
          {/* History */}
          <button className="tb-btn" onClick={() => execCommand("undo")} title="Undo (Ctrl+Z)">
            <Undo size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("redo")} title="Redo (Ctrl+Y)">
            <Redo size={15} />
          </button>

          <span className="tb-divider"></span>

          {/* Heading Style Selector */}
          <select
            className="tb-select"
            defaultValue="p"
            onChange={(e) => execCommand("formatBlock", e.target.value)}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Blockquote</option>
            <option value="pre">Code Block</option>
          </select>

          <span className="tb-divider"></span>

          {/* Formatting */}
          <button className="tb-btn" onClick={() => execCommand("bold")} title="Bold (Ctrl+B)">
            <Bold size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("italic")} title="Italic (Ctrl+I)">
            <Italic size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("underline")} title="Underline (Ctrl+U)">
            <Underline size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("strikeThrough")} title="Strikethrough">
            <Strikethrough size={15} />
          </button>

          <span className="tb-divider"></span>

          {/* Text Color Picker */}
          <div className="color-picker-popover-container">
            <button
              className={`tb-btn ${showTextColorPicker ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                saveSelection();
                setShowTextColorPicker(!showTextColorPicker);
                setShowHighlightPicker(false);
              }}
              title="Text Color"
            >
              <Palette size={15} style={{ color: selectedTextColor !== "#000000" ? selectedTextColor : "currentColor" }} />
            </button>
            {showTextColorPicker && (
              <div className="color-palette-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="palette-header">Text Color</div>
                <div className="color-grid">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      className="color-swatch"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      onClick={() => applyTextColor(c.hex)}
                    />
                  ))}
                </div>
                <div className="custom-color-row">
                  <label>Custom Color:</label>
                  <input
                    type="color"
                    value={selectedTextColor}
                    onChange={(e) => applyTextColor(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="color-picker-popover-container">
            <button
              className={`tb-btn ${showHighlightPicker ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                saveSelection();
                setShowHighlightPicker(!showHighlightPicker);
                setShowTextColorPicker(false);
              }}
              title="Highlight Color"
            >
              <Highlighter size={15} style={{ backgroundColor: selectedHighlightColor !== "transparent" ? selectedHighlightColor : "transparent", borderRadius: "2px" }} />
            </button>
            {showHighlightPicker && (
              <div className="color-palette-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="palette-header">Highlight Color</div>
                <div className="color-grid">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      className={`color-swatch ${c.hex === "transparent" ? "transparent-swatch" : ""}`}
                      style={{ backgroundColor: c.hex === "transparent" ? "#ffffff" : c.hex }}
                      title={c.name}
                      onClick={() => applyHighlightColor(c.hex)}
                    >
                      {c.hex === "transparent" && <X size={10} style={{ color: "#dc2626" }} />}
                    </button>
                  ))}
                </div>
                <button className="remove-highlight-btn" onClick={() => applyHighlightColor("transparent")}>
                  <X size={12} /> Remove Highlight
                </button>
              </div>
            )}
          </div>

          <span className="tb-divider"></span>

          {/* Clear Formatting & Delete Content */}
          <button className="tb-btn" onClick={handleClearFormatting} title="Clear Formatting (Remove styles without deleting text)">
            <Eraser size={15} />
          </button>
          <button className="tb-btn danger" onClick={handleDeleteSelection} title="Delete Selected Content (Remove selected text or element)">
            <Trash2 size={15} />
          </button>

          <span className="tb-divider"></span>

          {/* Alignments */}
          <button className="tb-btn" onClick={() => execCommand("justifyLeft")} title="Align Left">
            <AlignLeft size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("justifyCenter")} title="Align Center">
            <AlignCenter size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("justifyRight")} title="Align Right">
            <AlignRight size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("justifyFull")} title="Justify">
            <AlignJustify size={15} />
          </button>


          <span className="tb-divider"></span>

          {/* Lists */}
          <button className="tb-btn" onClick={() => execCommand("insertUnorderedList")} title="Bulleted List">
            <List size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("insertOrderedList")} title="Numbered List">
            <ListOrdered size={15} />
          </button>

          <span className="tb-divider"></span>

          {/* Blocks */}
          <button className="tb-btn" onClick={() => execCommand("formatBlock", "blockquote")} title="Blockquote">
            <Quote size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("formatBlock", "pre")} title="Code Block">
            <Code size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("insertHorizontalRule")} title="Horizontal Line">
            <Minus size={15} />
          </button>

          <span className="tb-divider"></span>

          {/* Links & Media */}
          <button className="tb-btn" onClick={handlePromptLink} title="Insert Link">
            <LinkIcon size={15} />
          </button>
          <button className="tb-btn" onClick={() => execCommand("unlink")} title="Remove Link">
            <Unlink size={15} />
          </button>
          <button
            className="tb-btn"
            onClick={() => {
              saveSelection();
              setShowMediaLibrary(true);
            }}
            title="Insert Image"
          >
            <ImageIcon size={15} />
          </button>
          <button
            className="tb-btn"
            onClick={() => {
              saveSelection();
              handlePromptVideo();
            }}
            title="Insert Video"
          >
            <Video size={15} />
          </button>
        </div>
      </div>

      {/* Main Content Workspace & Side Panel Layout */}
      <div className="blog-editor-workspace">
        {/* Main Writing Canvas */}
        <main className="editor-canvas-area">
          <div
            ref={canvasCardRef}
            className="canvas-card"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedImage(null);
                if (editorRef.current) {
                  editorRef.current.focus();
                }
              }
            }}
          >
            {/* Featured Image Banner Display if assigned */}
            {featuredImage && (
              <div className="featured-image-banner">
                <img src={featuredImage} alt="Featured" />
                <button
                  className="remove-featured-btn"
                  onClick={() => setFeaturedImage("")}
                  title="Remove Featured Image"
                >
                  <X size={14} /> Remove Banner
                </button>
              </div>
            )}

            {/* Editable Content Canvas */}
            <div
              ref={editorRef}
              className="blog-canvas-editable"
              contentEditable={true}
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === "IMG") {
                  e.stopPropagation();
                  setSelectedImage(target as HTMLImageElement);
                }
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === "IMG") {
                  e.stopPropagation();
                  setSelectedImage(target as HTMLImageElement);
                } else if (
                  !target.closest(".image-properties-toolbar") &&
                  !target.closest(".image-resize-box")
                ) {
                  setSelectedImage(null);
                }
              }}
              onDragStart={(e) => {
                if ((e.target as HTMLElement).tagName === "IMG") {
                  e.preventDefault();
                }
              }}
              onInput={handleEditorInput}
              onKeyUp={handleEditorInput}
              onBlur={saveSelection}
              onMouseUp={saveSelection}
              data-placeholder="Start writing your article content here..."
              suppressContentEditableWarning={true}
            />

            {/* Resizable Image Overlay & Toolbar */}
            {selectedImage && (
              <ImageResizeOverlay
                image={selectedImage}
                canvasCard={canvasCardRef.current}
                editorContainer={editorRef.current}
                onUpdate={handleEditorInput}
                onDeselect={() => setSelectedImage(null)}
              />
            )}
          </div>
        </main>

        {/* Collapsible Right Media Library Panel */}
        {showMediaLibrary && (
          <aside className="media-library-sidebar">
            <div className="sidebar-header">
              <h3>
                <ImageIcon size={17} /> Media Library
              </h3>
              <button
                className="close-sidebar-btn"
                onClick={() => setShowMediaLibrary(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sidebar-controls">
              <div className="search-box">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                hidden
              />

              <button
                className="upload-media-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaUploading}
              >
                <Upload size={14} />
                <span>{mediaUploading ? "Uploading..." : "Upload Media"}</span>
              </button>
            </div>

            <div className="media-grid-container">
              {mediaLoading ? (
                <div className="media-empty">Loading media...</div>
              ) : filteredMedia.length === 0 ? (
                <div className="media-empty">
                  <p>No media found.</p>
                </div>
              ) : (
                <div className="media-grid-sidebar">
                  {filteredMedia.map((item) => {
                    const itemUrl = item.url.startsWith("http")
                      ? item.url
                      : `${API_URL}${item.url}`;
                    const isFeatured = featuredImage === itemUrl;

                    return (
                      <div className="media-card-sm" key={item._id}>
                        <div className="media-preview-box">
                          {item.type === "image" ? (
                            <img src={itemUrl} alt={item.originalName} />
                          ) : (
                            <video src={itemUrl} />
                          )}
                          {isFeatured && (
                            <span className="featured-badge" title="Featured Image">
                              <Check size={12} />
                            </span>
                          )}
                        </div>

                        <div className="media-card-title">{item.originalName}</div>

                        <div className="media-card-actions">
                          <button
                            className="btn-action-sm insert"
                            onClick={() => insertMediaToEditor(item)}
                            title="Insert to Editor"
                          >
                            Insert
                          </button>
                          {item.type === "image" && (
                            <button
                              className={`btn-action-sm featured ${isFeatured ? "active" : ""}`}
                              onClick={() => handleSetFeatured(item)}
                              title="Set Featured Image"
                            >
                              {isFeatured ? "Featured" : "Set Featured"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="blog-editor-footer">
        <div className="footer-left">
          <span>Words: <strong>{wordCount}</strong></span>
          <span className="footer-dot">•</span>
          <span>Characters: <strong>{charCount}</strong></span>
          <span className="footer-dot">•</span>
          <span>Est. Read: <strong>~{Math.max(1, Math.ceil(wordCount / 200))} min</strong></span>
        </div>

        <div className="footer-right">
          <span>Status: <strong>{status === "published" ? "Published" : "Draft"}</strong></span>
        </div>
      </footer>

      {/* SEO & Post Settings Modal */}
      {showSeoModal && (
        <div className="editor-modal-overlay" onClick={() => setShowSeoModal(false)}>
          <div className="editor-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Settings size={18} /> Blog Post & SEO Settings
              </h2>
              <button onClick={() => setShowSeoModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Post Settings */}
              <div className="settings-section">
                <h3>General Settings</h3>

                <div className="form-group">
                  <label>URL Slug</label>
                  <div className="slug-input-group">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsSlugAuto(false);
                      }}
                      placeholder="post-url-slug"
                    />
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => {
                        setIsSlugAuto(true);
                        handleTitleChange(title);
                      }}
                    >
                      Auto-generate
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Content Type</label>
                  <input type="text" value="Blog Post" disabled />
                </div>

                <div className="form-group">
                  <label>Featured Image URL</label>
                  <div className="featured-image-picker">
                    <input
                      type="text"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="http://..."
                    />
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => {
                        setShowSeoModal(false);
                        setShowMediaLibrary(true);
                      }}
                    >
                      Select Media
                    </button>
                  </div>
                  {featuredImage && (
                    <div className="featured-preview-thumb">
                      <img src={featuredImage} alt="Featured preview" />
                      <button onClick={() => setFeaturedImage("")}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Settings */}
              <div className="settings-section">
                <h3>SEO Meta Tags</h3>

                <div className="form-group">
                  <label>Meta Title ({metaTitle.length}/60)</label>
                  <input
                    type="text"
                    placeholder="SEO Title (e.g. Complete Guide to CMS)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Meta Description ({metaDescription.length}/160)</label>
                  <textarea
                    rows={3}
                    placeholder="Brief summary of the blog article for search engines..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowSeoModal(false)}>
                Done & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="editor-modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div className="preview-meta">
                <span className="badge-preview">Live Preview</span>
                <h2>{title || "Untitled Blog Post"}</h2>
              </div>
              <button onClick={() => setShowPreviewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="preview-modal-body">
              {featuredImage && (
                <div className="preview-hero-image">
                  <img src={featuredImage} alt={title} />
                </div>
              )}

              <div className="preview-author-bar">
                <span>Written by <strong>Admin Author</strong></span>
                <span>•</span>
                <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span>•</span>
                <span>{wordCount} words</span>
              </div>

              <div
                className="preview-article-body"
                dangerouslySetInnerHTML={{ __html: content || "<p><em>No content entered yet.</em></p>" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help & Shortcuts Modal */}
      {showHelpModal && (
        <div className="editor-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="editor-modal-content sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><HelpCircle size={18} /> Editor Tips & Shortcuts</h2>
              <button onClick={() => setShowHelpModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <ul className="help-list">
                <li><strong>Ctrl + B</strong> — Bold text</li>
                <li><strong>Ctrl + I</strong> — Italic text</li>
                <li><strong>Ctrl + U</strong> — Underline text</li>
                <li><strong>Ctrl + Z / Ctrl + Y</strong> — Undo / Redo</li>
                <li><strong>Media Sidebar:</strong> Click "Media" button on top right to upload or select images and videos directly.</li>
                <li><strong>Featured Image:</strong> Set any uploaded image as featured banner image.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHelpModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogEditor;
