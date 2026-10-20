import type { PageComponent } from "../types";

interface FooterBlockProps {
  component: PageComponent;
  isPreviewMode?: boolean;
}

export function FooterBlock({ component, isPreviewMode }: FooterBlockProps) {
  const logo = component.footerLogo || "My Website";
  const description = component.footerDescription || "Building beautiful digital experiences.";
  const copyright = component.footerCopyright || "© 2026 My Website. All rights reserved.";
  const links = component.footerLinks || [];
  const variantClass = component.variant ? `variant-${component.variant}` : "";

  return (
    <footer className={`preview-footer ${variantClass}`}>
      <div className="footer-content">
        {logo && <div className="footer-logo">{logo}</div>}
        {description && <p className="footer-description">{description}</p>}
        {links.length > 0 && (
          <nav className="footer-links">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url || "#"}
                className="footer-link"
                onClick={(e) => {
                  if (!isPreviewMode) {
                    e.preventDefault();
                  }
                }}
                target={isPreviewMode && link.url && link.url.startsWith("http") ? "_blank" : undefined}
                rel={isPreviewMode && link.url && link.url.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
      {copyright && (
        <div className="footer-bottom">
          <p>{copyright}</p>
        </div>
      )}
    </footer>
  );
}
