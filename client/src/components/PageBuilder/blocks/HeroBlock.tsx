import type { PageComponent } from "../types";

interface HeroBlockProps {
  component: PageComponent;
  isPreviewMode?: boolean;
}

export function HeroBlock({ component, isPreviewMode }: HeroBlockProps) {
  const url = component.buttonUrl || "#";
  const variantClass = component.variant ? `variant-${component.variant}` : "";

  return (
    <section className={`preview-hero ${variantClass}`}>
      {component.badge && <div className="hero-pill-badge">{component.badge}</div>}
      <h1>{component.title}</h1>
      <p>{component.subtitle}</p>
      {isPreviewMode && url && url !== "#" ? (
        <a
          href={url}
          className="hero-link-btn"
          target={url.startsWith("http") ? "_blank" : undefined}
          rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {component.buttonText || "Get Started"}
        </a>
      ) : (
        <button type="button" onClick={(e) => e.preventDefault()}>
          {component.buttonText}
        </button>
      )}
    </section>
  );
}
