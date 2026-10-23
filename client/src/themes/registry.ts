import React from "react";
import type { StoreSection, StoreTheme } from "../pages/StoreEditor/types";

// Import Free Themes
import {
  ElectronicsStoreTheme,
  ELECTRONICS_STORE_THEME_CONFIG,
  createElectronicsStoreSections,
} from "./free/electronics-store/ElectronicsStoreTheme";
import {
  PhoneAccessoriesTheme,
  PHONE_ACCESSORIES_THEME_CONFIG,
  createPhoneAccessoriesSections,
} from "./free/phone-accessories-store/PhoneAccessoriesTheme";

// Import Premium Themes
import {
  PremiumTheme1,
  PREMIUM_THEME_1_CONFIG,
  createPremiumTheme1Sections,
} from "./premium/premium-theme-1/PremiumTheme1";
import {
  VoltixSmartTechTheme,
  VOLTIX_SMART_TECH_THEME_CONFIG,
  createVoltixSmartTechSections,
} from "./premium/voltix-smart-tech/VoltixSmartTechTheme";

export type ThemeAccessLevel = "free" | "premium";

export interface ThemeRegistryEntry {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  accessLevel: ThemeAccessLevel;
  previewImage: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  component: React.ComponentType<any>;
  defaultTheme: StoreTheme;
  createDefaultSections: (storeName?: string) => StoreSection[];
}

/**
 * Preview SVG Thumbnails encoded as Data URIs for instant, reliable rendering.
 */
const ELECTRONICS_PREVIEW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" width="100%" height="100%"><rect width="360" height="220" fill="%23f8fafc"/><rect width="360" height="30" fill="%230f172a"/><circle cx="20" cy="15" r="4" fill="%232563eb"/><rect x="32" y="11" width="60" height="8" rx="2" fill="%23ffffff" opacity="0.9"/><rect x="0" y="30" width="360" height="70" fill="%23e2e8f0"/><text x="24" y="65" font-family="sans-serif" font-weight="bold" font-size="16" fill="%230f172a">Next-Gen Tech Hub</text><text x="24" y="82" font-family="sans-serif" font-size="10" fill="%232563eb">Smartphones • Laptops • Studio Audio</text><rect x="24" y="115" width="96" height="85" rx="6" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><rect x="32" y="125" width="80" height="40" rx="4" fill="%23dbeafe"/><rect x="32" y="172" width="60" height="6" rx="2" fill="%230f172a"/><rect x="32" y="183" width="35" height="6" rx="2" fill="%232563eb"/><rect x="132" y="115" width="96" height="85" rx="6" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><rect x="140" y="125" width="80" height="40" rx="4" fill="%23e2e8f0"/><rect x="140" y="172" width="60" height="6" rx="2" fill="%230f172a"/><rect x="140" y="183" width="35" height="6" rx="2" fill="%232563eb"/><rect x="240" y="115" width="96" height="85" rx="6" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="1.5"/><rect x="248" y="125" width="80" height="40" rx="4" fill="%23dbeafe"/><rect x="248" y="172" width="60" height="6" rx="2" fill="%230f172a"/><rect x="248" y="183" width="35" height="6" rx="2" fill="%232563eb"/></svg>`;

const PHONE_ACCESSORIES_PREVIEW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" width="100%" height="100%"><rect width="360" height="220" fill="%23f0fdfa"/><rect width="360" height="24" fill="%230891b2"/><text x="24" y="16" font-family="sans-serif" font-size="9" fill="%23ffffff" font-weight="bold">MAGSAFE CASES & 15W WIRELESS CHARGERS</text><rect width="360" height="36" y="24" fill="%23ffffff"/><circle cx="24" cy="42" r="5" fill="%2306b6d4"/><rect x="36" y="38" width="80" height="8" rx="4" fill="%230f172a"/><rect x="24" y="70" width="312" height="65" rx="10" fill="%23e0f2fe"/><text x="40" y="100" font-family="sans-serif" font-size="15" font-weight="bold" fill="%230f172a">Pulse Mobile Gear</text><text x="40" y="118" font-family="sans-serif" font-size="10" fill="%230284c7">Military-grade phone cases & fast charging</text><rect x="24" y="148" width="96" height="58" rx="8" fill="%23ffffff" stroke="%23bae6fd"/><rect x="132" y="148" width="96" height="58" rx="8" fill="%23ffffff" stroke="%23bae6fd"/><rect x="240" y="148" width="96" height="58" rx="8" fill="%23ffffff" stroke="%23bae6fd"/></svg>`;

const PREMIUM_1_PREVIEW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" width="100%" height="100%"><rect width="360" height="220" fill="%23fafaf9"/><rect width="360" height="22" fill="%2318181b"/><text x="180" y="15" font-family="sans-serif" font-size="8" fill="%23fef3c7" text-anchor="middle" letter-spacing="2">ATELIER HERITAGE • BESPOKE OBJECTS</text><rect width="360" height="40" y="22" fill="%23fafaf9" stroke="%23e4e4e7" stroke-width="1"/><text x="180" y="47" font-family="serif" font-size="14" fill="%2318181b" text-anchor="middle" letter-spacing="3">MAISON NO. 1</text><rect x="24" y="75" width="312" height="65" fill="%23f5f5f4" stroke="%23e4e4e7"/><text x="180" y="105" font-family="serif" font-size="16" fill="%2318181b" text-anchor="middle">Quiet Luxury. Generational Craft.</text><text x="180" y="123" font-family="sans-serif" font-size="9" fill="%23d97706" text-anchor="middle" letter-spacing="1">LIMITED RUN • HANDMADE IN MILAN</text><rect x="24" y="150" width="96" height="56" fill="%23ffffff" stroke="%23d97706" stroke-width="1"/><rect x="132" y="150" width="96" height="56" fill="%23ffffff" stroke="%23e4e4e7"/><rect x="240" y="150" width="96" height="56" fill="%23ffffff" stroke="%23e4e4e7"/></svg>`;

const VOLTIX_PREVIEW = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" width="100%" height="100%"><rect width="360" height="220" fill="%2309090b"/><rect width="360" height="22" fill="%23ff6b00"/><text x="180" y="15" font-family="sans-serif" font-size="9" font-weight="900" fill="%23000000" text-anchor="middle" letter-spacing="2">VOLTIX CYBER HARDWARE • 24H EXPRESS</text><rect width="360" height="40" y="22" fill="%2309090b" stroke="%2327272a" stroke-width="1"/><text x="24" y="47" font-family="sans-serif" font-weight="900" font-size="15" fill="%23ffffff" letter-spacing="1">VOLTIX<tspan fill="%23ff6b00">_TECH</tspan></text><rect x="24" y="75" width="312" height="65" fill="%2318181b" stroke="%2327272a"/><text x="40" y="105" font-family="sans-serif" font-weight="900" font-size="16" fill="%23ffffff">SUPERCHARGED BY VOLTIX.</text><text x="40" y="123" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23ff6b00">SMARTPHONES • SMARTWATCHES • AUDIO</text><rect x="24" y="150" width="96" height="56" fill="%23121215" stroke="%23ff6b00" stroke-width="1.5"/><rect x="132" y="150" width="96" height="56" fill="%23121215" stroke="%2327272a"/><rect x="240" y="150" width="96" height="56" fill="%23121215" stroke="%2327272a"/></svg>`;

/**
 * Canonical Theme Registry.
 *
 * EXACT CLASSIFICATIONS (Per Architectural Requirement):
 * FREE:
 *   1. electronics-store ("Electronics Store")
 *   2. phone-accessories-store ("Phone Accessories Store")
 * PREMIUM (and every other theme):
 *   3. premium-theme-1 ("Premium Theme 1")
 *   4. voltix-smart-tech ("Voltix Smart Tech")
 */
export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {
  // 1. FREE: Electronics Store
  "electronics-store": {
    id: "electronics-store",
    slug: "electronics-store",
    name: "Electronics Store",
    category: "Consumer Electronics & Tech",
    description:
      "Modern electronics storefront featuring flagship headphones, smartphones, laptops, electronics categories, and product cards.",
    accessLevel: "free",
    previewImage: ELECTRONICS_PREVIEW,
    palette: {
      primary: "#0f172a",
      secondary: "#2563eb",
      accent: "#3b82f6",
      background: "#ffffff",
    },
    component: ElectronicsStoreTheme,
    defaultTheme: ELECTRONICS_STORE_THEME_CONFIG,
    createDefaultSections: createElectronicsStoreSections,
  },

  // 2. FREE: Phone Accessories Store
  "phone-accessories-store": {
    id: "phone-accessories-store",
    slug: "phone-accessories-store",
    name: "Phone Accessories Store",
    category: "Mobile Accessories & Cases",
    description:
      "Vibrant mobile accessories storefront showcasing protective phone cases, MagSafe charging stations, and mobile accessories.",
    accessLevel: "free",
    previewImage: PHONE_ACCESSORIES_PREVIEW,
    palette: {
      primary: "#0f172a",
      secondary: "#06b6d4",
      accent: "#0ea5e9",
      background: "#f8fafc",
    },
    component: PhoneAccessoriesTheme,
    defaultTheme: PHONE_ACCESSORIES_THEME_CONFIG,
    createDefaultSections: createPhoneAccessoriesSections,
  },

  // 3. PREMIUM: Premium Theme 1
  "premium-theme-1": {
    id: "premium-theme-1",
    slug: "premium-theme-1",
    name: "Premium Theme 1",
    category: "Luxury Boutique & Bespoke",
    description:
      "Editorial luxury boutique storefront with obsidian and patina gold styling, heirloom leather goods, and bespoke timepieces.",
    accessLevel: "premium",
    previewImage: PREMIUM_1_PREVIEW,
    palette: {
      primary: "#18181b",
      secondary: "#d97706",
      accent: "#b45309",
      background: "#fafaf9",
    },
    component: PremiumTheme1,
    defaultTheme: PREMIUM_THEME_1_CONFIG,
    createDefaultSections: createPremiumTheme1Sections,
  },

  // 4. PREMIUM: Voltix Smart Tech
  "voltix-smart-tech": {
    id: "voltix-smart-tech",
    slug: "voltix-smart-tech",
    name: "Voltix Smart Tech",
    category: "Smart Technology & Gaming",
    description:
      "Cutting-edge smart technology storefront with smartphones, headphones, titanium smartwatches, gaming products, bold black/white layouts, and orange accents.",
    accessLevel: "premium",
    previewImage: VOLTIX_PREVIEW,
    palette: {
      primary: "#09090b",
      secondary: "#ff6b00",
      accent: "#f97316",
      background: "#09090b",
    },
    component: VoltixSmartTechTheme,
    defaultTheme: VOLTIX_SMART_TECH_THEME_CONFIG,
    createDefaultSections: createVoltixSmartTechSections,
  },
};

export const DEFAULT_STORE_THEME_ID = "electronics-store";

/**
 * Returns all themes in canonical order (Free themes first, followed by Premium themes).
 */
export const getAllThemes = (): ThemeRegistryEntry[] => {
  return Object.values(THEME_REGISTRY);
};

/**
 * Gets a theme entry by ID or canonical slug.
 * Defaults safely to Electronics Store if ID is not recognized.
 */
export const getThemeById = (id?: string | null): ThemeRegistryEntry => {
  if (!id) return THEME_REGISTRY[DEFAULT_STORE_THEME_ID];
  return THEME_REGISTRY[id] || THEME_REGISTRY[DEFAULT_STORE_THEME_ID];
};

/**
 * Gets a theme entry by slug.
 */
export const getThemeBySlug = (slug?: string | null): ThemeRegistryEntry | undefined => {
  if (!slug) return undefined;
  return Object.values(THEME_REGISTRY).find((t) => t.slug === slug || t.id === slug);
};

/**
 * Safe Default Principle:
 * A theme is Premium UNLESS it is explicitly registered as one of the two Free themes.
 */
export const isThemePremium = (themeId?: string | null): boolean => {
  if (!themeId) return true; // Safe default: must be premium unless explicitly identified as Free
  const entry = THEME_REGISTRY[themeId];
  if (!entry) return true; // Default safely to Premium for any unknown theme
  return entry.accessLevel === "premium";
};

/**
 * Evaluates whether an authenticated user can select or create a store with a given theme.
 * - Active Premium subscribers and admins can access all themes.
 * - Free and expired accounts can ONLY access Free themes.
 */
export const canAccessTheme = (isPremiumUser: boolean, themeId?: string | null): boolean => {
  const effectiveId = themeId || DEFAULT_STORE_THEME_ID;
  if (!isThemePremium(effectiveId)) {
    return true; // Free theme is always accessible
  }
  return isPremiumUser;
};
