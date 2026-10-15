import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  Image as ImageIcon,
  Search,
  Check,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import "./MediaPickerModal.css";

interface MediaItem {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentValue?: string;
  title?: string;
}

const API_BASE = "http://localhost:5000";

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentValue = "",
  title = "Select Image from Media Library",
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customUrl, setCustomUrl] = useState(currentValue);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomUrl(currentValue);
      fetchMedia();
    }
  }, [isOpen, currentValue]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/media`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load media items from server");
      }

      const data = await res.json();
      const items = data.media || data;
      if (Array.isArray(items)) {
        // Filter only images
        setMediaItems(items.filter((item) => item.type === "image" || !item.type));
      } else {
        setMediaItems([]);
      }
    } catch (err: any) {
      console.error("Fetch media error:", err);
      setError(err.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image file");
      }

      const newMedia = data.media;
      const fullUrl = newMedia.url.startsWith("http")
        ? newMedia.url
        : `${API_BASE}${newMedia.url}`;

      // Refresh list and select the uploaded image
      onSelectImage(fullUrl);
      onClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectMediaItem = (item: MediaItem) => {
    const fullUrl = item.url.startsWith("http")
      ? item.url
      : `${API_BASE}${item.url}`;
    onSelectImage(fullUrl);
    onClose();
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredMedia = mediaItems.filter((item) =>
    (item.originalName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <div className="media-picker-backdrop" onClick={onClose}>
      <div className="media-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="media-picker-header">
          <div className="media-picker-title">
            <ImageIcon size={20} />
            <h3>{title}</h3>
          </div>
          <button
            type="button"
            className="media-picker-close-btn"
            onClick={onClose}
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="media-picker-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Custom URL Option */}
        <form onSubmit={handleApplyCustomUrl} className="media-custom-url-form">
          <div className="custom-url-input-wrap">
            <LinkIcon size={16} />
            <input
              type="url"
              placeholder="Or paste external image URL (e.g. Unsplash, CDN)..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="apply-custom-url-btn"
            disabled={!customUrl.trim()}
          >
            Apply URL
          </button>
        </form>

        <div className="media-picker-toolbar">
          <div className="media-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search uploaded media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="media-upload-action-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={15} />
            {uploading ? "Uploading..." : "Upload New File"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <div className="media-picker-grid-container">
          {loading ? (
            <div className="media-picker-loading">
              <div className="media-spinner" />
              <p>Loading media library items...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="media-picker-empty">
              <ImageIcon size={40} />
              <h4>No images found</h4>
              <p>
                {searchQuery
                  ? "No images matched your search term."
                  : "Upload an image above or paste an image URL."}
              </p>
            </div>
          ) : (
            <div className="media-picker-grid">
              {filteredMedia.map((item) => {
                const fullUrl = item.url.startsWith("http")
                  ? item.url
                  : `${API_BASE}${item.url}`;
                const isSelected = currentValue === fullUrl;

                return (
                  <button
                    key={item._id}
                    type="button"
                    className={`media-picker-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectMediaItem(item)}
                    title={item.originalName}
                  >
                    <div className="media-card-thumb">
                      <img
                        src={fullUrl}
                        alt={item.originalName}
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="media-card-selected-badge">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <span className="media-card-name">
                      {item.originalName || item.filename}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
