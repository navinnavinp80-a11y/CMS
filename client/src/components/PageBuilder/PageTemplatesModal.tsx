import React from "react";
import { X, Sparkles, ArrowRight, LayoutTemplate, Briefcase, UserCheck, Mail } from "lucide-react";
import { PAGE_TEMPLATES, type PageTemplateDefinition } from "./templates";
import "./PageTemplatesModal.css";

interface PageTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PageTemplateDefinition) => void;
}

export const PageTemplatesModal: React.FC<PageTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "Briefcase":
        return <Briefcase size={20} />;
      case "UserCheck":
        return <UserCheck size={20} />;
      case "Mail":
        return <Mail size={20} />;
      default:
        return <LayoutTemplate size={20} />;
    }
  };

  return (
    <div className="templates-modal-overlay" onClick={onClose}>
      <div className="templates-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="templates-modal-header">
          <div className="templates-header-title">
            <div className="templates-icon-badge">
              <Sparkles size={20} />
            </div>
            <div>
              <h2>Page Templates</h2>
              <p>Choose a pre-built layout to kickstart your page design</p>
            </div>
          </div>

          <button className="templates-modal-close" onClick={onClose} title="Close Templates">
            <X size={18} />
          </button>
        </div>

        <div className="templates-modal-body">
          <div className="templates-grid">
            {PAGE_TEMPLATES.map((tmpl) => (
              <div key={tmpl.id} className="template-card">
                <div className="template-card-header">
                  <div className="template-card-icon">
                    {getTemplateIcon(tmpl.iconName)}
                  </div>
                  <span className="template-category-tag">{tmpl.category}</span>
                </div>

                <h3>{tmpl.name}</h3>
                <p className="template-desc">{tmpl.description}</p>

                <div className="template-structure-preview">
                  <span className="structure-label">Includes ({tmpl.blockSummary.length} Blocks):</span>
                  <div className="structure-tags">
                    {tmpl.blockSummary.map((block, i) => (
                      <span key={i} className="structure-tag">
                        {block.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="apply-template-btn"
                  onClick={() => {
                    onSelectTemplate(tmpl);
                  }}
                >
                  <span>Use This Template</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
