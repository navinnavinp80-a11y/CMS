import React from "react";
import { AlertCircle, X } from "lucide-react";
import "./TemplateConfirmModal.css";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  targetPageName?: string;
  onClose: () => void;
  onConfirmDiscard: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  targetPageName,
  onClose,
  onConfirmDiscard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <div className="template-header-icon-wrap" style={{ background: "#fee2e2" }}>
            <AlertCircle size={22} style={{ color: "#dc2626" }} />
          </div>

          <button className="template-modal-close" onClick={onClose} title="Cancel">
            <X size={18} />
          </button>
        </div>

        <div className="template-modal-content">
          <h3>Unsaved Changes</h3>
          <p>
            You have unsaved changes on the current page. If you switch to{" "}
            <strong>"{targetPageName || "another page"}"</strong> without saving, your edits will be lost.
          </p>

          <div className="template-warning-box">
            <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
            <span>
              To keep your changes, click <strong>Keep Editing</strong> and save your draft first.
            </span>
          </div>
        </div>

        <div className="template-modal-actions">
          <button type="button" className="template-btn-cancel" onClick={onClose}>
            Keep Editing
          </button>

          <button
            type="button"
            className="template-btn-confirm"
            style={{ background: "#dc2626", borderColor: "#dc2626" }}
            onClick={onConfirmDiscard}
          >
            Discard Changes & Switch
          </button>
        </div>
      </div>
    </div>
  );
};
