import { Plus, Trash2 } from "lucide-react";
import type { PageComponent } from "../types";
import type { PageListItem } from "../PageSelectorDropdown";

interface NavbarEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: string) => void;
  updateNavItem: (index: number, field: "label" | "url", value: string) => void;
  addNavItem: () => void;
  removeNavItem: (index: number) => void;
  pages?: PageListItem[];
}

export function NavbarEditor({
  component,
  updateComponent,
  updateNavItem,
  addNavItem,
  removeNavItem,
  pages = [],
}: NavbarEditorProps) {
  const getPageUrl = (p: PageListItem) => {
    return p.slug === "home" || p.slug === "index" ? "/" : `/${p.slug}`;
  };

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
          {(component.navbarItems || []).map((item, index) => {
            const matchingPage = pages.find((p) => {
              const url = getPageUrl(p);
              return (
                item.url === url ||
                item.url === `/${p.slug}` ||
                item.url === `/p/${p.slug}` ||
                item.url === p.slug
              );
            });

            return (
              <div key={index} className="nav-item-edit-box">
                <div className="nav-item-inputs">
                  <div className="nav-field-group">
                    <span className="nav-field-label">Label</span>
                    <input
                      type="text"
                      placeholder="e.g. Home, About"
                      value={item.label}
                      onChange={(e) => updateNavItem(index, "label", e.target.value)}
                    />
                  </div>

                  {pages.length > 0 && (
                    <div className="nav-field-group">
                      <span className="nav-field-label">Target Page</span>
                      <select
                        value={matchingPage ? getPageUrl(matchingPage) : "__custom__"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__custom__") {
                            if (!item.url || item.url.startsWith("/") || item.url.startsWith("/p/")) {
                              updateNavItem(index, "url", "https://");
                            }
                          } else {
                            updateNavItem(index, "url", val);
                            const selectedP = pages.find((p) => getPageUrl(p) === val);
                            if (selectedP && (!item.label || item.label.startsWith("Link "))) {
                              updateNavItem(index, "label", selectedP.title);
                            }
                          }
                        }}
                      >
                        <option value="">-- Choose a Saved Page --</option>
                        {pages.map((p) => {
                          const pUrl = getPageUrl(p);
                          return (
                            <option key={p._id} value={pUrl}>
                              {p.title || "Untitled Page"} ({pUrl})
                            </option>
                          );
                        })}
                        <option value="__custom__">Custom / External URL...</option>
                      </select>
                    </div>
                  )}

                  <div className="nav-field-group">
                    <span className="nav-field-label">
                      {matchingPage ? "Dynamic Route" : "Custom URL"}
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. /contact or https://example.com"
                      value={item.url}
                      onChange={(e) => updateNavItem(index, "url", e.target.value)}
                    />
                  </div>
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
            );
          })}
        </div>
      </div>
    </>
  );
}
