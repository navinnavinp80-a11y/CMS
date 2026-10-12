import { Plus, Trash2 } from "lucide-react";
import type { PageComponent, FooterLink } from "../types";

interface FooterEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: any) => void;
}

export function FooterEditor({ component, updateComponent }: FooterEditorProps) {
  const links: FooterLink[] = component.footerLinks || [];

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = links.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateComponent("footerLinks", updated);
  };

  const addLink = () => {
    const updated = [
      ...links,
      { label: `Link ${links.length + 1}`, url: "#" },
    ];
    updateComponent("footerLinks", updated);
  };

  const removeLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    updateComponent("footerLinks", updated);
  };

  return (
    <>
      <div className="editor-field">
        <label>Logo / Website Name</label>
        <input
          type="text"
          value={component.footerLogo || ""}
          onChange={(e) => updateComponent("footerLogo", e.target.value)}
        />
      </div>

      <div className="editor-field">
        <label>Footer Description</label>
        <textarea
          rows={3}
          value={component.footerDescription || ""}
          onChange={(e) => updateComponent("footerDescription", e.target.value)}
        />
      </div>

      <div className="editor-field">
        <label>Copyright Text</label>
        <input
          type="text"
          value={component.footerCopyright || ""}
          onChange={(e) => updateComponent("footerCopyright", e.target.value)}
        />
      </div>

      <div className="editor-field">
        <div className="nav-items-header">
          <label>Navigation Links</label>
          <button
            type="button"
            className="add-nav-item-btn"
            onClick={addLink}
          >
            <Plus size={13} /> Add Link
          </button>
        </div>

        <div className="nav-items-list">
          {links.map((link, index) => (
            <div key={index} className="nav-item-edit-box">
              <div className="nav-item-inputs">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                />
              </div>
              <button
                type="button"
                className="remove-nav-item-btn"
                onClick={() => removeLink(index)}
                title="Remove link"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
