import type { PageComponent } from "../types";

interface TextBlockProps {
  component: PageComponent;
}

export function TextBlock({ component }: TextBlockProps) {
  const variantClass = component.variant ? `variant-${component.variant}` : "";

  return (
    <section className={`preview-text ${variantClass}`}>
      <p>{component.text}</p>
    </section>
  );
}
