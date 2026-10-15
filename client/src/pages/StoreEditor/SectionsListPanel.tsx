import React, { useState } from "react";
import { createDefaultSection } from "./types";
import type { StoreSection, StoreSectionType } from "./types";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Layers,
  Sparkles,
  LayoutTemplate,
  Grid,
  Image as ImageIcon,
  Type,
  Mail,
  PanelBottom,
  Bell,
  Menu,
} from "lucide-react";

interface SectionsListPanelProps {
  sections: StoreSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onAddSection: (section: StoreSection) => void;
  onDeleteSection: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const SECTION_CATALOG: Array<{
  type: StoreSectionType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  {
    type: "announcement",
    title: "Announcement Bar",
    description: "Top bar for notices, alerts, and promotions",
    icon: Bell,
  },
  {
    type: "header",
    title: "Header / Navigation",
    description: "Store branding, links, and cart action",
    icon: Menu,
  },
  {
    type: "hero",
    title: "Hero Banner",
    description: "Large eye-catching banner with CTA button",
    icon: LayoutTemplate,
  },
  {
    type: "featured-products",
    title: "Featured Products",
    description: "Showcase selected hero products",
    icon: Sparkles,
  },
  {
    type: "product-grid",
    title: "Product Grid",
    description: "Multi-column catalog product collection",
    icon: Grid,
  },
  {
    type: "image-banner",
    title: "Image Banner",
    description: "Full-width visual banner with text overlay",
    icon: ImageIcon,
  },
  {
    type: "rich-text",
    title: "Rich Text",
    description: "Brand story, narrative, or editorial text",
    icon: Type,
  },
  {
    type: "newsletter",
    title: "Newsletter",
    description: "Email capture form for subscribers",
    icon: Mail,
  },
  {
    type: "footer",
    title: "Footer",
    description: "Site links, copyright, and store disclaimer",
    icon: PanelBottom,
  },
];

export const SectionsListPanel: React.FC<SectionsListPanelProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onMoveUp,
  onMoveDown,
  onReorder,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getSectionIcon = (type: StoreSectionType) => {
    switch (type) {
      case "announcement":
        return Bell;
      case "header":
        return Menu;
      case "hero":
        return LayoutTemplate;
      case "featured-products":
        return Sparkles;
      case "product-grid":
        return Grid;
      case "image-banner":
        return ImageIcon;
      case "rich-text":
        return Type;
      case "newsletter":
        return Mail;
      case "footer":
        return PanelBottom;
      default:
        return Layers;
    }
  };

  const handleAdd = (type: StoreSectionType, title: string) => {
    const newSection = createDefaultSection(type, title);
    onAddSection(newSection);
    setShowPicker(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === overIndex) return;
    onReorder(draggedIndex, overIndex);
    setDraggedIndex(overIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="sections-list-panel">
      <div className="sections-panel-header">
        <div className="sections-panel-title">
          <h3>Page Sections</h3>
          <span>{sections.length} active on Home</span>
        </div>
        <button
          type="button"
          className="add-section-toggle-btn"
          onClick={() => setShowPicker(!showPicker)}
          title="Add a new section"
        >
          <Plus size={16} />
          Add section
        </button>
      </div>

      {/* Add Section Modal / Dropdown Picker */}
      {showPicker && (
        <div className="store-editor-section-picker">
          <div className="section-picker-header">
            <h4>Select a Section to Add</h4>
            <button
              type="button"
              className="picker-close-btn"
              onClick={() => setShowPicker(false)}
            >
              ✕
            </button>
          </div>
          <div className="section-picker-items">
            {SECTION_CATALOG.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  type="button"
                  className="picker-section-item"
                  onClick={() => handleAdd(item.type, item.title)}
                >
                  <div className="picker-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div className="picker-item-info">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <Plus size={15} className="picker-item-add" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="sections-items-list">
        {sections.length === 0 ? (
          <div className="sections-empty-state">
            <Layers size={28} />
            <p>No sections on this page.</p>
            <button
              type="button"
              className="sections-empty-add-btn"
              onClick={() => setShowPicker(true)}
            >
              <Plus size={14} /> Add your first section
            </button>
          </div>
        ) : (
          sections.map((section, index) => {
            const Icon = getSectionIcon(section.type);
            const isSelected = selectedSectionId === section.id;

            return (
              <div
                key={section.id}
                className={`section-item-row ${isSelected ? "selected" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className="section-drag-handle"
                  title="Drag to reorder section"
                >
                  <GripVertical size={14} />
                </div>

                <div
                  className="section-item-content"
                  onClick={() => onSelectSection(section.id)}
                  title="Click to edit section settings"
                >
                  <div className="section-item-icon">
                    <Icon size={15} />
                  </div>
                  <div className="section-item-names">
                    <span className="section-item-title">{section.title}</span>
                    <span className="section-item-type">{section.type}</span>
                  </div>
                </div>

                <div className="section-item-actions">
                  <button
                    type="button"
                    className="section-order-btn"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>

                  <button
                    type="button"
                    className="section-order-btn"
                    onClick={() => onMoveDown(index)}
                    disabled={index === sections.length - 1}
                    title="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>

                  <button
                    type="button"
                    className="section-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    title="Delete section"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
