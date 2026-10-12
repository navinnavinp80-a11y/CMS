import { Plus, Trash2 } from "lucide-react";
import type { PageComponent } from "../types";

interface NavbarEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: string) => void;
  updateNavItem: (index: number, field: "label" | "url", value: string) => void;
  addNavItem: () => void;
  removeNavItem: (index: number) => void;
}

export function NavbarEditor({
  component,
  updateComponent,
  updateNavItem,
  addNavItem,
  removeNavItem,
}: NavbarEditorProps) {
  return (
    <>
      <div className="editor-field">
        <label>Logo / Brand Name</label>
        <input
          type="text"
          value={component.navbarLogo || ""}
          onChange={(e) => updateComponent("navbarLogo", e.target.value)}
        />
      </div>

      <div className="editor-field">
        <div className="nav-items-header">
          <label>Navigation Links</label>
          <button
            type="button"
            className="add-nav-item-btn"
            onClick={addNavItem}
          >
            <Plus size={13} /> Add Link
          </button>
        </div>

        <div className="nav-items-list">
          {(component.navbarItems || []).map((item, index) => (
            <div key={index} className="nav-item-edit-box">
              <div className="nav-item-inputs">
                <input
                  type="text"
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => updateNavItem(index, "label", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={item.url}
                  onChange={(e) => updateNavItem(index, "url", e.target.value)}
                />
              </div>
              <button
                type="button"
                className="remove-nav-item-btn"
                onClick={() => removeNavItem(index)}
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
