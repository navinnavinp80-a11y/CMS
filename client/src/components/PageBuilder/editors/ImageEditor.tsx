import { Image } from "lucide-react";
import type { PageComponent } from "../types";

interface ImageEditorProps {
  component: PageComponent;
  openMediaLibrary: () => void;
}

export function ImageEditor({ component, openMediaLibrary }: ImageEditorProps) {
  return (
    <div className="editor-field">
      <label>Image</label>

      {component.imageUrl && (
        <div className="selected-image-preview">
          <img src={component.imageUrl} alt="Selected" />
        </div>
      )}

      <button
        type="button"
        className="media-library-button"
        onClick={openMediaLibrary}
      >
        <Image size={16} />
        Select from Media Library
      </button>
    </div>
  );
}
