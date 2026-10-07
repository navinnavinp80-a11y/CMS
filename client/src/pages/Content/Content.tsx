import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Globe,
  MoreVertical,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContents();
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
    } catch (error) {
      console.error("Failed to fetch contents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-page">
      <div className="content-header">
        <div>
          <h1>Content</h1>
          <p>Manage your posts and pages.</p>
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

      <div className="content-toolbar">
        <div className="content-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search content..."
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
        ) : (
          <div className="content-table">
            <div className="content-table-header">
              <span>Title</span>
              <span>Type</span>
              <span>Status</span>
              <span>Created</span>
              <span></span>
            </div>

            {contents.map((item) => (
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

                <button
  className="content-more"
  onClick={() => {
    if (item.type === "page") {
      navigate(`/content/edit-page/${item._id}`);
    } else {
      navigate(`/content/edit/${item._id}`);
    }
  }}
  title={item.type === "page" ? "Edit Page" : "Edit Post"}
>
  <MoreVertical size={18} />
</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Content;