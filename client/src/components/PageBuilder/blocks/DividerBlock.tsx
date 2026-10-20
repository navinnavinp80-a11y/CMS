import type { PageComponent } from "../types";

interface DividerBlockProps {
  component: PageComponent;
}

export function DividerBlock({ component }: DividerBlockProps) {
  const style = component.dividerStyle || "solid";
  const width = component.dividerWidth || "100%";
  const variantClass = component.variant ? `variant-${component.variant}` : "";

  return (
    <div className={`preview-divider ${variantClass}`}>
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
