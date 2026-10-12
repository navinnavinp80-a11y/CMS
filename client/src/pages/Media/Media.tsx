import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  X,
} from "lucide-react";
import "./Media.css";

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: "image" | "video";
  createdAt?: string;
}

const API_URL = "http://localhost:5000";

function Media() {
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] =
    useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/media`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch media"
        );
      }

      const media = data.media || data;

      setMediaItems(media);
    } catch (error) {
      console.error("Fetch media error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load media"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/media/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload file"
        );
      }

      await fetchMedia();
    } catch (error) {
      console.error("Upload media error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload media"
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this media?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/media/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete media"
        );
      }

      setMediaItems((previous) =>
        previous.filter(
          (item) => item._id !== id
        )
      );

      if (previewImage?._id === id) {
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("Delete media error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete media"
      );
    }
  };

  return (
    <div className="media-page">

      {/* Header */}
      <div className="media-header">

        <div>
          <button
            type="button"
            className="media-back-to-dashboard"
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
          <h1>Media Library</h1>

          <p>
            Upload and manage your images and media files.
          </p>
        </div>

        <div className="media-header-actions">

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            hidden
          />

          <button
            className="upload-media-button"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <Upload size={17} />

            {uploading
              ? "Uploading..."
              : "Upload Media"}
          </button>

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="media-error">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="media-summary">

        <div className="media-summary-card">

          <div className="media-summary-icon">
            <ImageIcon size={19} />
          </div>

          <div>
            <span>Total Media</span>
            <strong>{mediaItems.length}</strong>
          </div>

        </div>

      </div>

      {/* Media Content */}
      <div className="media-content-card">

        <div className="media-content-header">

          <div>
            <h2>All Media</h2>

            <p>
              Your uploaded images and videos.
            </p>
          </div>

        </div>

        {loading ? (
          <div className="media-page-empty">
            Loading media...
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="media-page-empty">

            <div className="empty-media-icon">
              <ImageIcon size={34} />
            </div>

            <h3>No media yet</h3>

            <p>
              Upload your first image or video to
              get started.
            </p>

            <button
              className="empty-upload-button"
              onClick={handleUploadClick}
            >
              <Upload size={16} />
              Upload Media
            </button>

          </div>
        ) : (
          <div className="media-grid-page">

            {mediaItems.map((media) => {

              const mediaUrl =
                `${API_URL}${media.url}`;

              return (
                <div
                  className="media-card"
                  key={media._id}
                >

                  <button
                    className="media-preview"
                    onClick={() =>
                      media.type === "image" &&
                      setPreviewImage(media)
                    }
                  >
                    {media.type === "image" ? (
                      <img
                        src={mediaUrl}
                        alt={media.originalName}
                      />
                    ) : (
                      <video
                        src={mediaUrl}
                        muted
                      />
                    )}
                  </button>

                  <div className="media-card-info">

                    <div className="media-file-name">
                      {media.originalName}
                    </div>

                    <div className="media-file-type">
                      {media.type}
                    </div>

                  </div>

                  <button
                    className="delete-media-button"
                    title="Delete media"
                    onClick={() =>
                      handleDelete(media._id)
                    }
                  >
                    <Trash2 size={15} />
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() =>
            setPreviewImage(null)
          }
        >

          <div
            className="image-preview-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="image-preview-header">

              <div>
                <h2>
                  {previewImage.originalName}
                </h2>
              </div>

              <button
                onClick={() =>
                  setPreviewImage(null)
                }
              >
                <X size={19} />
              </button>

            </div>

            <div className="image-preview-body">

              <img
                src={`${API_URL}${previewImage.url}`}
                alt={previewImage.originalName}
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Media;