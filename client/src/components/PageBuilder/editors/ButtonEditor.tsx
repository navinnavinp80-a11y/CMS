import type { PageComponent } from "../types";

interface ButtonEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: string) => void;
}

export function ButtonEditor({ component, updateComponent }: ButtonEditorProps) {
  return (
    <>
      <div className="editor-field">
        <label>Button Text</label>
        <input
          type="text"
          value={component.buttonText || ""}
          onChange={(e) => updateComponent("buttonText", e.target.value)}
        />
      </div>

      <div className="editor-field">
        <label>Button URL</label>
        <input
          type="text"
          value={component.buttonUrl || ""}
          onChange={(e) => updateComponent("buttonUrl", e.target.value)}
        />
      </div>
    </>
  );
}
