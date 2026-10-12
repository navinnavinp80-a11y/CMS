import type { PageComponent } from "../types";

interface SpacerBlockProps {
  component: PageComponent;
}

export function SpacerBlock({ component }: SpacerBlockProps) {
  const height = typeof component.height === "number" ? component.height : Number(component.height) || 40;

  return (
    <div
      className="preview-spacer"
      style={{ height: `${height}px` }}
    >
      <div className="spacer-indicator">Spacer ({height}px)</div>
    </div>
  );
}
