import type { PageComponent } from "../types";

interface DividerBlockProps {
  component: PageComponent;
}

export function DividerBlock({ component }: DividerBlockProps) {
  const style = component.dividerStyle || "solid";
  const width = component.dividerWidth || "100%";

  return (
    <div className="preview-divider">
      <hr
        style={{
          border: "none",
          borderTop: `2px ${style} #cbd5e1`,
          width: width,
          margin: "0 auto",
        }}
      />
    </div>
  );
}
