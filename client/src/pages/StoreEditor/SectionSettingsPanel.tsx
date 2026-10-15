import React, { useState } from "react";
import type { StoreSection, StoreProductItem } from "./types";
import { DEFAULT_PRODUCTS } from "./types";
import { ImageInputControl } from "./ImageInputControl";
import {
  ArrowLeft,
  Trash2,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  ChevronUp,
  Tag,
  DollarSign,
  Package,
} from "lucide-react";

interface SectionSettingsPanelProps {
  section: StoreSection;
  onUpdateSettings: (sectionId: string, newSettings: Record<string, any>) => void;
  onUpdateTitle: (sectionId: string, newTitle: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onBack: () => void;
}

export const SectionSettingsPanel: React.FC<SectionSettingsPanelProps> = ({
  section,
  onUpdateSettings,
  onUpdateTitle,
  onDeleteSection,
  onBack,
}) => {
  const settings = section.settings || {};
  const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(0);

  const handleFieldChange = (field: string, value: any) => {
    onUpdateSettings(section.id, {
      ...settings,
      [field]: value,
    });
  };

  const renderSectionFields = () => {
    switch (section.type) {
      /* ==================== ANNOUNCEMENT BAR ==================== */
      case "announcement":
        return (
          <>
            <div className="settings-field">
              <label>Announcement Text</label>
              <input
                type="text"
                value={settings.text || ""}
                onChange={(e) => handleFieldChange("text", e.target.value)}
                placeholder="e.g. Free shipping on all orders over $50!"
              />
            </div>

            <div className="settings-field">
              <label>Optional Link Destination (URL)</label>
              <input
                type="text"
                value={settings.linkUrl || ""}
                onChange={(e) => handleFieldChange("linkUrl", e.target.value)}
                placeholder="e.g. /store or https://..."
              />
              <span className="settings-field-helper">
                Leaves announcement clickable if set
              </span>
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Background Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.backgroundColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("backgroundColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("backgroundColor", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="settings-field">
                <label>Text Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.textColor || "#ffffff"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.textColor || "#ffffff"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </>
        );

      /* ==================== HEADER / NAVIGATION ==================== */
      case "header": {
        const navLinks = settings.navLinks || [
          { label: "Home", url: "/" },
          { label: "Catalog", url: "/store" },
          { label: "About", url: "#" },
          { label: "Contact", url: "#" },
        ];

        const handleLinkChange = (index: number, key: string, val: string) => {
          const updated = [...navLinks];
          updated[index] = { ...updated[index], [key]: val };
          handleFieldChange("navLinks", updated);
        };

        const handleAddLink = () => {
          handleFieldChange("navLinks", [
            ...navLinks,
            { label: `Link ${navLinks.length + 1}`, url: "#" },
          ]);
        };

        const handleRemoveLink = (index: number) => {
          const updated = navLinks.filter((_: any, i: number) => i !== index);
          handleFieldChange("navLinks", updated);
        };

        return (
          <>
            <div className="settings-field">
              <label>Store Brand Name</label>
              <input
                type="text"
                value={settings.storeName || ""}
                onChange={(e) => handleFieldChange("storeName", e.target.value)}
                placeholder="My Store"
              />
            </div>

            <ImageInputControl
              label="Logo Image (Optional)"
              value={settings.logoUrl || ""}
              onChange={(url) => handleFieldChange("logoUrl", url)}
              helperText="Replaces text store name with logo if uploaded"
            />

            <div className="settings-field">
              <label>Header Background Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={settings.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleFieldChange("backgroundColor", e.target.value)
                  }
                />
                <input
                  type="text"
                  value={settings.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    handleFieldChange("backgroundColor", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="settings-field">
              <div className="settings-field-header">
                <label>Navigation Links</label>
                <button
                  type="button"
                  className="settings-tiny-add-btn"
                  onClick={handleAddLink}
                >
                  <Plus size={13} /> Add Link
                </button>
              </div>

              <div className="settings-nav-links-list">
                {navLinks.map((item: { label: string; url: string }, idx: number) => (
                  <div key={idx} className="settings-nav-link-row">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleLinkChange(idx, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="nav-label-input"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) =>
                        handleLinkChange(idx, "url", e.target.value)
                      }
                      placeholder="URL"
                      className="nav-url-input"
                    />
                    <button
                      type="button"
                      className="nav-remove-btn"
                      onClick={() => handleRemoveLink(idx)}
                      title="Remove link"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      }

      /* ==================== HERO BANNER ==================== */
      case "hero":
        return (
          <>
            <ImageInputControl
              label="Hero Background Image"
              value={settings.backgroundImage || ""}
              onChange={(url) => handleFieldChange("backgroundImage", url)}
              helperText="Select from Media Library or upload a high-res image"
            />

            {settings.backgroundImage && (
              <div className="settings-field-row">
                <div className="settings-field">
                  <label>Image Position</label>
                  <select
                    value={settings.imagePosition || "center"}
                    onChange={(e) =>
                      handleFieldChange("imagePosition", e.target.value)
                    }
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <div className="settings-field">
                  <label>
                    Overlay Opacity (
                    {Math.round((settings.overlayOpacity ?? 0.45) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.9"
                    step="0.05"
                    value={settings.overlayOpacity ?? 0.45}
                    onChange={(e) =>
                      handleFieldChange("overlayOpacity", parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            )}

            <div className="settings-field">
              <label>Heading</label>
              <input
                type="text"
                value={settings.heading || ""}
                onChange={(e) => handleFieldChange("heading", e.target.value)}
                placeholder="Hero headline"
              />
            </div>

            <div className="settings-field">
              <label>Subtitle / Category Tag</label>
              <input
                type="text"
                value={settings.subtitle || ""}
                onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                placeholder="Short tagline above heading"
              />
            </div>

            <div className="settings-field">
              <label>Description</label>
              <textarea
                rows={3}
                value={settings.description || ""}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Supporting description under the hero heading..."
              />
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Button Text</label>
                <input
                  type="text"
                  value={settings.buttonText || ""}
                  onChange={(e) =>
                    handleFieldChange("buttonText", e.target.value)
                  }
                  placeholder="Shop now"
                />
              </div>

              <div className="settings-field">
                <label>Button URL</label>
                <input
                  type="text"
                  value={settings.buttonUrl || ""}
                  onChange={(e) =>
                    handleFieldChange("buttonUrl", e.target.value)
                  }
                  placeholder="#products"
                />
              </div>
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Background Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.backgroundColor || "#e9eef5"}
                    onChange={(e) =>
                      handleFieldChange("backgroundColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor || "#e9eef5"}
                    onChange={(e) =>
                      handleFieldChange("backgroundColor", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="settings-field">
                <label>Text Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.textColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.textColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="settings-field">
              <label>Text Alignment</label>
              <div className="alignment-toggle-group">
                <button
                  type="button"
                  className={
                    settings.textAlign === "left" ? "toggle-btn active" : "toggle-btn"
                  }
                  onClick={() => handleFieldChange("textAlign", "left")}
                  title="Left align"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  className={
                    (!settings.textAlign || settings.textAlign === "center")
                      ? "toggle-btn active"
                      : "toggle-btn"
                  }
                  onClick={() => handleFieldChange("textAlign", "center")}
                  title="Center align"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  className={
                    settings.textAlign === "right" ? "toggle-btn active" : "toggle-btn"
                  }
                  onClick={() => handleFieldChange("textAlign", "right")}
                  title="Right align"
                >
                  <AlignRight size={16} />
                </button>
              </div>
            </div>
          </>
        );

      /* ==================== FEATURED PRODUCTS & PRODUCT GRID ==================== */
      case "featured-products":
      case "product-grid": {
        const productsList: StoreProductItem[] =
          Array.isArray(settings.products) && settings.products.length > 0
            ? settings.products
            : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));

        const handleProductField = (
          prodIndex: number,
          field: keyof StoreProductItem,
          value: any
        ) => {
          const updated = [...productsList];
          updated[prodIndex] = { ...updated[prodIndex], [field]: value };
          handleFieldChange("products", updated);
        };

        const handleAddProductCard = () => {
          const newProd: StoreProductItem = {
            id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: `Product ${productsList.length + 1}`,
            description: "Handcrafted quality item with modern design details.",
            price: "$49.00",
            compareAtPrice: "$65.00",
            imageUrl:
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
            productUrl: "#",
            badge: "New",
          };
          const updated = [...productsList, newProd];
          handleFieldChange("products", updated);
          setExpandedProductIndex(updated.length - 1);
        };

        const handleDeleteProductCard = (prodIndex: number) => {
          const updated = productsList.filter((_, i) => i !== prodIndex);
          handleFieldChange("products", updated);
          if (expandedProductIndex === prodIndex) {
            setExpandedProductIndex(null);
          }
        };

        return (
          <>
            <div className="settings-field">
              <label>Section Heading</label>
              <input
                type="text"
                value={settings.heading || ""}
                onChange={(e) => handleFieldChange("heading", e.target.value)}
                placeholder="e.g. Featured Products"
              />
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Visible Limit</label>
                <select
                  value={settings.productsCount || 4}
                  onChange={(e) =>
                    handleFieldChange("productsCount", Number(e.target.value))
                  }
                >
                  <option value={2}>2 products</option>
                  <option value={3}>3 products</option>
                  <option value={4}>4 products</option>
                  <option value={6}>6 products</option>
                  <option value={8}>8 products</option>
                  <option value={12}>12 products</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Grid Columns</label>
                <select
                  value={settings.gridColumns || 4}
                  onChange={(e) =>
                    handleFieldChange("gridColumns", Number(e.target.value))
                  }
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
            </div>

            <div className="settings-info-box">
              <p>
                <strong>Editable Draft Products:</strong> These products are
                managed directly within your Store Editor draft. Real database
                product syncing is distinguished and will link when a product
                catalog API is attached.
              </p>
            </div>

            <div className="settings-field">
              <div className="settings-field-header">
                <label>
                  Product Cards ({productsList.length})
                </label>
                <button
                  type="button"
                  className="settings-tiny-add-btn"
                  onClick={handleAddProductCard}
                >
                  <Plus size={13} /> Add Product Card
                </button>
              </div>

              <div className="settings-products-accordion">
                {productsList.map((prod, pIdx) => {
                  const isExpanded = expandedProductIndex === pIdx;

                  return (
                    <div
                      key={prod.id || pIdx}
                      className={`settings-product-accordion-item ${
                        isExpanded ? "expanded" : ""
                      }`}
                    >
                      <div
                        className="accordion-item-summary"
                        onClick={() =>
                          setExpandedProductIndex(isExpanded ? null : pIdx)
                        }
                      >
                        <div className="summary-thumb">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt="" />
                          ) : (
                            <Package size={16} />
                          )}
                        </div>
                        <div className="summary-info">
                          <span className="summary-title">
                            {prod.title || "Untitled Product"}
                          </span>
                          <span className="summary-price">{prod.price}</span>
                        </div>
                        <div className="summary-actions">
                          <button
                            type="button"
                            className="summary-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProductCard(pIdx);
                            }}
                            title="Delete product card"
                          >
                            <Trash2 size={13} />
                          </button>
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="accordion-item-details">
                          <div className="settings-field">
                            <label>Product Title</label>
                            <input
                              type="text"
                              value={prod.title}
                              onChange={(e) =>
                                handleProductField(pIdx, "title", e.target.value)
                              }
                            />
                          </div>

                          <div className="settings-field-row">
                            <div className="settings-field">
                              <label>Price</label>
                              <div className="input-with-prefix">
                                <DollarSign size={13} />
                                <input
                                  type="text"
                                  value={prod.price}
                                  onChange={(e) =>
                                    handleProductField(
                                      pIdx,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  placeholder="$79.00"
                                />
                              </div>
                            </div>

                            <div className="settings-field">
                              <label>Compare-at Price</label>
                              <div className="input-with-prefix">
                                <Tag size={13} />
                                <input
                                  type="text"
                                  value={prod.compareAtPrice || ""}
                                  onChange={(e) =>
                                    handleProductField(
                                      pIdx,
                                      "compareAtPrice",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. $99.00"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="settings-field">
                            <label>Badge / Tag</label>
                            <input
                              type="text"
                              value={prod.badge || ""}
                              onChange={(e) =>
                                handleProductField(pIdx, "badge", e.target.value)
                              }
                              placeholder="e.g. Bestseller, New, 20% Off"
                            />
                          </div>

                          <div className="settings-field">
                            <label>Description</label>
                            <textarea
                              rows={2}
                              value={prod.description || ""}
                              onChange={(e) =>
                                handleProductField(
                                  pIdx,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Short product specs or material summary..."
                            />
                          </div>

                          <div className="settings-field">
                            <label>Product Destination URL</label>
                            <input
                              type="text"
                              value={prod.productUrl || ""}
                              onChange={(e) =>
                                handleProductField(
                                  pIdx,
                                  "productUrl",
                                  e.target.value
                                )
                              }
                              placeholder="#"
                            />
                          </div>

                          <ImageInputControl
                            label="Product Image"
                            value={prod.imageUrl || ""}
                            onChange={(url) =>
                              handleProductField(pIdx, "imageUrl", url)
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      }

      /* ==================== IMAGE BANNER ==================== */
      case "image-banner":
        return (
          <>
            <ImageInputControl
              label="Banner Image"
              value={settings.imageUrl || ""}
              onChange={(url) => handleFieldChange("imageUrl", url)}
              helperText="High-resolution banner visual (Unsplash or Media Library)"
            />

            <div className="settings-field">
              <label>Heading</label>
              <input
                type="text"
                value={settings.heading || ""}
                onChange={(e) => handleFieldChange("heading", e.target.value)}
                placeholder="Banner headline"
              />
            </div>

            <div className="settings-field">
              <label>Description</label>
              <textarea
                rows={3}
                value={settings.description || ""}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Describe your promotion, capsule collection, or seasonal drop..."
              />
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Button Text</label>
                <input
                  type="text"
                  value={settings.buttonText || ""}
                  onChange={(e) =>
                    handleFieldChange("buttonText", e.target.value)
                  }
                  placeholder="e.g. Explore Collection"
                />
              </div>

              <div className="settings-field">
                <label>Button URL</label>
                <input
                  type="text"
                  value={settings.buttonUrl || ""}
                  onChange={(e) =>
                    handleFieldChange("buttonUrl", e.target.value)
                  }
                  placeholder="#"
                />
              </div>
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Image Position</label>
                <select
                  value={settings.imagePosition || "center"}
                  onChange={(e) =>
                    handleFieldChange("imagePosition", e.target.value)
                  }
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Text Alignment</label>
                <div className="alignment-toggle-group">
                  <button
                    type="button"
                    className={
                      (!settings.textAlign || settings.textAlign === "left")
                        ? "toggle-btn active"
                        : "toggle-btn"
                    }
                    onClick={() => handleFieldChange("textAlign", "left")}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className={
                      settings.textAlign === "center"
                        ? "toggle-btn active"
                        : "toggle-btn"
                    }
                    onClick={() => handleFieldChange("textAlign", "center")}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    type="button"
                    className={
                      settings.textAlign === "right"
                        ? "toggle-btn active"
                        : "toggle-btn"
                    }
                    onClick={() => handleFieldChange("textAlign", "right")}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      /* ==================== RICH TEXT ==================== */
      case "rich-text":
        return (
          <>
            <div className="settings-field">
              <label>Heading</label>
              <input
                type="text"
                value={settings.heading || ""}
                onChange={(e) => handleFieldChange("heading", e.target.value)}
                placeholder="Section title"
              />
            </div>

            <div className="settings-field">
              <label>Body Content</label>
              <textarea
                rows={5}
                value={settings.body || ""}
                onChange={(e) => handleFieldChange("body", e.target.value)}
                placeholder="Add your narrative, brand manifesto, or message..."
              />
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Text Alignment</label>
                <div className="alignment-toggle-group">
                  <button
                    type="button"
                    className={
                      settings.textAlign === "left"
                        ? "toggle-btn active"
                        : "toggle-btn"
                    }
                    onClick={() => handleFieldChange("textAlign", "left")}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className={
                      (!settings.textAlign || settings.textAlign === "center")
                        ? "toggle-btn active"
                        : "toggle-btn"
                    }
                    onClick={() => handleFieldChange("textAlign", "center")}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    type="button"
                    className={
                      settings.textAlign === "right"
                        ? "toggle-btn active"
                        : "toggle-btn"
                    }
                    onClick={() => handleFieldChange("textAlign", "right")}
                  >
                    <AlignRight size={16} />
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label>Text Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.textColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.textColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </>
        );

      /* ==================== NEWSLETTER ==================== */
      case "newsletter":
        return (
          <>
            <div className="settings-field">
              <label>Heading</label>
              <input
                type="text"
                value={settings.heading || ""}
                onChange={(e) => handleFieldChange("heading", e.target.value)}
                placeholder="e.g. Subscribe to our emails"
              />
            </div>

            <div className="settings-field">
              <label>Description</label>
              <textarea
                rows={3}
                value={settings.description || ""}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Why should customers join your newsletter?"
              />
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Button Text</label>
                <input
                  type="text"
                  value={settings.buttonText || ""}
                  onChange={(e) =>
                    handleFieldChange("buttonText", e.target.value)
                  }
                  placeholder="Subscribe"
                />
              </div>

              <div className="settings-field">
                <label>Input Placeholder</label>
                <input
                  type="text"
                  value={settings.inputPlaceholder || ""}
                  onChange={(e) =>
                    handleFieldChange("inputPlaceholder", e.target.value)
                  }
                  placeholder="Enter your email address..."
                />
              </div>
            </div>
          </>
        );

      /* ==================== FOOTER ==================== */
      case "footer": {
        const footerLinks = settings.navLinks || [
          { label: "Catalog", url: "/store" },
          { label: "About Us", url: "#" },
          { label: "Shipping & Returns", url: "#" },
          { label: "Contact Us", url: "#" },
        ];

        const handleFooterLinkChange = (index: number, key: string, val: string) => {
          const updated = [...footerLinks];
          updated[index] = { ...updated[index], [key]: val };
          handleFieldChange("navLinks", updated);
        };

        const handleAddFooterLink = () => {
          handleFieldChange("navLinks", [
            ...footerLinks,
            { label: `Link ${footerLinks.length + 1}`, url: "#" },
          ]);
        };

        const handleRemoveFooterLink = (index: number) => {
          const updated = footerLinks.filter((_: any, i: number) => i !== index);
          handleFieldChange("navLinks", updated);
        };

        return (
          <>
            <div className="settings-field">
              <label>Store Brand Name</label>
              <input
                type="text"
                value={settings.storeName || ""}
                onChange={(e) => handleFieldChange("storeName", e.target.value)}
                placeholder="My Store"
              />
            </div>

            <ImageInputControl
              label="Footer Logo (Optional)"
              value={settings.logoUrl || ""}
              onChange={(url) => handleFieldChange("logoUrl", url)}
              helperText="Display image logo in footer"
            />

            <div className="settings-field">
              <label>Footer Description / Tagline</label>
              <textarea
                rows={2}
                value={settings.footerDescription || ""}
                onChange={(e) =>
                  handleFieldChange("footerDescription", e.target.value)
                }
                placeholder="Premium goods curated with passion and attention to detail."
              />
            </div>

            <div className="settings-field">
              <label>Copyright Text</label>
              <input
                type="text"
                value={settings.footerText || ""}
                onChange={(e) =>
                  handleFieldChange("footerText", e.target.value)
                }
                placeholder="© 2026 My Store. All rights reserved."
              />
            </div>

            <div className="settings-field">
              <div className="settings-field-header">
                <label>Footer Navigation Links</label>
                <button
                  type="button"
                  className="settings-tiny-add-btn"
                  onClick={handleAddFooterLink}
                >
                  <Plus size={13} /> Add Link
                </button>
              </div>

              <div className="settings-nav-links-list">
                {footerLinks.map((item: { label: string; url: string }, idx: number) => (
                  <div key={idx} className="settings-nav-link-row">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) =>
                        handleFooterLinkChange(idx, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="nav-label-input"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) =>
                        handleFooterLinkChange(idx, "url", e.target.value)
                      }
                      placeholder="URL"
                      className="nav-url-input"
                    />
                    <button
                      type="button"
                      className="nav-remove-btn"
                      onClick={() => handleRemoveFooterLink(idx)}
                      title="Remove link"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-field-row">
              <div className="settings-field">
                <label>Background</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.backgroundColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("backgroundColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor || "#111827"}
                    onChange={(e) =>
                      handleFieldChange("backgroundColor", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="settings-field">
                <label>Text Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={settings.textColor || "#9ca3af"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={settings.textColor || "#9ca3af"}
                    onChange={(e) =>
                      handleFieldChange("textColor", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </>
        );
      }

      default:
        return <p>No settings available for this section.</p>;
    }
  };

  return (
    <div className="section-settings-panel">
      <div className="settings-panel-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={onBack}
          title="Back to sections list"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="settings-panel-title">
          <h3>{section.title}</h3>
          <span>Section Settings</span>
        </div>
      </div>

      <div className="settings-panel-body">
        <div className="settings-field">
          <label>Section Display Title</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateTitle(section.id, e.target.value)}
          />
        </div>

        {renderSectionFields()}

        <div className="settings-danger-zone">
          <button
            type="button"
            className="settings-delete-btn"
            onClick={() => onDeleteSection(section.id)}
          >
            <Trash2 size={15} />
            Delete Section
          </button>
        </div>
      </div>
    </div>
  );
};
