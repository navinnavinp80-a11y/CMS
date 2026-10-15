import React, { useState } from "react";
import { Image as ImageIcon, Trash2, FolderOpen } from "lucide-react";
import { MediaPickerModal } from "./MediaPickerModal";

interface ImageInputControlProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export const ImageInputControl: React.FC<ImageInputControlProps> = ({
  label,
  value,
  onChange,
  helperText,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="image-input-control-group">
      <div className="image-control-header">
        <label>{label}</label>
        {value && (
          <button
            type="button"
            className="image-control-remove-btn"
            onClick={() => onChange("")}
            title="Remove image"
          >
            <Trash2 size={13} /> Remove
          </button>
        )}
      </div>

      {value ? (
        <div className="image-control-preview-card">
          <div className="image-control-thumb">
            <img src={value} alt={label} />
          </div>
          <div className="image-control-actions">
            <span className="image-control-url" title={value}>
              {value}
            </span>
            <button
              type="button"
              className="image-control-replace-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <FolderOpen size={14} /> Replace Image
            </button>
          </div>
        </div>
      ) : (
        <div
          className="image-control-empty-box"
          onClick={() => setIsModalOpen(true)}
        >
          <ImageIcon size={22} />
          <span>Choose or Upload Image</span>
          <button
            type="button"
            className="image-control-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            Media Library
          </button>
        </div>
      )}

      {helperText && <span className="settings-field-helper">{helperText}</span>}

      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={(newUrl) => onChange(newUrl)}
        currentValue={value}
        title={`Select ${label}`}
      />
    </div>
  );
};
