import type { PageComponent } from "../types";

interface HeroEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: string) => void;
}

export function HeroEditor({ component, updateComponent }: HeroEditorProps) {
  return (
    <>
      <div className="editor-field">
        <label>Title</label>
        <input
          type="text"
          value={component.title || ""}
          onChange={(e) => updateComponent("title", e.target.value)}
        />
        <small>{"{{TITLE}}"}</small>
      </div>

      <div className="editor-field">
        <label>Subtitle</label>
        <textarea
          rows={4}
          value={component.subtitle || ""}
          onChange={(e) => updateComponent("subtitle", e.target.value)}
        />
        <small>{"{{SUBTITLE}}"}</small>
      </div>

      <div className="editor-field">
        <label>Button Text</label>
        <input
          type="text"
          value={component.buttonText || ""}
          onChange={(e) => updateComponent("buttonText", e.target.value)}
        />
        <small>{"{{BUTTON_TEXT}}"}</small>
      </div>
    </>
  );
}
