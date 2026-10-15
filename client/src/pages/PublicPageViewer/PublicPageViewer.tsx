import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL } from "../../services/api";
import type { PageComponent } from "../../components/PageBuilder/types";

// Block components
import { HeroBlock } from "../../components/PageBuilder/blocks/HeroBlock";
import { TextBlock } from "../../components/PageBuilder/blocks/TextBlock";
import { ImageBlock } from "../../components/PageBuilder/blocks/ImageBlock";
import { ButtonBlock } from "../../components/PageBuilder/blocks/ButtonBlock";
import { NavbarBlock } from "../../components/PageBuilder/blocks/NavbarBlock";
import { ColumnsBlock } from "../../components/PageBuilder/blocks/ColumnsBlock";
import { VideoBlock } from "../../components/PageBuilder/blocks/VideoBlock";
import { DividerBlock } from "../../components/PageBuilder/blocks/DividerBlock";
import { SpacerBlock } from "../../components/PageBuilder/blocks/SpacerBlock";
import { FooterBlock } from "../../components/PageBuilder/blocks/FooterBlock";

import "./PublicPageViewer.css";

interface PageData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  status: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface PublicPageViewerProps {
  isHome?: boolean;
}

export default function PublicPageViewer({ isHome = false }: PublicPageViewerProps) {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // When isHome is true or slug is empty/home/index, target "home"
  const targetSlug = isHome ? "home" : (slug || "home");

  useEffect(() => {
    const fetchPublicPage = async () => {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        const response = await fetch(`${API_URL}/public/content/${encodeURIComponent(targetSlug)}`);
        const data = await response.json();

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load page");
        }

        const pageData: PageData = data.content || data;
        setPage(pageData);

        // Update document title & meta tags
        const pageMetaTitle = pageData.metaTitle?.trim() || pageData.title?.trim() || "Page";
        document.title = pageMetaTitle;

        if (pageData.metaDescription?.trim()) {
          let metaTag = document.querySelector('meta[name="description"]');
          if (!metaTag) {
            metaTag = document.createElement("meta");
            metaTag.setAttribute("name", "description");
            document.head.appendChild(metaTag);
          }
          metaTag.setAttribute("content", pageData.metaDescription.trim());
        }

        // Parse page JSON components safely
        try {
          const parsed = typeof pageData.content === "string"
            ? JSON.parse(pageData.content)
            : pageData.content;
          if (Array.isArray(parsed)) {
            setComponents(parsed);
          } else {
            setComponents([]);
          }
        } catch (e) {
          console.error("Failed to parse page components JSON:", e);
          setComponents([]);
        }
      } catch (err) {
        console.error("PublicPageViewer error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPage();
  }, [targetSlug]);

  if (loading) {
    return (
      <div className="public-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading page...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="public-page-error-container">
        <div className="error-card">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>
            {isHome
              ? "No published Home page has been set up yet. Please create and publish a Home page in the CMS."
              : "The page you are looking for does not exist or has not been published yet."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
            {!isHome && (
              <Link to="/" className="error-back-btn">
                Go to Home
              </Link>
            )}
            <Link
              to="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 20px",
                backgroundColor: "#2563EB",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              CMS Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="public-page-error-container">
        <div className="error-card">
          <h2>Unable to Display Page</h2>
          <p>{error || "An unexpected error occurred."}</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
            <Link to="/" className="error-back-btn">
              Go to Home
            </Link>
            <Link
              to="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 20px",
                backgroundColor: "#2563EB",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="public-page-container">
      {components.length > 0 ? (
        components.map((comp) => {
          switch (comp.type) {
            case "navbar":
              return <NavbarBlock key={comp.id} component={comp} isPreviewMode={true} />;
            case "hero":
              return <HeroBlock key={comp.id} component={comp} isPreviewMode={true} />;
            case "text":
              return <TextBlock key={comp.id} component={comp} />;
            case "image":
              return <ImageBlock key={comp.id} component={comp} />;
            case "button":
              return <ButtonBlock key={comp.id} component={comp} isPreviewMode={true} />;
            case "columns":
              return <ColumnsBlock key={comp.id} component={comp} />;
            case "video":
              return <VideoBlock key={comp.id} component={comp} />;
            case "divider":
              return <DividerBlock key={comp.id} component={comp} />;
            case "spacer":
              return <SpacerBlock key={comp.id} component={comp} />;
            case "footer":
              return <FooterBlock key={comp.id} component={comp} isPreviewMode={true} />;
            default:
              return null;
          }
        })
      ) : (
        <article
          className="public-blog-article"
          style={{ maxWidth: "860px", margin: "40px auto", padding: "0 24px" }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
    </main>
  );
}
