import type { PageComponent } from "../types";

interface TextEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: string) => void;
}

export function TextEditor({ component, updateComponent }: TextEditorProps) {
  return (
    <div className="editor-field">
      <label>Text Content</label>
      <textarea
        rows={8}
        value={component.text || ""}
        onChange={(e) => updateComponent("text", e.target.value)}
      />
    </div>
  );
}
