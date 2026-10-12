import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Globe,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";
import "./Content.css";

interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  type: "post" | "page";
  status: "draft" | "published";
  author: string;
  createdAt: string;
}

function Content() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusFilter = searchParams.get("status");
  const typeFilter = searchParams.get("type");

  useEffect(() => {
    fetchContents();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchContents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/content",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch content");
      }

      setContents(data.contents || data);
    } catch (err) {
      console.error("Failed to fetch contents:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load contents"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/content/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete content");
      }

      setContents((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete content error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete content"
      );
    }
  };

  const filteredContents = contents.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (typeFilter && item.type !== typeFilter) return false;
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.slug && item.slug.toLowerCase().includes(search))
    );
  });

  return (
    <div className="content-page">
      <div className="content-header">
        <div>
          <button
            type="button"
            className="content-back-to-dashboard"
            onClick={() => navigate("/dashboard")}
            style={{
              background: "transparent",
              border: "none",
              color: "#4f46e5",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              padding: 0,
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ← Back to Dashboard
          </button>
          <h1>
            {statusFilter === "draft"
              ? "Draft Contents"
              : typeFilter === "page"
                ? "Pages"
                : "All Contents"}
          </h1>
          <p>
            {statusFilter === "draft"
              ? "View and manage your draft posts and pages."
              : typeFilter === "page"
                ? "View and manage standalone pages created in Nexus CMS."
                : "Manage all your posts, pages, and digital experiences."}
          </p>
        </div>

        <div className="create-content-actions">
          <button
            className="create-blog-button"
            onClick={() =>
              navigate("/content/create")
            }
          >
            <Plus size={17} />
            Create Blog
          </button>

          <button
            className="create-page-button"
            onClick={() =>
              navigate("/content/create-page")
            }
          >
            <Globe size={17} />
            Create Page
          </button>
        </div>
      </div>

      {error && <div className="content-error-banner">{error}</div>}

      <div className="content-toolbar">
        <div className="content-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-table-card">
        {loading ? (
          <div className="content-empty">
            Loading content...
          </div>
        ) : contents.length === 0 ? (
          <div className="content-empty">
            <FileText size={36} />

            <h3>No content yet</h3>

            <p>
              Create your first post or page to get started.
            </p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="content-empty">
            <FileText size={36} />

            <h3>No matching content found</h3>

            <p>
              No posts or pages match "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className="content-table">
            <div className="content-table-header">
              <span>Title</span>
              <span>Type</span>
              <span>Status</span>
              <span>Created</span>
              <span></span>
            </div>

            {filteredContents.map((item) => (
              <div
                className="content-table-row"
                key={item._id}
              >
                <div className="content-title">
                  <FileText size={17} />
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.slug}</small>
                  </div>
                </div>

                <div className="content-type">
                  {item.type === "post" ? (
                    <>
                      <FileText size={15} />
                      Post
                    </>
                  ) : (
                    <>
                      <Globe size={15} />
                      Page
                    </>
                  )}
                </div>

                <div>
                  <span
                    className={`status-badge ${item.status}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="content-date">
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}
                </div>

                <div className="action-menu-container">
                  <button
                    className="content-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === item._id ? null : item._id
                      );
                    }}
                    title="Actions"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === item._id && (
                    <div
                      className="content-action-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="action-dropdown-item"
                        onClick={() => {
                          setOpenMenuId(null);
                          if (item.type === "page") {
                            navigate(`/content/edit-page/${item._id}`);
                          } else {
                            navigate(`/content/edit/${item._id}`);
                          }
                        }}
                      >
                        <Pencil size={15} />
                        <span>Edit</span>
                      </button>

                      <button
                        className="action-dropdown-item delete-item"
                        onClick={() => handleDelete(item._id, item.title)}
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Content;