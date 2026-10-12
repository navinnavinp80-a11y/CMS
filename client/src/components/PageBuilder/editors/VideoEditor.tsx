import type { PageComponent } from "../types";

interface VideoEditorProps {
  component: PageComponent;
  updateComponent: (field: keyof PageComponent, value: string) => void;
}

export function VideoEditor({ component, updateComponent }: VideoEditorProps) {
  return (
    <div className="editor-field">
      <label>Video URL</label>
      <input
        type="text"
        placeholder="Enter video URL"
        value={component.videoUrl || ""}
        onChange={(e) => updateComponent("videoUrl", e.target.value)}
      />
      <small>Paste a direct video URL (.mp4, .webm) or YouTube URL.</small>
    </div>
  );
}
