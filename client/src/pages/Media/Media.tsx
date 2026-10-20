import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  X,
  FileCheck,
} from "lucide-react";
import AdminLayout from "../../components/Layout/AdminLayout";
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

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='%23F1F5F9' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3e%3ccircle cx='8.5' cy='8.5' r='1.5'/%3e%3cpolyline points='21 15 16 10 5 21'/%3e%3c/svg%3e";

export default function Media() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/media`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
        throw new Error(data.message || "Failed to fetch media");
      }

      const media = data.media || data;
      setMediaItems(Array.isArray(media) ? media : []);
    } catch (err: any) {
      console.error("Fetch media error:", err);
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
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
        throw new Error(data.message || "Failed to upload file");
      }

      await fetchMedia();
    } catch (err: any) {
      console.error("Upload media error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload media");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this media item?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/media/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete media");
      }

      setMediaItems((prev) => prev.filter((item) => item._id !== id));
      if (previewImage?._id === id) {
        setPreviewImage(null);
      }
    } catch (err: any) {
      console.error("Delete media error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete media");
    }
  };

  const imagesCount = mediaItems.filter((m) => m.type === "image").length;
  const videosCount = mediaItems.filter((m) => m.type === "video").length;

  return (
    <AdminLayout>
      <div className="media-page-wrapper">
        {/* Header */}
        <div className="media-page-header">
          <div className="media-title-group">
            <h1>Media Library</h1>
            <p>Upload, organize, and manage your imagery and video assets.</p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              hidden
            />
            <button
              type="button"
              className="cms-btn-primary"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              <Upload size={16} />
              <span>{uploading ? "Uploading..." : "Upload Media"}</span>
            </button>
          </div>
        </div>

        {error && <div className="content-error-banner">{error}</div>}

        {/* 3 Metric Summary Cards */}
        <div className="media-metrics-grid">
          <div className="media-metric-card">
            <div className="media-metric-icon blue">
              <FileCheck size={20} />
            </div>
            <div className="media-metric-info">
              <span className="media-metric-label">Total Files</span>
              <span className="media-metric-val">{mediaItems.length}</span>
            </div>
          </div>

          <div className="media-metric-card">
            <div className="media-metric-icon purple">
              <ImageIcon size={20} />
            </div>
            <div className="media-metric-info">
              <span className="media-metric-label">Images</span>
              <span className="media-metric-val">{imagesCount}</span>
            </div>
          </div>

          <div className="media-metric-card">
            <div className="media-metric-icon green">
              <Video size={20} />
            </div>
            <div className="media-metric-info">
              <span className="media-metric-label">Videos</span>
              <span className="media-metric-val">{videosCount}</span>
            </div>
          </div>
        </div>

        {/* Media Container Card */}
        <div className="media-container-card">
          <div className="media-card-topbar">
            <h2 className="media-card-title">All Assets ({mediaItems.length})</h2>
          </div>

          {loading ? (
            <div className="content-empty-state">
              <div className="empty-icon-box">
                <ImageIcon size={28} />
              </div>
              <h3>Loading media...</h3>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="content-empty-state">
              <div className="empty-icon-box">
                <ImageIcon size={28} />
              </div>
              <h3>No media files yet</h3>
              <p>Upload high-resolution images or videos to use them in your blog posts and page sections.</p>
              <button
                type="button"
                className="cms-btn-primary"
                onClick={handleUploadClick}
              >
                <Upload size={16} />
                <span>Upload Media</span>
              </button>
            </div>
          ) : (
            <div className="media-items-grid">
              {mediaItems.map((media) => {
                const mediaUrl = `${API_URL}${media.url}`;
                return (
                  <div className="media-item-box" key={media._id}>
                    <button
                      type="button"
                      className="media-thumbnail-btn"
                      onClick={() =>
                        media.type === "image" && setPreviewImage(media)
                      }
                      title="Preview Media"
                    >
                      {media.type === "image" ? (
                        <img
                          src={mediaUrl}
                          alt={media.originalName}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                      ) : (
                        <video src={mediaUrl} muted />
                      )}
                    </button>

                    <div className="media-item-meta">
                      <div className="media-meta-text">
                        <span className="media-filename" title={media.originalName}>
                          {media.originalName}
                        </span>
                        <span className="media-type-tag">{media.type}</span>
                      </div>

                      <button
                        type="button"
                        className="media-delete-btn"
                        title="Delete Asset"
                        onClick={() => handleDelete(media._id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {previewImage && (
          <div
            className="image-preview-overlay"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="image-preview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="image-preview-header">
                <h2>{previewImage.originalName}</h2>
                <button
                  type="button"
                  className="image-preview-close"
                  onClick={() => setPreviewImage(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="image-preview-body">
                <img
                  src={`${API_URL}${previewImage.url}`}
                  alt={previewImage.originalName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}