import React from "react";
import { StorefrontRenderer } from "../../../pages/StoreEditor/StorefrontRenderer";
import type { StoreSection, StoreTheme, StoreProductItem } from "../../../pages/StoreEditor/types";
import "./theme.css";

export interface ElectronicsStoreThemeProps {
  sections: StoreSection[];
  theme: StoreTheme;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  isEditor?: boolean;
}

/**
 * Electronics Store default theme styles.
 * Modern tech navy palette with electric blue accents.
 */
export const ELECTRONICS_STORE_THEME_CONFIG: StoreTheme = {
  primaryColor: "#0f172a",
  secondaryColor: "#2563eb",
  backgroundColor: "#ffffff",
  fontFamily: "Inter, sans-serif",
  buttonStyle: "rounded",
  contentWidth: "normal",
  sectionSpacing: "normal",
};

/**
 * Electronics Store initial products (headphones, smartphones, laptops, accessories).
 */
export const ELECTRONICS_STORE_PRODUCTS: StoreProductItem[] = [
  {
    id: "elec-prod-1",
    title: "Apex Wireless ANC Studio Headphones",
    description: "Active noise cancellation with 40-hour battery life and lossless audio drivers.",
    price: "$299.00",
    compareAtPrice: "$349.00",
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "elec-prod-2",
    title: "Hyperion Pro 5G Smartphone 256GB",
    description: "6.7-inch OLED 120Hz display, triple computational camera array, and all-day battery.",
    price: "$799.00",
    compareAtPrice: "$899.00",
    badge: "Flagship",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "elec-prod-3",
    title: "UltraBook Pro 15 M-Silicon Laptop",
    description: "Ultra-slim aerospace aluminum chassis, 32GB unified RAM, and liquid retina display.",
    price: "$1,499.00",
    compareAtPrice: "$1,699.00",
    badge: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "elec-prod-4",
    title: "Spatial Sound Pods with Wireless Case",
    description: "Dynamic head-tracking spatial audio with IPX5 water resistance.",
    price: "$149.00",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
];

/**
 * Generates the default section layout for Electronics Store.
 */
export const createElectronicsStoreSections = (storeName: string = "TechSphere Electronics"): StoreSection[] => [
  {
    id: "elec-announcement",
    type: "announcement",
    title: "Announcement Bar",
    settings: {
      text: "⚡ Flash Sale: Get 15% off flagship headphones & laptops with code TECH15 • Free 2-Day Shipping",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      linkUrl: "#",
    },
  },
  {
    id: "elec-header",
    type: "header",
    title: "Header / Navigation",
    settings: {
      storeName: storeName,
      logoUrl: "",
      navLinks: [
        { label: "Home", url: "/" },
        { label: "Audio", url: "/store" },
        { label: "Smartphones", url: "/store" },
        { label: "Laptops", url: "/store" },
        { label: "Support", url: "#" },
      ],
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "elec-hero",
    type: "hero",
    title: "Hero Banner",
    settings: {
      heading: "Next-Gen Tech For Limitless Minds.",
      subtitle: "Engineered for Uncompromising Performance",
      description: "Discover breakthrough smartphones, studio-grade headphones, and ultra-fast laptops designed to power your passion.",
      buttonText: "Shop Electronics",
      buttonUrl: "#products",
      backgroundColor: "#e2e8f0",
      textColor: "#0f172a",
      textAlign: "left",
      backgroundImage: "",
      imagePosition: "center",
      overlayOpacity: 0.2,
    },
  },
  {
    id: "elec-featured",
    type: "featured-products",
    title: "Featured Tech Products",
    settings: {
      heading: "Flagship Electronics",
      productsCount: 4,
      gridColumns: 4,
      products: ELECTRONICS_STORE_PRODUCTS,
    },
  },
  {
    id: "elec-image-banner",
    type: "image-banner",
    title: "Brand Banner",
    settings: {
      imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80",
      heading: "Studio-Grade Acoustics Everywhere",
      description: "Experience spatial sound with custom 40mm neodymium drivers and intelligent noise suppression.",
      buttonText: "Explore Audio Collection",
      buttonUrl: "#",
      imagePosition: "center",
      textAlign: "left",
    },
  },
  {
    id: "elec-newsletter",
    type: "newsletter",
    title: "Tech Drops Newsletter",
    settings: {
      heading: "Stay Ahead of the Curve",
      description: "Subscribe for exclusive gadget launches, early black Friday discounts, and firmware release notes.",
      buttonText: "Subscribe",
      inputPlaceholder: "Enter your corporate or personal email...",
    },
  },
  {
    id: "elec-footer",
    type: "footer",
    title: "Footer",
    settings: {
      storeName: storeName,
      logoUrl: "",
      footerDescription: "Authorized retailer of next-generation consumer electronics, personal computing, and professional audio.",
      footerText: `© ${new Date().getFullYear()} ${storeName}. All rights reserved. 2-Year Warranty Guaranteed.`,
      navLinks: [
        { label: "Warranty & Repairs", url: "#" },
        { label: "Order Tracking", url: "#" },
        { label: "Privacy Policy", url: "#" },
        { label: "Terms of Service", url: "#" },
      ],
      backgroundColor: "#0f172a",
      textColor: "#94a3b8",
    },
  },
];

/**
 * Electronics Store Theme Component.
 * Wraps the existing StorefrontRenderer with electronics store CSS classes and layout logic.
 */
export const ElectronicsStoreTheme: React.FC<ElectronicsStoreThemeProps> = ({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  isEditor = false,
}) => {
  return (
    <div className="theme-electronics-store">
      <StorefrontRenderer
        sections={sections}
        theme={theme}
        selectedSectionId={selectedSectionId}
        onSelectSection={onSelectSection}
        isEditor={isEditor}
      />
    </div>
  );
};

export default ElectronicsStoreTheme;
