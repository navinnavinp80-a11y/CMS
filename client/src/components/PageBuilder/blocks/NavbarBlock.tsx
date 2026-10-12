import type { PageComponent } from "../types";

interface NavbarBlockProps {
  component: PageComponent;
  isPreviewMode?: boolean;
}

export function NavbarBlock({ component, isPreviewMode }: NavbarBlockProps) {
  return (
    <header className="preview-navbar">
      <div className="navbar-logo">
        {component.navbarLogo || "My Website"}
      </div>
      <nav className="navbar-links">
        {(component.navbarItems || []).map((item, index) => (
          <a
            key={index}
            href={item.url || "#"}
            className="navbar-link"
            onClick={(e) => {
              if (!isPreviewMode) {
                e.preventDefault();
              }
            }}
            target={isPreviewMode && item.url && item.url.startsWith("http") ? "_blank" : undefined}
            rel={isPreviewMode && item.url && item.url.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
