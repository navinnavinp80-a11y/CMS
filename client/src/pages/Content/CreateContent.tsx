import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Send,
} from "lucide-react";
import "./CreateContent.css";

function CreateContent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    publishStatus: "draft" | "published"
  ) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            slug,
            content,
            type: "post",
            status: publishStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create blog"
        );
      }

      navigate("/content");
    } catch (error) {
      console.error("Create blog error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog-page">

      {/* Header */}
      <div className="create-blog-header">

        <div className="header-title-area">
          <button
            className="back-button"
            onClick={() => navigate("/content")}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1>Create Blog</h1>
            <p>
              Write and publish a new blog article.
            </p>
          </div>
        </div>

        <div className="header-actions">

          <button
            className="draft-button"
            disabled={loading}
            onClick={() => {
              setStatus("draft");
              handleSubmit("draft");
            }}
          >
            <Save size={17} />
            Save Draft
          </button>

          <button
            className="publish-button"
            disabled={loading}
            onClick={() => {
              setStatus("published");
              handleSubmit("published");
            }}
          >
            <Send size={17} />
            Publish
          </button>

        </div>
      </div>

      {error && (
        <div className="create-blog-error">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="create-blog-layout">

        {/* Main Editor */}
        <div className="blog-editor">

          {/* Title */}
          <div className="blog-title-section">
            <input
              type="text"
              className="blog-title-input"
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          {/* Slug */}
          <div className="blog-slug-section">
            <label>Slug</label>

            <input
              type="text"
              placeholder="your-blog-slug"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value)
              }
            />
          </div>

          {/* Featured Image */}
          <div className="featured-image-section">

            <label>Featured Image</label>

            <div className="featured-image-box">

              <ImageIcon size={28} />

              <h3>Add a featured image</h3>

              <p>
                Select an image from your media library.
              </p>

              <button type="button">
                Select Image
              </button>

            </div>

          </div>

          {/* Content Editor */}
          <div className="blog-content-section">

            <label>Content</label>

            <div className="editor-toolbar">

              <button type="button">
                B
              </button>

              <button type="button">
                I
              </button>

              <button type="button">
                H1
              </button>

              <button type="button">
                H2
              </button>

              <button type="button">
                • List
              </button>

              <button type="button">
                Link
              </button>

            </div>

            <textarea
              className="blog-content-editor"
              placeholder="Start writing your blog..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
            />

          </div>

        </div>

        {/* Right Sidebar */}
        <aside className="blog-settings">

          {/* Publishing */}
          <div className="settings-card">

            <h2>Publishing</h2>

            <div className="settings-group">

              <label>Status</label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "draft"
                      | "published"
                  )
                }
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>
              </select>

            </div>

            <div className="settings-group">

              <label>Content Type</label>

              <div className="content-type-display">
                Blog Post
              </div>

            </div>

          </div>

          {/* SEO */}
          <div className="settings-card">

            <h2>SEO</h2>

            <div className="settings-group">

              <label>Meta Title</label>

              <input
                type="text"
                placeholder="SEO title"
              />

            </div>

            <div className="settings-group">

              <label>Meta Description</label>

              <textarea
                rows={4}
                placeholder="SEO description"
              />

            </div>

          </div>

        </aside>

      </div>
    </div>
  );
}

export default CreateContent;