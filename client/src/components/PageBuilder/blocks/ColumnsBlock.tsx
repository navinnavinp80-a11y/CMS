import type { PageComponent } from "../types";

interface ColumnsBlockProps {
  component: PageComponent;
}

export function ColumnsBlock({ component }: ColumnsBlockProps) {
  return (
    <section className="preview-columns">
      <div className="column">
        {component.columns?.left.type === "image" ? (
          <img
            src={component.columns.left.imageUrl || "https://via.placeholder.com/400x250?text=Image"}
            alt="Left column"
          />
        ) : (
          <p>{component.columns?.left.text || "Left column content"}</p>
        )}
      </div>
      <div className="column">
        {component.columns?.right.type === "image" ? (
          <img
            src={component.columns.right.imageUrl || "https://via.placeholder.com/400x250?text=Image"}
            alt="Right column"
          />
        ) : (
          <p>{component.columns?.right.text || "Right column content"}</p>
        )}
      </div>
    </section>
  );
}
