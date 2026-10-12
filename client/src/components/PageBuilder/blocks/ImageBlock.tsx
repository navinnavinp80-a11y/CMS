import type { PageComponent } from "../types";

interface ImageBlockProps {
  component: PageComponent;
}

export function ImageBlock({ component }: ImageBlockProps) {
  return (
    <section className="preview-image">
      <img src={component.imageUrl} alt="Page section" />
    </section>
  );
}
