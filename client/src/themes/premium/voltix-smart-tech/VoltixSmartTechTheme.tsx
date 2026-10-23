import React from "react";
import { StorefrontRenderer } from "../../../pages/StoreEditor/StorefrontRenderer";
import type { StoreSection, StoreTheme, StoreProductItem } from "../../../pages/StoreEditor/types";
import "./theme.css";

export interface VoltixSmartTechThemeProps {
  sections: StoreSection[];
  theme: StoreTheme;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  isEditor?: boolean;
}

/**
 * Voltix Smart Tech default theme styling.
 * High-contrast black/white layouts with vibrant orange accents.
 */
export const VOLTIX_SMART_TECH_THEME_CONFIG: StoreTheme = {
  primaryColor: "#09090b", // Black
  secondaryColor: "#ff6b00", // High-voltage Orange
  backgroundColor: "#09090b", // Dark theme background
  fontFamily: "Inter, sans-serif",
  buttonStyle: "square",
  contentWidth: "full",
  sectionSpacing: "normal",
};

/**
 * Voltix Smart Tech initial products (smartphones, headphones, smartwatches, gaming gear).
 */
export const VOLTIX_SMART_TECH_PRODUCTS: StoreProductItem[] = [
  {
    id: "voltix-prod-1",
    title: "Voltix Neo-X Flagship 5G Smartphone",
    description: "Snapdragon 8 Gen 3, 200MP sensor with optical stabilization, and 165Hz AMOLED display.",
    price: "$1,099.00",
    compareAtPrice: "$1,199.00",
    badge: "Flagship",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "voltix-prod-2",
    title: "Voltix Apex H1 Spatial ANC Headphones",
    description: "Planar magnetic transducers, 60-hour ultra-charge battery, and lossless 2.4GHz low-latency wireless.",
    price: "$389.00",
    compareAtPrice: "$449.00",
    badge: "Voltix Audio",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "voltix-prod-3",
    title: "Voltix Titan Pro GPS Smartwatch",
    description: "Aerospace Grade 5 titanium bezel, 1000-nit sapphire screen, and dual-frequency offline GPS.",
    price: "$429.00",
    badge: "Cyber Wearable",
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "voltix-prod-4",
    title: "Voltix Ghost Tactical Optical Gaming Keyboard",
    description: "Analog optical Hall-effect switches with rapid trigger, per-key RGB, and PBT keycaps.",
    price: "$189.00",
    compareAtPrice: "$219.00",
    badge: "0.1ms Latency",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
];

/**
 * Generates the default section layout for Voltix Smart Tech.
 */
export const createVoltixSmartTechSections = (storeName: string = "Voltix Smart Tech"): StoreSection[] => [
  {
    id: "voltix-announcement",
    type: "announcement",
    title: "Announcement Bar",
    settings: {
      text: "⚡ VOLTIX INTELLIGENCE • BREAKTHROUGH SMARTPHONES, SMARTWATCHES & GAMING HARDWARE • DISPATCH WITHIN 24H",
      backgroundColor: "#ff6b00",
      textColor: "#000000",
      linkUrl: "#",
    },
  },
  {
    id: "voltix-header",
    type: "header",
    title: "Header / Navigation",
    settings: {
      storeName: storeName,
      logoUrl: "",
      navLinks: [
        { label: "Hardware", url: "/" },
        { label: "Smartphones", url: "/store" },
        { label: "Headphones", url: "/store" },
        { label: "Smartwatches", url: "/store" },
        { label: "Gaming", url: "#" },
      ],
      backgroundColor: "#09090b",
    },
  },
  {
    id: "voltix-hero",
    type: "hero",
    title: "Hero Banner",
    settings: {
      heading: "SUPERCHARGED BY VOLTIX INTELLIGENCE.",
      subtitle: "Smartphones • Smartwatches • Pro Gaming Audio",
      description: "Breakthrough mobile silicon, titanium smartwatches, and spatial sound engineered for tomorrow's power users.",
      buttonText: "Explore Voltix Ecosystem",
      buttonUrl: "#products",
      backgroundColor: "#18181b",
      textColor: "#ffffff",
      textAlign: "left",
      backgroundImage: "",
      imagePosition: "center",
      overlayOpacity: 0.25,
    },
  },
  {
    id: "voltix-featured",
    type: "featured-products",
    title: "Featured Tech Products",
    settings: {
      heading: "Flagship Smart Tech",
      productsCount: 4,
      gridColumns: 4,
      products: VOLTIX_SMART_TECH_PRODUCTS,
    },
  },
  {
    id: "voltix-rich-text",
    type: "rich-text",
    title: "High Performance Architecture",
    settings: {
      heading: "Engineered for 0.1ms Latency & Titanium Durability",
      body: "From computational imaging pipelines to military-spec smartwatch encasings, Voltix hardware eliminates compromises between raw processing power and ergonomic industrial aesthetics.",
      textAlign: "center",
      textColor: "#ffffff",
    },
  },
  {
    id: "voltix-image-banner",
    type: "image-banner",
    title: "Titanium Power Banner",
    settings: {
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
      heading: "TITANIUM POWER. ZERO COMPROMISE.",
      description: "Laser-machined chassis, custom heat dissipation, and unmatched tactile feedback.",
      buttonText: "Discover Specs",
      buttonUrl: "#",
      imagePosition: "center",
      textAlign: "left",
    },
  },
  {
    id: "voltix-newsletter",
    type: "newsletter",
    title: "Voltix Insider",
    settings: {
      heading: "Join Voltix Insider",
      description: "Get early access to limited hardware drops, beta firmware builds, and esports partnership events.",
      buttonText: "Join Insider",
      inputPlaceholder: "Enter your handle or email...",
    },
  },
  {
    id: "voltix-footer",
    type: "footer",
    title: "Footer",
    settings: {
      storeName: storeName,
      logoUrl: "",
      footerDescription: "Next-generation smart technology, computational mobile devices, and pro-grade peripherals.",
      footerText: `© ${new Date().getFullYear()} ${storeName}. High Performance Electronics.`,
      navLinks: [
        { label: "Hardware Specs", url: "#" },
        { label: "Firmware Updates", url: "#" },
        { label: "Global Warranty", url: "#" },
        { label: "Developer SDK", url: "#" },
      ],
      backgroundColor: "#000000",
      textColor: "#71717a",
    },
  },
];

/**
 * Voltix Smart Tech Theme Component.
 * Wraps StorefrontRenderer with high-contrast black/white and orange cyber styling.
 */
export const VoltixSmartTechTheme: React.FC<VoltixSmartTechThemeProps> = ({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  isEditor = false,
}) => {
  return (
    <div className="theme-voltix-smart-tech">
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

export default VoltixSmartTechTheme;
