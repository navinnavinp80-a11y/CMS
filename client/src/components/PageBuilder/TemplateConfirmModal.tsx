import React from "react";
import { AlertTriangle, X, Sparkles } from "lucide-react";
import type { PageTemplateDefinition } from "./templates";
import "./TemplateConfirmModal.css";

interface TemplateConfirmModalProps {
  isOpen: boolean;
  template: PageTemplateDefinition | null;
  componentCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const TemplateConfirmModal: React.FC<TemplateConfirmModalProps> = ({
  isOpen,
  template,
  componentCount,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <div className="template-header-icon-wrap">
            <AlertTriangle size={22} className="warning-icon" />
          </div>

          <button className="template-modal-close" onClick={onClose} title="Cancel">
            <X size={18} />
          </button>
        </div>

        <div className="template-modal-content">
          <h3>Replace Page Layout?</h3>
          <p>
            Applying the <strong>"{template.name}"</strong> template will replace all{" "}
            <strong>{componentCount}</strong> existing components on your page.
          </p>

          <div className="template-warning-box">
            <Sparkles size={16} />
            <span>
              Unsaved component changes on the canvas will be overwritten. Your Page Title and SEO Settings will remain unchanged.
            </span>
          </div>
        </div>

        <div className="template-modal-actions">
          <button type="button" className="template-btn-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="template-btn-confirm"
            onClick={onConfirm}
          >
            Replace & Apply Template
          </button>
        </div>
      </div>
    </div>
  );
};
