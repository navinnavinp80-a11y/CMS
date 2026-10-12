import { Image } from "lucide-react";
import type { PageComponent } from "../types";

interface ColumnsEditorProps {
  component: PageComponent;
  updateColumnType: (side: "left" | "right", type: "text" | "image") => void;
  updateColumnField: (
    side: "left" | "right",
    field: "text" | "imageUrl",
    value: string
  ) => void;
  openMediaLibraryForSide: (side: "left" | "right") => void;
}

export function ColumnsEditor({
  component,
  updateColumnType,
  updateColumnField,
  openMediaLibraryForSide,
}: ColumnsEditorProps) {
  return (
    <>
      {/* LEFT COLUMN EDITOR */}
      <div className="column-editor-box">
        <h3>Left Column</h3>

        <div className="editor-field">
          <label>Content Type</label>
          <select
            value={component.columns?.left.type || "text"}
            onChange={(e) =>
              updateColumnType("left", e.target.value as "text" | "image")
            }
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
        </div>

        {component.columns?.left.type === "image" ? (
          <div className="editor-field">
            <label>Image</label>
            {component.columns.left.imageUrl && (
              <div className="selected-image-preview">
                <img
                  src={component.columns.left.imageUrl}
                  alt="Left column"
                />
              </div>
            )}
            <input
              type="text"
              placeholder="Image URL"
              value={component.columns.left.imageUrl || ""}
              onChange={(e) =>
                updateColumnField("left", "imageUrl", e.target.value)
              }
            />
            <button
              type="button"
              className="media-library-button"
              style={{ marginTop: "8px" }}
              onClick={() => openMediaLibraryForSide("left")}
            >
              <Image size={16} />
              Select from Media Library
            </button>
          </div>
        ) : (
          <div className="editor-field">
            <label>Text Content</label>
            <textarea
              rows={5}
              value={component.columns?.left.text || ""}
              onChange={(e) =>
                updateColumnField("left", "text", e.target.value)
              }
            />
          </div>
        )}
      </div>

      {/* RIGHT COLUMN EDITOR */}
      <div className="column-editor-box">
        <h3>Right Column</h3>

        <div className="editor-field">
          <label>Content Type</label>
          <select
            value={component.columns?.right.type || "text"}
            onChange={(e) =>
              updateColumnType("right", e.target.value as "text" | "image")
            }
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
        </div>

        {component.columns?.right.type === "image" ? (
          <div className="editor-field">
            <label>Image</label>
            {component.columns.right.imageUrl && (
              <div className="selected-image-preview">
                <img
                  src={component.columns.right.imageUrl}
                  alt="Right column"
                />
              </div>
            )}
            <input
              type="text"
              placeholder="Image URL"
              value={component.columns.right.imageUrl || ""}
              onChange={(e) =>
                updateColumnField("right", "imageUrl", e.target.value)
              }
            />
            <button
              type="button"
              className="media-library-button"
              style={{ marginTop: "8px" }}
              onClick={() => openMediaLibraryForSide("right")}
            >
              <Image size={16} />
              Select from Media Library
            </button>
          </div>
        ) : (
          <div className="editor-field">
            <label>Text Content</label>
            <textarea
              rows={5}
              value={component.columns?.right.text || ""}
              onChange={(e) =>
                updateColumnField("right", "text", e.target.value)
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
