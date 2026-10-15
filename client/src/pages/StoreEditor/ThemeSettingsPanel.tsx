import React from "react";
import type { StoreTheme } from "./types";
import { Palette, Type, Layout, Sliders } from "lucide-react";

interface ThemeSettingsPanelProps {
  theme: StoreTheme;
  onChangeTheme: (newTheme: StoreTheme) => void;
}

const SAFE_FONTS = [
  { label: "Inter (Modern Sans)", value: "Inter, sans-serif" },
  {
    label: "Plus Jakarta Sans",
    value: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  {
    label: "System UI (Clean Native)",
    value: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    label: "Georgia (Editorial Serif)",
    value: "Georgia, Cambria, 'Times New Roman', serif",
  },
  {
    label: "Courier New (Monospace Minimal)",
    value: "'Courier New', Courier, monospace",
  },
];

export const ThemeSettingsPanel: React.FC<ThemeSettingsPanelProps> = ({
  theme,
  onChangeTheme,
}) => {
  const handleThemeChange = (field: keyof StoreTheme, value: any) => {
    onChangeTheme({
      ...theme,
      [field]: value,
    });
  };

  return (
    <div className="theme-settings-panel">
      <div className="theme-panel-header">
        <div className="theme-panel-title">
          <h3>Store Theme</h3>
          <span>Global styling & typography</span>
        </div>
      </div>

      <div className="theme-panel-body">
        {/* Colors */}
        <div className="theme-section-card">
          <div className="theme-section-title">
            <Palette size={16} />
            <h4>Colors</h4>
          </div>

          <div className="settings-field">
            <label>Primary Brand Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={theme.primaryColor || "#202223"}
                onChange={(e) =>
                  handleThemeChange("primaryColor", e.target.value)
                }
              />
              <input
                type="text"
                value={theme.primaryColor || "#202223"}
                onChange={(e) =>
                  handleThemeChange("primaryColor", e.target.value)
                }
              />
            </div>
          </div>

          <div className="settings-field">
            <label>Secondary / Accent Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={theme.secondaryColor || "#4f46e5"}
                onChange={(e) =>
                  handleThemeChange("secondaryColor", e.target.value)
                }
              />
              <input
                type="text"
                value={theme.secondaryColor || "#4f46e5"}
                onChange={(e) =>
                  handleThemeChange("secondaryColor", e.target.value)
                }
              />
            </div>
          </div>

          <div className="settings-field">
            <label>Page Background Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={theme.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleThemeChange("backgroundColor", e.target.value)
                }
              />
              <input
                type="text"
                value={theme.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleThemeChange("backgroundColor", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="theme-section-card">
          <div className="theme-section-title">
            <Type size={16} />
            <h4>Typography</h4>
          </div>

          <div className="settings-field">
            <label>Primary Font Family</label>
            <select
              value={theme.fontFamily || "Inter, sans-serif"}
              onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
            >
              {SAFE_FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Button Style */}
        <div className="theme-section-card">
          <div className="theme-section-title">
            <Sliders size={16} />
            <h4>Buttons</h4>
          </div>

          <div className="settings-field">
            <label>Button Corner Style</label>
            <div className="button-style-options">
              <button
                type="button"
                className={`style-option-btn ${
                  theme.buttonStyle === "square" ? "active" : ""
                }`}
                onClick={() => handleThemeChange("buttonStyle", "square")}
              >
                <span className="sample-btn sample-square" />
                Square
              </button>

              <button
                type="button"
                className={`style-option-btn ${
                  theme.buttonStyle === "rounded" || !theme.buttonStyle
                    ? "active"
                    : ""
                }`}
                onClick={() => handleThemeChange("buttonStyle", "rounded")}
              >
                <span className="sample-btn sample-rounded" />
                Rounded
              </button>

              <button
                type="button"
                className={`style-option-btn ${
                  theme.buttonStyle === "pill" ? "active" : ""
                }`}
                onClick={() => handleThemeChange("buttonStyle", "pill")}
              >
                <span className="sample-btn sample-pill" />
                Pill
              </button>
            </div>
          </div>
        </div>

        {/* Layout & Spacing */}
        <div className="theme-section-card">
          <div className="theme-section-title">
            <Layout size={16} />
            <h4>Layout & Spacing</h4>
          </div>

          <div className="settings-field">
            <label>Max Content Width</label>
            <div className="button-style-options">
              <button
                type="button"
                className={`style-option-btn ${
                  theme.contentWidth === "compact" ? "active" : ""
                }`}
                onClick={() => handleThemeChange("contentWidth", "compact")}
              >
                Compact (1000px)
              </button>

              <button
                type="button"
                className={`style-option-btn ${
                  theme.contentWidth === "normal" || !theme.contentWidth
                    ? "active"
                    : ""
                }`}
                onClick={() => handleThemeChange("contentWidth", "normal")}
              >
                Normal (1200px)
              </button>

              <button
                type="button"
                className={`style-option-btn ${
                  theme.contentWidth === "full" ? "active" : ""
                }`}
                onClick={() => handleThemeChange("contentWidth", "full")}
              >
                Full (1440px)
              </button>
            </div>
          </div>

          <div className="settings-field">
            <label>Vertical Section Spacing</label>
            <div className="button-style-options">
              <button
                type="button"
                className={`style-option-btn ${
                  theme.sectionSpacing === "compact" ? "active" : ""
                }`}
                onClick={() => handleThemeChange("sectionSpacing", "compact")}
              >
                Compact
              </button>

              <button
                type="button"
                className={`style-option-btn ${
                  theme.sectionSpacing === "normal" || !theme.sectionSpacing
                    ? "active"
                    : ""
                }`}
                onClick={() => handleThemeChange("sectionSpacing", "normal")}
              >
                Normal
              </button>

              <button
                type="button"
                className={`style-option-btn ${
                  theme.sectionSpacing === "spacious" ? "active" : ""
                }`}
                onClick={() => handleThemeChange("sectionSpacing", "spacious")}
              >
                Spacious
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
