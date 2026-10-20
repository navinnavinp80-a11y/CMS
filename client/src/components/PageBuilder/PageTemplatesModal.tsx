import React, { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  LayoutTemplate,
  Briefcase,
  Feather,
  Crown,
  Lock,
  AlertCircle,
} from "lucide-react";
import { PAGE_TEMPLATES, type PageTemplateDefinition } from "./templates";
import { useAuth } from "../../context/AuthContext";
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
  const { isPremium } = useAuth();
  const [lockedAlert, setLockedAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "Feather":
        return <Feather size={20} />;
      case "Briefcase":
        return <Briefcase size={20} />;
      case "Crown":
        return <Crown size={20} />;
      default:
        return <LayoutTemplate size={20} />;
    }
  };

  const handleCardClick = (tmpl: PageTemplateDefinition) => {
    if (tmpl.plan === "premium" && !isPremium) {
      setLockedAlert(
        `"${tmpl.name}" is a Premium template. Upgrade your subscription to unlock this design and all enterprise features.`
      );
      return;
    }
    setLockedAlert(null);
    onSelectTemplate(tmpl);
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
              <h2>Website & Page Templates</h2>
              <p>Choose a pre-built layout to kickstart your page design</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className={`user-plan-indicator ${isPremium ? "plan-pro" : "plan-free"}`}>
              {isPremium ? "✦ Premium Active" : "Free Plan"}
            </span>
            <button className="templates-modal-close" onClick={onClose} title="Close Templates">
              <X size={18} />
            </button>
          </div>
        </div>

        {lockedAlert && (
          <div className="template-upgrade-banner">
            <AlertCircle size={18} className="upgrade-banner-icon" />
            <div className="upgrade-banner-text">
              <strong>Premium Template Restricted</strong>
              <p>{lockedAlert}</p>
            </div>
            <button
              type="button"
              className="upgrade-banner-dismiss"
              onClick={() => setLockedAlert(null)}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="templates-modal-body">
          <div className="templates-grid">
            {PAGE_TEMPLATES.map((tmpl) => {
              const isLocked = tmpl.plan === "premium" && !isPremium;

              return (
                <div
                  key={tmpl.id}
                  className={`template-card ${tmpl.plan === "premium" ? "template-card-premium" : ""} ${isLocked ? "template-card-locked" : ""}`}
                >
                  <div className="template-card-header">
                    <div className="template-card-icon">
                      {getTemplateIcon(tmpl.iconName)}
                    </div>
                    <div className="template-tags-group">
                      <span className="template-category-tag">{tmpl.category}</span>
                      <span
                        className={`template-plan-badge ${tmpl.plan === "premium" ? "badge-premium" : "badge-free"}`}
                      >
                        {tmpl.plan === "premium" ? "👑 Premium" : "Free"}
                      </span>
                    </div>
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

                  {isLocked ? (
                    <button
                      type="button"
                      className="apply-template-btn btn-locked"
                      onClick={() => handleCardClick(tmpl)}
                    >
                      <Lock size={15} />
                      <span>Upgrade to Unlock</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`apply-template-btn ${tmpl.plan === "premium" ? "btn-premium-apply" : ""}`}
                      onClick={() => handleCardClick(tmpl)}
                    >
                      <span>Use This Template</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
