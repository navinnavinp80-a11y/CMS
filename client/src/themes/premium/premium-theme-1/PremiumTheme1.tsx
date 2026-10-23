import React from "react";
import { StorefrontRenderer } from "../../../pages/StoreEditor/StorefrontRenderer";
import type { StoreSection, StoreTheme, StoreProductItem } from "../../../pages/StoreEditor/types";
import "./theme.css";

export interface PremiumTheme1Props {
  sections: StoreSection[];
  theme: StoreTheme;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  isEditor?: boolean;
}

/**
 * Premium Theme 1 default theme styling.
 * Obsidian & gold palette, serif typography, editorial square styling.
 */
export const PREMIUM_THEME_1_CONFIG: StoreTheme = {
  primaryColor: "#18181b",
  secondaryColor: "#d97706",
  backgroundColor: "#fafaf9",
  fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
  buttonStyle: "square",
  contentWidth: "normal",
  sectionSpacing: "spacious",
};

/**
 * Premium Theme 1 initial products (handcrafted leather goods, bespoke chronographs, heirloom pieces).
 */
export const PREMIUM_THEME_1_PRODUCTS: StoreProductItem[] = [
  {
    id: "prem1-prod-1",
    title: "Handcrafted Full-Grain Leather Briefcase",
    description: "Vegetable-tanned Tuscan leather, solid brass hardware, and hand-burnished edges.",
    price: "$480.00",
    badge: "Limited Drop",
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prem1-prod-2",
    title: "Minimalist Chronograph Automatic Watch",
    description: "Swiss mechanical movement, anti-reflective sapphire crystal, and horween shell cordovan strap.",
    price: "$650.00",
    compareAtPrice: "$750.00",
    badge: "Bespoke",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prem1-prod-3",
    title: "Damascus Steel Everyday Pocket Knife",
    description: "67-layer folded VG-10 core with desert ironwood handles and custom leather sheath.",
    price: "$210.00",
    imageUrl: "https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prem1-prod-4",
    title: "Mongolian Cashmere Travel Throw",
    description: "100% Grade-A unbleached cashmere woven on heritage looms in northern Italy.",
    price: "$320.00",
    badge: "Heirloom",
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
];

/**
 * Generates the default section layout for Premium Theme 1.
 */
export const createPremiumTheme1Sections = (storeName: string = "Maison Heritage"): StoreSection[] => [
  {
    id: "prem1-announcement",
    type: "announcement",
    title: "Announcement Bar",
    settings: {
      text: "COMPLIMENTARY WORLDWIDE BESPOKE COURIER DELIVERY • LIMITED TO 100 PIECES PER RUN",
      backgroundColor: "#18181b",
      textColor: "#fef3c7",
      linkUrl: "#",
    },
  },
  {
    id: "prem1-header",
    type: "header",
    title: "Header / Navigation",
    settings: {
      storeName: storeName,
      logoUrl: "",
      navLinks: [
        { label: "Edition", url: "/" },
        { label: "Leather", url: "/store" },
        { label: "Timepieces", url: "/store" },
        { label: "Atelier", url: "#" },
        { label: "Contact", url: "#" },
      ],
      backgroundColor: "#fafaf9",
    },
  },
  {
    id: "prem1-hero",
    type: "hero",
    title: "Hero Banner",
    settings: {
      heading: "Quiet Luxury. Generational Craft.",
      subtitle: "The Autumn Edition — Numbered Objects",
      description: "Timeless goods designed without compromise. Produced in limited batches by multi-generational family workshops.",
      buttonText: "Discover The Collection",
      buttonUrl: "#products",
      backgroundColor: "#f5f5f4",
      textColor: "#18181b",
      textAlign: "center",
      backgroundImage: "",
      imagePosition: "center",
      overlayOpacity: 0.1,
    },
  },
  {
    id: "prem1-featured",
    type: "featured-products",
    title: "Featured Luxury Products",
    settings: {
      heading: "Curated Curiosities & Artifacts",
      productsCount: 4,
      gridColumns: 4,
      products: PREMIUM_THEME_1_PRODUCTS,
    },
  },
  {
    id: "prem1-rich-text",
    type: "rich-text",
    title: "Atelier Manifesto",
    settings: {
      heading: "Our Commitment to Permanence",
      body: "In an era of disposable mass production, we dedicate months to a single silhouette. Every piece is built to acquire character, patina, and dignity over decades of daily companionship.",
      textAlign: "center",
      textColor: "#18181b",
    },
  },
  {
    id: "prem1-image-banner",
    type: "image-banner",
    title: "Craft Banner",
    settings: {
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      heading: "Crafted by Masters in Milan and Kyoto",
      description: "Raw vegetable-tanned full-grain leather, hand-saddled stitching, and unhurried craftsmanship.",
      buttonText: "Inside the Workshop",
      buttonUrl: "#",
      imagePosition: "center",
      textAlign: "center",
    },
  },
  {
    id: "prem1-newsletter",
    type: "newsletter",
    title: "Private Client Newsletter",
    settings: {
      heading: "Receive The Private Bulletin",
      description: "Private invitations to unreleased runs, private viewings, and artisan monographs.",
      buttonText: "Request Access",
      inputPlaceholder: "Enter your private address...",
    },
  },
  {
    id: "prem1-footer",
    type: "footer",
    title: "Footer",
    settings: {
      storeName: storeName,
      logoUrl: "",
      footerDescription: "Purveyors of fine leathercraft, mechanical horology, and heirloom home wares. Manufactured by hand in ethical ateliers.",
      footerText: `© ${new Date().getFullYear()} ${storeName}. All rights reserved. Permanent Goods.`,
      navLinks: [
        { label: "Bespoke Inquiries", url: "#" },
        { label: "Provenance & Care", url: "#" },
        { label: "Terms of Commission", url: "#" },
        { label: "Private Client Portal", url: "#" },
      ],
      backgroundColor: "#18181b",
      textColor: "#a1a1aa",
    },
  },
];

/**
 * Premium Theme 1 Component.
 * Wraps StorefrontRenderer with luxury boutique styling.
 */
export const PremiumTheme1: React.FC<PremiumTheme1Props> = ({
  sections,
  theme,
  selectedSectionId,
  onSelectSection,
  isEditor = false,
}) => {
  return (
    <div className="theme-premium-1">
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

export default PremiumTheme1;
