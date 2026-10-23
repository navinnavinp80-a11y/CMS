import React from "react";
import { StorefrontRenderer } from "../../../pages/StoreEditor/StorefrontRenderer";
import type { StoreSection, StoreTheme, StoreProductItem } from "../../../pages/StoreEditor/types";
import "./theme.css";

export interface PhoneAccessoriesThemeProps {
  sections: StoreSection[];
  theme: StoreTheme;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  isEditor?: boolean;
}

/**
 * Phone Accessories Store theme configuration.
 * Teal/cyan palette, pill buttons, ultra-clean mobile accessories layout.
 */
export const PHONE_ACCESSORIES_THEME_CONFIG: StoreTheme = {
  primaryColor: "#0f172a",
  secondaryColor: "#06b6d4",
  backgroundColor: "#f8fafc",
  fontFamily: "Inter, sans-serif",
  buttonStyle: "pill",
  contentWidth: "normal",
  sectionSpacing: "normal",
};

/**
 * Phone Accessories initial products (phone cases, MagSafe accessories, chargers).
 */
export const PHONE_ACCESSORIES_PRODUCTS: StoreProductItem[] = [
  {
    id: "phone-prod-1",
    title: "AeroShield MagSafe Protective Case",
    description: "10ft drop tested military armor with magnetic alignment and soft-touch matte finish.",
    price: "$34.99",
    compareAtPrice: "$44.99",
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "phone-prod-2",
    title: "3-in-1 Foldable Magnetic Wireless Charging Station",
    description: "Simultaneously charge smartphone, earbuds, and smartwatch with fast 15W Qi2 output.",
    price: "$68.00",
    compareAtPrice: "$85.00",
    badge: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "phone-prod-3",
    title: "Anti-Glare Sapphire Glass Screen Protector (2-Pack)",
    description: "9H diamond hardness with precision alignment tray and oleophobic coating.",
    price: "$24.99",
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "phone-prod-4",
    title: "UltraBraid 240W Fast USB-C Charging Cable (2m)",
    description: "Reinforced Kevlar weave cable supporting 480Mbps sync and rapid USB-PD charging.",
    price: "$19.99",
    compareAtPrice: "$25.00",
    badge: "Sale",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
];

/**
 * Generates the default section layout for Phone Accessories Store.
 */
export const createPhoneAccessoriesSections = (storeName: string = "Pulse Phone Accessories"): StoreSection[] => [
  {
    id: "phone-announcement",
    type: "announcement",
    title: "Announcement Bar",
    settings: {
      text: "📱 Upgrade your everyday carry • Buy 2 phone cases, get 1 FREE with code CASEFREE",
      backgroundColor: "#0891b2",
      textColor: "#ffffff",
      linkUrl: "#",
    },
  },
  {
    id: "phone-header",
    type: "header",
    title: "Header / Navigation",
    settings: {
      storeName: storeName,
      logoUrl: "",
      navLinks: [
        { label: "Home", url: "/" },
        { label: "Phone Cases", url: "/store" },
        { label: "MagSafe", url: "/store" },
        { label: "Fast Chargers", url: "/store" },
        { label: "Screen Protectors", url: "#" },
      ],
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "phone-hero",
    type: "hero",
    title: "Hero Banner",
    settings: {
      heading: "Elevate Your Device. Protect What Matters.",
      subtitle: "Precision Mobile Gear for Everyday Life",
      description: "Engineered with impact-absorbing polymers, MagSafe perfection, and ultra-durable materials that never yellow.",
      buttonText: "Shop Cases & Gear",
      buttonUrl: "#products",
      backgroundColor: "#e0f2fe",
      textColor: "#0f172a",
      textAlign: "center",
      backgroundImage: "",
      imagePosition: "center",
      overlayOpacity: 0.15,
    },
  },
  {
    id: "phone-featured",
    type: "featured-products",
    title: "Featured Phone Accessories",
    settings: {
      heading: "Bestselling Cases & Mobile Gear",
      productsCount: 4,
      gridColumns: 4,
      products: PHONE_ACCESSORIES_PRODUCTS,
    },
  },
  {
    id: "phone-image-banner",
    type: "image-banner",
    title: "MagSafe Perfection Banner",
    settings: {
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
      heading: "Stronger Magnets. Seamless Everyday Snap.",
      description: "Our neodymium ring delivers a 3x stronger hold for car mounts, battery packs, and wallets.",
      buttonText: "View MagSafe Collection",
      buttonUrl: "#",
      imagePosition: "center",
      textAlign: "center",
    },
  },
  {
    id: "phone-newsletter",
    type: "newsletter",
    title: "Newsletter",
    settings: {
      heading: "Never Miss A New Drop",
      description: "Join over 50,000 phone styling enthusiasts for exclusive discounts, case drops, and giveaways.",
      buttonText: "Subscribe",
      inputPlaceholder: "Enter your email address...",
    },
  },
  {
    id: "phone-footer",
    type: "footer",
    title: "Footer",
    settings: {
      storeName: storeName,
      logoUrl: "",
      footerDescription: "Premium drop-tested phone cases, MagSafe accessories, and wireless charging stations for all major smartphones.",
      footerText: `© ${new Date().getFullYear()} ${storeName}. Lifetime warranty on all cases.`,
      navLinks: [
        { label: "Case Fit Guide", url: "#" },
        { label: "Warranty Guarantee", url: "#" },
        { label: "Returns & Exchanges", url: "#" },
        { label: "Contact Us", url: "#" },
      ],
      backgroundColor: "#0f172a",
      textColor: "#94a3b8",
    },
  },
];

/**
 * Phone Accessories Theme Component.
 * Wraps StorefrontRenderer with specialized mobile accessory styling.
 */
export const PhoneAccessoriesTheme: React.FC<PhoneAccessoriesThemeProps> = ({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  isEditor = false,
}) => {
  return (
    <div className="theme-phone-accessories">
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

export default PhoneAccessoriesTheme;
