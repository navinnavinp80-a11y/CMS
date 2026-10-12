import type { PageComponent } from "../types";

interface DividerEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: any) => void;
}

export function DividerEditor({ component, updateComponent }: DividerEditorProps) {
  const currentStyle = component.dividerStyle || "solid";
  const currentWidth = component.dividerWidth || "100%";

  return (
    <>
      <div className="editor-field">
        <label>Style</label>
        <select
          value={currentStyle}
          onChange={(e) => updateComponent("dividerStyle", e.target.value)}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      <div className="editor-field">
        <label>Width</label>
        <select
          value={currentWidth}
          onChange={(e) => updateComponent("dividerWidth", e.target.value)}
        >
          <option value="100%">100%</option>
          <option value="75%">75%</option>
          <option value="50%">50%</option>
        </select>
      </div>
    </>
  );
}
