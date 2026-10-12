import type { PageComponent } from "../types";

interface TextBlockProps {
  component: PageComponent;
}

export function TextBlock({ component }: TextBlockProps) {
  return (
    <section className="preview-text">
      <p>{component.text}</p>
    </section>
  );
}
