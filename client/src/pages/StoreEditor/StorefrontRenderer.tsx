import React from "react";
import type { StoreSection, StoreTheme, StoreProductItem } from "./types";
import { DEFAULT_PRODUCTS } from "./types";
import { ShoppingBag, ArrowRight, Mail, Sparkles, Tag } from "lucide-react";
import "./StorefrontRenderer.css";

interface StorefrontRendererProps {
  sections: StoreSection[];
  theme: StoreTheme;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  isEditor?: boolean;
}

export const StorefrontRenderer: React.FC<StorefrontRendererProps> = ({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  isEditor = false,
}) => {
  // Theme computed values
  const getButtonBorderRadius = () => {
    switch (theme.buttonStyle) {
      case "square":
        return "0px";
      case "pill":
        return "9999px";
      case "rounded":
      default:
        return "8px";
    }
  };

  const getContentMaxWidth = () => {
    switch (theme.contentWidth) {
      case "compact":
        return "1000px";
      case "full":
        return "1440px";
      case "normal":
      default:
        return "1200px";
    }
  };

  const getSectionSpacing = () => {
    switch (theme.sectionSpacing) {
      case "compact":
        return "32px";
      case "spacious":
        return "80px";
      case "normal":
      default:
        return "56px";
    }
  };

  const themeStyles = {
    "--store-primary": theme.primaryColor || "#202223",
    "--store-secondary": theme.secondaryColor || "#4f46e5",
    "--store-bg": theme.backgroundColor || "#ffffff",
    "--store-font": theme.fontFamily || "Inter, sans-serif",
    "--store-btn-radius": getButtonBorderRadius(),
    "--store-content-max": getContentMaxWidth(),
    "--store-spacing": getSectionSpacing(),
    fontFamily: theme.fontFamily || "Inter, sans-serif",
    backgroundColor: theme.backgroundColor || "#ffffff",
  } as React.CSSProperties;

  const renderSection = (section: StoreSection) => {
    const isSelected = isEditor && selectedSectionId === section.id;
    const settings = section.settings || {};

    const sectionWrapperClass = `store-section-wrapper ${
      isEditor ? "is-editor-mode" : ""
    } ${isSelected ? "selected-section" : ""}`;

    const handleSectionClick = (e: React.MouseEvent) => {
      if (isEditor && onSelectSection) {
        e.stopPropagation();
        onSelectSection(section.id);
      }
    };

    switch (section.type) {
      /* ==================== ANNOUNCEMENT BAR ==================== */
      case "announcement":
        return (
          <div
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div
              className="storefront-announcement"
              style={{
                backgroundColor: settings.backgroundColor || "#111827",
                color: settings.textColor || "#ffffff",
              }}
            >
              {settings.linkUrl ? (
                <a
                  href={isEditor ? "#" : settings.linkUrl}
                  className="announcement-link"
                  style={{ color: settings.textColor || "#ffffff" }}
                  onClick={(e) => isEditor && e.preventDefault()}
                >
                  <span>{settings.text || "Welcome to our store"}</span>
                  <ArrowRight size={13} />
                </a>
              ) : (
                <span>{settings.text || "Welcome to our store"}</span>
              )}
            </div>
          </div>
        );

      /* ==================== HEADER / NAVIGATION ==================== */
      case "header":
        return (
          <header
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div
              className="storefront-header"
              style={{ backgroundColor: settings.backgroundColor || "#ffffff" }}
            >
              <div className="storefront-header-inner">
                <div className="storefront-brand">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={settings.storeName || "Store Logo"}
                      className="storefront-brand-logo"
                    />
                  ) : (
                    <>
                      <ShoppingBag size={22} className="storefront-brand-icon" />
                      <span className="storefront-store-name">
                        {settings.storeName || "My Store"}
                      </span>
                    </>
                  )}
                </div>
                <nav className="storefront-nav">
                  {(settings.navLinks || [
                    { label: "Home", url: "/" },
                    { label: "Catalog", url: "/store" },
                    { label: "About", url: "#" },
                    { label: "Contact", url: "#" },
                  ]).map((link: { label: string; url: string }, index: number) => (
                    <a
                      key={index}
                      href={isEditor ? "#" : link.url}
                      className="storefront-nav-link"
                      onClick={(e) => isEditor && e.preventDefault()}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="storefront-header-actions">
                  <button
                    type="button"
                    className="storefront-cart-btn"
                    title="Shopping Cart"
                    onClick={(e) => isEditor && e.preventDefault()}
                  >
                    <ShoppingBag size={18} />
                    <span className="cart-badge">0</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        );

      /* ==================== HERO BANNER ==================== */
      case "hero": {
        const overlayOpacity =
          typeof settings.overlayOpacity === "number"
            ? settings.overlayOpacity
            : 0.45;

        return (
          <section
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div
              className={`storefront-hero text-${settings.textAlign || "center"} ${
                settings.backgroundImage ? "has-bg-img" : ""
              }`}
              style={{
                backgroundColor: settings.backgroundColor || "#e9eef5",
                backgroundImage: settings.backgroundImage
                  ? `url(${settings.backgroundImage})`
                  : undefined,
                backgroundPosition: settings.imagePosition || "center",
              }}
            >
              {settings.backgroundImage && (
                <div
                  className="storefront-hero-overlay"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
                  }}
                />
              )}
              <div
                className="storefront-hero-content"
                style={{
                  color:
                    settings.textColor ||
                    (settings.backgroundImage ? "#ffffff" : "#111827"),
                }}
              >
                {settings.subtitle && (
                  <span
                    className="storefront-hero-sub"
                    style={{
                      color:
                        settings.textColor ||
                        (settings.backgroundImage ? "#ffffff" : "#4b5563"),
                    }}
                  >
                    <Sparkles size={14} />
                    {settings.subtitle}
                  </span>
                )}
                <h1
                  style={{
                    color:
                      settings.textColor ||
                      (settings.backgroundImage ? "#ffffff" : "#111827"),
                  }}
                >
                  {settings.heading || "Discover your next favorite."}
                </h1>
                {settings.description && (
                  <p
                    className="storefront-hero-desc"
                    style={{
                      color:
                        settings.textColor ||
                        (settings.backgroundImage ? "rgba(255, 255, 255, 0.9)" : "#4b5563"),
                    }}
                  >
                    {settings.description}
                  </p>
                )}
                {settings.buttonText && (
                  <div className="storefront-hero-cta">
                    <a
                      href={isEditor ? "#" : settings.buttonUrl || "#"}
                      className="storefront-primary-btn"
                      onClick={(e) => isEditor && e.preventDefault()}
                    >
                      {settings.buttonText}
                      <ArrowRight size={16} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      }

      /* ==================== FEATURED PRODUCTS & PRODUCT GRID ==================== */
      case "featured-products":
      case "product-grid": {
        const count = Number(settings.productsCount) || 4;
        const columns = Number(settings.gridColumns) || 4;
        const sourceProducts: StoreProductItem[] =
          Array.isArray(settings.products) && settings.products.length > 0
            ? settings.products
            : DEFAULT_PRODUCTS;
        const displayProducts = sourceProducts.slice(0, count);

        return (
          <section
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div className="storefront-container storefront-products-section">
              <div className="storefront-section-header">
                <div>
                  <h2 className="storefront-section-title">
                    {settings.heading ||
                      (section.type === "featured-products"
                        ? "Featured Products"
                        : "Product Grid")}
                  </h2>
                  <div className="placeholder-catalog-notice">
                    <Tag size={13} />
                    <span>
                      Editable Draft Products • Distinguishes from database items
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="storefront-products-grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {displayProducts.map((prod, pIdx) => (
                  <div key={prod.id || pIdx} className="storefront-product-card">
                    <div className="product-card-media">
                      <img
                        src={
                          prod.imageUrl ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={prod.title}
                        loading="lazy"
                      />
                      {prod.badge && (
                        <span className="product-badge">{prod.badge}</span>
                      )}
                    </div>
                    <div className="product-card-body">
                      <h3 className="product-title">{prod.title}</h3>
                      {prod.description && (
                        <p className="product-card-desc">{prod.description}</p>
                      )}
                      <div className="product-card-footer">
                        <div className="product-pricing-wrap">
                          <span className="product-price">{prod.price}</span>
                          {prod.compareAtPrice && (
                            <span className="product-compare-price">
                              {prod.compareAtPrice}
                            </span>
                          )}
                        </div>
                        <a
                          href={isEditor ? "#" : prod.productUrl || "#"}
                          className="product-add-btn"
                          onClick={(e) => {
                            if (isEditor) e.preventDefault();
                          }}
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      /* ==================== IMAGE BANNER ==================== */
      case "image-banner":
        return (
          <section
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div className="storefront-container storefront-image-banner-container">
              <div className="storefront-image-banner">
                <div className="image-banner-visual">
                  <img
                    src={
                      settings.imageUrl ||
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={settings.heading || "Image banner"}
                    loading="lazy"
                    style={{
                      objectPosition: settings.imagePosition || "center",
                    }}
                  />
                </div>
                <div className="image-banner-overlay">
                  <div
                    className={`image-banner-text text-${
                      settings.textAlign || "left"
                    }`}
                  >
                    <h2>{settings.heading || "Artisan Quality & Design"}</h2>
                    <p>
                      {settings.description ||
                        "Crafted using sustainable materials built to last a lifetime."}
                    </p>
                    {settings.buttonText && (
                      <a
                        href={isEditor ? "#" : settings.buttonUrl || "#"}
                        className="storefront-primary-btn"
                        onClick={(e) => isEditor && e.preventDefault()}
                      >
                        {settings.buttonText}
                        <ArrowRight size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      /* ==================== RICH TEXT ==================== */
      case "rich-text":
        return (
          <section
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div className="storefront-container storefront-rich-text-container">
              <div
                className={`storefront-rich-text text-${
                  settings.textAlign || "center"
                }`}
              >
                <h2
                  style={{
                    color: settings.textColor || "#111827",
                  }}
                >
                  {settings.heading || "Our Commitment to Craft"}
                </h2>
                <div className="rich-text-body">
                  <p
                    style={{
                      color: settings.textColor || "#4b5563",
                    }}
                  >
                    {settings.body ||
                      "Every piece in our collection is thoughtfully designed and ethically sourced to ensure lasting quality and timeless style."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      /* ==================== NEWSLETTER ==================== */
      case "newsletter":
        return (
          <section
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div className="storefront-container storefront-newsletter-container">
              <div className="storefront-newsletter">
                <div className="newsletter-icon-wrap">
                  <Mail size={28} />
                </div>
                <h2>{settings.heading || "Subscribe to our emails"}</h2>
                <p>
                  {settings.description ||
                    "Be the first to learn about seasonal drops, exclusive perks, and behind-the-scenes stories."}
                </p>
                <form
                  className="newsletter-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!isEditor) alert("Thank you for subscribing!");
                  }}
                >
                  <input
                    type="email"
                    placeholder={
                      settings.inputPlaceholder || "Enter your email address..."
                    }
                    required
                    disabled={isEditor}
                  />
                  <button type="submit" className="storefront-primary-btn">
                    {settings.buttonText || "Subscribe"}
                  </button>
                </form>
              </div>
            </div>
          </section>
        );

      /* ==================== FOOTER ==================== */
      case "footer": {
        const footerLinks = settings.navLinks || [
          { label: "Catalog", url: "/store" },
          { label: "About Us", url: "#" },
          { label: "Shipping & Returns", url: "#" },
          { label: "Contact Us", url: "#" },
        ];

        return (
          <footer
            key={section.id}
            className={sectionWrapperClass}
            onClick={handleSectionClick}
            data-section-id={section.id}
          >
            {isEditor && (
              <div className="section-editor-tag">
                <span>{section.title}</span>
              </div>
            )}
            <div
              className="storefront-footer"
              style={{
                backgroundColor: settings.backgroundColor || "#111827",
                color: settings.textColor || "#9ca3af",
              }}
            >
              <div className="storefront-container storefront-footer-inner">
                <div className="storefront-footer-top">
                  <div className="footer-col-brand">
                    <div className="storefront-brand">
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt={settings.storeName || "Logo"}
                          className="storefront-brand-logo footer-logo"
                        />
                      ) : (
                        <>
                          <ShoppingBag size={20} />
                          <span
                            className="storefront-store-name"
                            style={{ color: "#ffffff" }}
                          >
                            {settings.storeName || "My Store"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="footer-tagline">
                      {settings.footerDescription ||
                        "Premium goods curated with passion and attention to detail."}
                    </p>
                  </div>
                  <div className="footer-col-links">
                    <h4>Navigation</h4>
                    <ul>
                      {footerLinks.map((link: { label: string; url: string }, i: number) => (
                        <li key={i}>
                          <a
                            href={isEditor ? "#" : link.url}
                            onClick={(e) => isEditor && e.preventDefault()}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="footer-col-links">
                    <h4>Customer Care</h4>
                    <ul>
                      <li>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          FAQ
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          Privacy Policy
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          Terms of Service
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="storefront-footer-bottom">
                  <span>
                    {settings.footerText || "© 2026 My Store. All rights reserved."}
                  </span>
                  <span>Powered by MERN CMS Headless Store</span>
                </div>
              </div>
            </div>
          </footer>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="storefront-root" style={themeStyles}>
      {sections.length === 0 ? (
        <div className="storefront-empty-state">
          <ShoppingBag size={48} />
          <h3>No sections added yet</h3>
          <p>Add sections from the sidebar picker to start building your store.</p>
        </div>
      ) : (
        sections.map((section) => renderSection(section))
      )}
    </div>
  );
};
