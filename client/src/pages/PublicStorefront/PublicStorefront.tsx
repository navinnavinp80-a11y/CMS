import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicStoreConfig } from "../../services/api";
import type { StoreSectionData, StoreThemeData } from "../../services/api";
import { StorefrontRenderer } from "../StoreEditor/StorefrontRenderer";
import { getThemeById } from "../../themes/registry";
import { ShoppingBag, ArrowLeft, AlertCircle } from "lucide-react";
import "./PublicStorefront.css";

interface PublishedStoreState {
  storeName: string;
  themeId?: string;
  sections: StoreSectionData[];
  theme: StoreThemeData;
  publishedAt?: string;
}

export default function PublicStorefront() {
  const { slug } = useParams<{ slug?: string }>();
  const [storeData, setStoreData] = useState<PublishedStoreState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDraftOrUnpublished, setIsDraftOrUnpublished] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        setError("");
        setIsDraftOrUnpublished(false);

        const data = await getPublicStoreConfig(slug);
        setStoreData(data as PublishedStoreState);

        // Update document title
        const title = data.storeName ? `${data.storeName} | Online Store` : "Online Store";
        document.title = title;
      } catch (err: any) {
        console.error("Public storefront error:", err);
        if (
          err.message?.includes("not found") ||
          err.message?.includes("unpublished") ||
          err.message?.includes("maintenance")
        ) {
          setIsDraftOrUnpublished(true);
        } else {
          setError(err.message || "Failed to load storefront");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="storefront-public-loading">
        <div className="storefront-spinner" />
        <p>Loading storefront...</p>
      </div>
    );
  }

  if (isDraftOrUnpublished) {
    return (
      <div className="storefront-public-fallback">
        <div className="fallback-card">
          <div className="fallback-icon">
            <ShoppingBag size={36} />
          </div>
          <h1>Store Under Construction</h1>
          <p>
            This storefront is currently in draft mode and has not been published yet.
            If you are the store owner, please log in to the CMS and click{" "}
            <strong>Publish</strong> in the Store Editor.
          </p>
          <div className="fallback-actions">
            <Link to="/store-editor" className="fallback-primary-btn">
              Open Store Editor
            </Link>
            <Link to="/dashboard" className="fallback-secondary-btn">
              <ArrowLeft size={16} /> CMS Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="storefront-public-fallback">
        <div className="fallback-card">
          <div className="fallback-icon error">
            <AlertCircle size={36} />
          </div>
          <h1>Unable to Load Storefront</h1>
          <p>{error || "An unexpected error occurred while loading the store."}</p>
          <div className="fallback-actions">
            <Link to="/dashboard" className="fallback-primary-btn">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const themeEntry = getThemeById(storeData.themeId);
  const ThemeComponent = themeEntry.component || StorefrontRenderer;

  return (
    <main className={`public-storefront-wrapper theme-${themeEntry.slug}`}>
      <ThemeComponent
        sections={storeData.sections as any}
        theme={storeData.theme as any}
        isEditor={false}
      />
    </main>
  );
}
