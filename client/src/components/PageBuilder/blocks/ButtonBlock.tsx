import type { PageComponent } from "../types";

interface ButtonBlockProps {
  component: PageComponent;
  isPreviewMode?: boolean;
}

export function ButtonBlock({ component, isPreviewMode }: ButtonBlockProps) {
  const url = component.buttonUrl || "#";
  const variantClass = component.variant ? `variant-${component.variant}` : "";

  if (isPreviewMode && url && url !== "#") {
    return (
      <section className={`preview-button ${variantClass}`}>
        <a
          href={url}
          className="button-link-btn"
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {component.buttonText || "Button"}
        </a>
      </section>
    );
  }

  return (
    <section className={`preview-button ${variantClass}`}>
      <button type="button" onClick={(e) => e.preventDefault()}>
        {component.buttonText || "Button"}
      </button>
    </section>
  );
}
