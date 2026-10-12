import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";

interface ImageResizeOverlayProps {
  image: HTMLImageElement;
  canvasCard: HTMLElement | null;
  editorContainer: HTMLElement | null;
  onUpdate: () => void;
  onDeselect: () => void;
}

interface OverlayBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const ImageResizeOverlay: React.FC<ImageResizeOverlayProps> = ({
  image,
  canvasCard,
  editorContainer,
  onUpdate,
  onDeselect,
}) => {
  const [box, setBox] = useState<OverlayBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isAspectLocked, setIsAspectLocked] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [currentAlign, setCurrentAlign] = useState<"left" | "center" | "right">("center");

  const overlayRef = useRef<HTMLDivElement>(null);

  // Update overlay bounding box relative to canvas-card
  const updateBox = useCallback(() => {
    if (!image || !canvasCard || !image.isConnected) {
      if (image && !image.isConnected) {
        onDeselect();
      }
      return;
    }

    const cardRect = canvasCard.getBoundingClientRect();
    const imgRect = image.getBoundingClientRect();
    const borderTop = canvasCard.clientTop || 0;
    const borderLeft = canvasCard.clientLeft || 0;

    setBox({
      top: imgRect.top - cardRect.top - borderTop,
      left: imgRect.left - cardRect.left - borderLeft,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, [image, canvasCard, onDeselect]);

  // Sync initial dimensions, alignment, and listeners on selected image
  useEffect(() => {
    if (!image) return;

    // Detect initial alignment
    const dataAlign = image.getAttribute("data-align") as "left" | "center" | "right" | null;
    let initialAlign: "left" | "center" | "right" = "left";

    if (dataAlign === "left" || dataAlign === "center" || dataAlign === "right") {
      initialAlign = dataAlign;
    } else {
      const ml = image.style.marginLeft;
      const mr = image.style.marginRight;
      const parentAlign = image.parentElement?.style.textAlign;

      if (ml === "auto" && mr === "auto") {
        initialAlign = "center";
      } else if (ml === "auto" && (mr === "0px" || mr === "0")) {
        initialAlign = "right";
      } else if (parentAlign === "center") {
        initialAlign = "center";
      } else if (parentAlign === "right") {
        initialAlign = "right";
      }
    }
    setCurrentAlign(initialAlign);

    // Detect unit and initial width/height
    const styleWidth = image.style.width || "";
    const attrWidth = image.getAttribute("width") || "";
    const isPercent = styleWidth.endsWith("%") || attrWidth.endsWith("%");

    if (isPercent) {
      setUnit("%");
      const pctVal = styleWidth.endsWith("%")
        ? styleWidth.replace("%", "")
        : attrWidth.replace("%", "");
      setWidthInput(pctVal);
    } else {
      setUnit("px");
      setWidthInput(String(Math.round(image.offsetWidth || image.getBoundingClientRect().width)));
    }

    setHeightInput(String(Math.round(image.offsetHeight || image.getBoundingClientRect().height)));

    updateBox();

    // Listeners for position updates
    const scrollContainer = canvasCard?.closest(".editor-canvas-area");
    scrollContainer?.addEventListener("scroll", updateBox);
    window.addEventListener("resize", updateBox);

    const ro = new ResizeObserver(() => updateBox());
    ro.observe(image);
    if (canvasCard) ro.observe(canvasCard);

    // Keyboard handlers (Escape = deselect, Delete/Backspace = delete)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDeselect();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
          e.preventDefault();
          handleRemove();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      scrollContainer?.removeEventListener("scroll", updateBox);
      window.removeEventListener("resize", updateBox);
      window.removeEventListener("keydown", handleKeyDown);
      ro.disconnect();
    };
  }, [image, canvasCard, updateBox, onDeselect]);

  // Handle Dragging of Resize Handles
  const handleStartDrag = (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!image) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = image.offsetWidth || image.getBoundingClientRect().width;
    const startHeight = image.offsetHeight || image.getBoundingClientRect().height;

    const naturalWidth = image.naturalWidth || startWidth;
    const naturalHeight = image.naturalHeight || startHeight;
    const aspectRatio = naturalWidth / (naturalHeight || 1);

    const containerStyle = editorContainer ? window.getComputedStyle(editorContainer) : null;
    const paddingX = containerStyle
      ? parseFloat(containerStyle.paddingLeft || "0") + parseFloat(containerStyle.paddingRight || "0")
      : 120;
    const maxWidth = editorContainer ? Math.max(100, editorContainer.clientWidth - paddingX) : 700;
    const minWidth = 40;

    setIsDragging(true);
    setActiveHandle(handle);

    const getCursorForHandle = (h: string) => {
      if (h === "nw" || h === "se") return "nwse-resize";
      if (h === "ne" || h === "sw") return "nesw-resize";
      if (h === "n" || h === "s") return "ns-resize";
      return "ew-resize";
    };

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.cursor = getCursorForHandle(handle);

    const onPointerMove = (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const deltaX = moveEvt.clientX - startX;
      const deltaY = moveEvt.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (isAspectLocked) {
        let delta = 0;
        if (handle === "se") {
          delta = Math.abs(deltaX) >= Math.abs(deltaY * aspectRatio) ? deltaX : deltaY * aspectRatio;
        } else if (handle === "sw") {
          delta = Math.abs(deltaX) >= Math.abs(deltaY * aspectRatio) ? -deltaX : deltaY * aspectRatio;
        } else if (handle === "ne") {
          delta = Math.abs(deltaX) >= Math.abs(deltaY * aspectRatio) ? deltaX : -deltaY * aspectRatio;
        } else if (handle === "nw") {
          delta = Math.abs(deltaX) >= Math.abs(deltaY * aspectRatio) ? -deltaX : -deltaY * aspectRatio;
        } else if (handle === "e") {
          delta = deltaX;
        } else if (handle === "w") {
          delta = -deltaX;
        } else if (handle === "s") {
          delta = deltaY * aspectRatio;
        } else if (handle === "n") {
          delta = -deltaY * aspectRatio;
        }
        newWidth = startWidth + delta;
        newHeight = Math.round(newWidth / aspectRatio);
      } else {
        if (handle === "se") {
          newWidth = startWidth + deltaX;
          newHeight = startHeight + deltaY;
        } else if (handle === "sw") {
          newWidth = startWidth - deltaX;
          newHeight = startHeight + deltaY;
        } else if (handle === "ne") {
          newWidth = startWidth + deltaX;
          newHeight = startHeight - deltaY;
        } else if (handle === "nw") {
          newWidth = startWidth - deltaX;
          newHeight = startHeight - deltaY;
        } else if (handle === "e") {
          newWidth = startWidth + deltaX;
          newHeight = startHeight;
        } else if (handle === "w") {
          newWidth = startWidth - deltaX;
          newHeight = startHeight;
        } else if (handle === "s") {
          newWidth = startWidth;
          newHeight = startHeight + deltaY;
        } else if (handle === "n") {
          newWidth = startWidth;
          newHeight = startHeight - deltaY;
        }
      }

      // Constrain width & height to available editor content width
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      if (isAspectLocked) {
        newHeight = Math.round(newWidth / aspectRatio);
      } else {
        newHeight = Math.max(25, newHeight);
      }

      // Apply to image
      image.style.width = `${newWidth}px`;
      image.style.maxWidth = "100%";
      image.style.height = isAspectLocked ? "auto" : `${newHeight}px`;
      image.setAttribute("width", String(newWidth));
      if (!isAspectLocked) {
        image.setAttribute("height", String(newHeight));
      } else {
        image.removeAttribute("height");
      }

      setWidthInput(String(newWidth));
      setHeightInput(String(newHeight));
      setUnit("px");
      updateBox();
    };

    const cleanup = () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
    };

    const onPointerUp = () => {
      cleanup();
      setIsDragging(false);
      setActiveHandle(null);
      updateBox();
      onUpdate();
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
  };

  // Apply explicit numeric width
  const applyWidth = (newW: number, targetUnit: "px" | "%") => {
    if (!image) return;
    const containerStyle = editorContainer ? window.getComputedStyle(editorContainer) : null;
    const paddingX = containerStyle
      ? parseFloat(containerStyle.paddingLeft || "0") + parseFloat(containerStyle.paddingRight || "0")
      : 120;
    const maxContainerW = editorContainer ? Math.max(100, editorContainer.clientWidth - paddingX) : 700;
    const naturalWidth = image.naturalWidth || maxContainerW;
    const naturalHeight = image.naturalHeight || (image.offsetHeight || 1);
    const aspect = naturalWidth / naturalHeight;

    if (targetUnit === "%") {
      const clamped = Math.max(10, Math.min(100, Math.round(newW)));
      image.style.width = `${clamped}%`;
      image.style.maxWidth = "100%";
      image.style.height = "auto";
      image.setAttribute("width", `${clamped}%`);
      image.removeAttribute("height");
      setWidthInput(String(clamped));
      setUnit("%");
    } else {
      const clamped = Math.max(40, Math.min(maxContainerW, Math.round(newW)));
      image.style.width = `${clamped}px`;
      image.style.maxWidth = "100%";
      if (isAspectLocked) {
        image.style.height = "auto";
        image.removeAttribute("height");
        setHeightInput(String(Math.round(clamped / aspect)));
      } else {
        const h = parseInt(heightInput, 10) || Math.round(clamped / aspect);
        image.style.height = `${h}px`;
        image.setAttribute("height", String(h));
      }
      image.setAttribute("width", String(clamped));
      setWidthInput(String(clamped));
      setUnit("px");
    }
    updateBox();
    onUpdate();
  };

  // Apply explicit numeric height
  const applyHeight = (newH: number) => {
    if (!image) return;
    const naturalWidth = image.naturalWidth || (image.offsetWidth || 1);
    const naturalHeight = image.naturalHeight || 1;
    const aspect = naturalWidth / naturalHeight;
    const clampedH = Math.max(25, Math.round(newH));

    if (isAspectLocked) {
      const newW = Math.round(clampedH * aspect);
      applyWidth(newW, "px");
    } else {
      image.style.height = `${clampedH}px`;
      image.setAttribute("height", String(clampedH));
      setHeightInput(String(clampedH));
      updateBox();
      onUpdate();
    }
  };

  // Apply alignment
  const applyAlignment = (align: "left" | "center" | "right") => {
    if (!image) return;
    image.style.display = "block";
    image.setAttribute("data-align", align);

    if (align === "left") {
      image.style.marginLeft = "0";
      image.style.marginRight = "auto";
    } else if (align === "center") {
      image.style.marginLeft = "auto";
      image.style.marginRight = "auto";
    } else if (align === "right") {
      image.style.marginLeft = "auto";
      image.style.marginRight = "0";
    }

    if (image.parentElement && image.parentElement.tagName === "P") {
      image.parentElement.style.textAlign = align;
    }

    setCurrentAlign(align);
    updateBox();
    onUpdate();
  };

  // Reset to original dimensions
  const handleReset = () => {
    if (!image) return;
    const containerStyle = editorContainer ? window.getComputedStyle(editorContainer) : null;
    const paddingX = containerStyle
      ? parseFloat(containerStyle.paddingLeft || "0") + parseFloat(containerStyle.paddingRight || "0")
      : 120;
    const maxContainerW = editorContainer ? Math.max(100, editorContainer.clientWidth - paddingX) : 700;
    const naturalWidth = image.naturalWidth || maxContainerW;
    const naturalHeight = image.naturalHeight || (image.offsetHeight || 1);
    const resetW = Math.min(naturalWidth, maxContainerW);

    image.style.width = `${resetW}px`;
    image.style.maxWidth = "100%";
    image.style.height = "auto";
    image.setAttribute("width", String(resetW));
    image.removeAttribute("height");

    setWidthInput(String(resetW));
    setHeightInput(String(Math.round(resetW / (naturalWidth / naturalHeight))));
    setUnit("px");
    updateBox();
    onUpdate();
  };

  // Remove image
  const handleRemove = () => {
    if (!image) return;
    const parent = image.parentElement;
    image.remove();
    if (parent && parent.tagName === "P" && parent.children.length === 0 && !parent.innerText.trim()) {
      parent.innerHTML = "<br/>";
    }
    onDeselect();
    onUpdate();
  };

  if (!box) return null;

  // Calculate toolbar position relative to canvas-card
  const cardWidth = canvasCard?.clientWidth || 860;
  const toolbarWidth = 450;
  let toolbarTop = box.top - 46;
  if (toolbarTop < 10) {
    toolbarTop = box.top + box.height + 10;
  }
  let toolbarLeft = box.left + box.width / 2 - toolbarWidth / 2;
  toolbarLeft = Math.max(12, Math.min(toolbarLeft, cardWidth - toolbarWidth - 12));

  return (
    <div className="image-resize-overlay-wrapper" ref={overlayRef}>
      {/* Floating Image Properties Toolbar */}
      <div
        className="image-properties-toolbar"
        style={{
          top: `${toolbarTop}px`,
          left: `${toolbarLeft}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Width Control */}
        <div className="toolbar-prop-group">
          <label className="toolbar-prop-label">W:</label>
          <input
            type="number"
            className="toolbar-prop-input"
            value={widthInput}
            onChange={(e) => setWidthInput(e.target.value)}
            onBlur={() => {
              const val = parseFloat(widthInput);
              if (!isNaN(val)) applyWidth(val, unit);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseFloat(widthInput);
                if (!isNaN(val)) applyWidth(val, unit);
              }
            }}
            title="Width in pixels or percentage"
          />
          {/* Unit Toggle */}
          <button
            type="button"
            className="toolbar-unit-toggle"
            onClick={() => {
              const newUnit = unit === "px" ? "%" : "px";
              if (newUnit === "%") {
                const maxW = editorContainer?.clientWidth || 800;
                const currentPx = parseFloat(widthInput) || box.width;
                const pct = Math.round((currentPx / maxW) * 100);
                applyWidth(pct, "%");
              } else {
                applyWidth(box.width, "px");
              }
            }}
            title={`Toggle unit (currently ${unit})`}
          >
            {unit}
          </button>
        </div>

        {/* Height Control */}
        <div className="toolbar-prop-group">
          <label className="toolbar-prop-label">H:</label>
          <input
            type="number"
            className="toolbar-prop-input"
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            onBlur={() => {
              const val = parseFloat(heightInput);
              if (!isNaN(val)) applyHeight(val);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseFloat(heightInput);
                if (!isNaN(val)) applyHeight(val);
              }
            }}
            disabled={unit === "%"}
            title="Height in pixels"
          />
          <span className="toolbar-static-unit">px</span>
        </div>

        {/* Aspect Ratio Lock */}
        <button
          type="button"
          className={`toolbar-icon-btn ${isAspectLocked ? "active" : ""}`}
          onClick={() => setIsAspectLocked(!isAspectLocked)}
          title={isAspectLocked ? "Aspect ratio locked" : "Aspect ratio unlocked"}
        >
          {isAspectLocked ? <Lock size={13} /> : <Unlock size={13} />}
        </button>

        <span className="toolbar-prop-divider" />

        {/* Quick Size Presets */}
        <div className="toolbar-presets-group">
          <button
            type="button"
            className="toolbar-preset-pill"
            onClick={() => applyWidth(25, "%")}
            title="Set width to 25%"
          >
            25%
          </button>
          <button
            type="button"
            className="toolbar-preset-pill"
            onClick={() => applyWidth(50, "%")}
            title="Set width to 50%"
          >
            50%
          </button>
          <button
            type="button"
            className="toolbar-preset-pill"
            onClick={() => applyWidth(75, "%")}
            title="Set width to 75%"
          >
            75%
          </button>
          <button
            type="button"
            className="toolbar-preset-pill"
            onClick={() => applyWidth(100, "%")}
            title="Set width to 100%"
          >
            100%
          </button>
        </div>

        <span className="toolbar-prop-divider" />

        {/* Alignment Buttons */}
        <div className="toolbar-align-group">
          <button
            type="button"
            className={`toolbar-icon-btn ${currentAlign === "left" ? "active" : ""}`}
            onClick={() => applyAlignment("left")}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            className={`toolbar-icon-btn ${currentAlign === "center" ? "active" : ""}`}
            onClick={() => applyAlignment("center")}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            className={`toolbar-icon-btn ${currentAlign === "right" ? "active" : ""}`}
            onClick={() => applyAlignment("right")}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>
        </div>

        <span className="toolbar-prop-divider" />

        {/* Reset to Original Size */}
        <button
          type="button"
          className="toolbar-action-btn"
          onClick={handleReset}
          title="Reset to original size"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {/* Delete Image */}
        <button
          type="button"
          className="toolbar-action-btn danger"
          onClick={handleRemove}
          title="Remove image from post"
        >
          <Trash2 size={13} />
          <span>Remove</span>
        </button>
      </div>

      {/* Resize Box & Handles */}
      <div
        className={`image-resize-box ${activeHandle ? `resizing-${activeHandle}` : ""}`}
        style={{
          top: `${box.top}px`,
          left: `${box.left}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        }}
      >
        {/* Corner Handles */}
        <div
          className="resize-handle handle-nw"
          onMouseDown={(e) => handleStartDrag("nw", e)}
          title="Resize Top-Left"
        />
        <div
          className="resize-handle handle-ne"
          onMouseDown={(e) => handleStartDrag("ne", e)}
          title="Resize Top-Right"
        />
        <div
          className="resize-handle handle-sw"
          onMouseDown={(e) => handleStartDrag("sw", e)}
          title="Resize Bottom-Left"
        />
        <div
          className="resize-handle handle-se"
          onMouseDown={(e) => handleStartDrag("se", e)}
          title="Resize Bottom-Right"
        />

        {/* Side Handles */}
        <div
          className="resize-handle handle-n"
          onMouseDown={(e) => handleStartDrag("n", e)}
          title="Resize Height (Top)"
        />
        <div
          className="resize-handle handle-s"
          onMouseDown={(e) => handleStartDrag("s", e)}
          title="Resize Height (Bottom)"
        />
        <div
          className="resize-handle handle-w"
          onMouseDown={(e) => handleStartDrag("w", e)}
          title="Resize Width (Left)"
        />
        <div
          className="resize-handle handle-e"
          onMouseDown={(e) => handleStartDrag("e", e)}
          title="Resize Width (Right)"
        />

        {/* Live Size Tooltip while dragging */}
        {isDragging && (
          <div className="resize-dimensions-badge">
            {Math.round(box.width)} × {Math.round(box.height)} px
          </div>
        )}
      </div>
    </div>
  );
};
