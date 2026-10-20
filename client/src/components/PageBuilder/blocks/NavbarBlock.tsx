import { useNavigate } from "react-router-dom";
import type { PageComponent } from "../types";

interface NavbarBlockProps {
  component: PageComponent;
  isPreviewMode?: boolean;
}

export function normalizeNavbarUrl(rawUrl: string = ""): {
  url: string;
  isExternal: boolean;
} {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "#" || trimmed.startsWith("#")) {
    return { url: trimmed || "#", isExternal: false };
  }

  // Explicit external link with protocol
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) {
    try {
      const parsed = new URL(trimmed.startsWith("//") ? `http:${trimmed}` : trimmed);
      if (typeof window !== "undefined" && parsed.host === window.location.host) {
        return { url: parsed.pathname || "/", isExternal: false };
      }
    } catch {}
    return { url: trimmed, isExternal: true };
  }

  // Legacy /p/:slug match
  const legacyMatch = trimmed.match(/^\/p\/([a-zA-Z0-9_-]+)/);
  if (legacyMatch) {
    const slug = legacyMatch[1];
    return { url: (slug === "home" || slug === "index") ? "/" : `/${slug}`, isExternal: false };
  }

  // Relative path starting with /
  if (trimmed.startsWith("/")) {
    if (trimmed === "/" || trimmed === "/home" || trimmed === "/index") {
      return { url: "/home", isExternal: false };
    }
    return { url: trimmed, isExternal: false };
  }

  // Contains domain with dot (e.g. "example.com")
  if (trimmed.includes(".") && !trimmed.startsWith("/")) {
    return { url: `https://${trimmed}`, isExternal: true };
  }

  // Bare slug (e.g. "home", "about-us", "contact")
  if (trimmed === "home" || trimmed === "index") {
    return { url: "/home", isExternal: false };
  }
  return { url: `/${trimmed}`, isExternal: false };
}

export function NavbarBlock({ component, isPreviewMode }: NavbarBlockProps) {
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, rawUrl: string) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }

    const { url: cleanUrl, isExternal } = normalizeNavbarUrl(rawUrl);

    if (isExternal) {
      e.preventDefault();
      window.open(cleanUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (cleanUrl.startsWith("#")) {
      return;
    }

    // Internal public route navigation (e.g. /p/about-us)
    e.preventDefault();
    navigate(cleanUrl);
  };

  const variantClass = component.variant ? `variant-${component.variant}` : "";

  return (
    <header className={`preview-navbar ${variantClass}`}>
      <div className="navbar-logo">
        {component.navbarLogo || "My Website"}
      </div>
      <nav className="navbar-links">
        {(component.navbarItems || []).map((item, index) => {
          const { url: cleanUrl, isExternal } = normalizeNavbarUrl(item.url);

          return (
            <a
              key={index}
              href={cleanUrl}
              className="navbar-link"
              onClick={(e) => handleLinkClick(e, item.url)}
              target={isPreviewMode && isExternal ? "_blank" : undefined}
              rel={isPreviewMode && isExternal ? "noopener noreferrer" : undefined}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}

