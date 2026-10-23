"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableStoreThemes = exports.getThemeDefaults = exports.canUserAccessTheme = exports.isThemePremium = exports.SERVER_STORE_THEMES = exports.DEFAULT_THEME_ID = exports.FREE_THEME_IDS = void 0;
const entitlementService_1 = require("./entitlementService");
/**
 * EXACT FREE THEMES:
 * ONLY these two themes are Free.
 * Any other theme is strictly PREMIUM.
 */
exports.FREE_THEME_IDS = new Set([
    "electronics-store",
    "phone-accessories-store",
]);
exports.DEFAULT_THEME_ID = "electronics-store";
// ==========================================
// 1. ELECTRONICS STORE (FREE)
// ==========================================
const getElectronicsSections = (storeName) => [
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
            products: [
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
            ],
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
// ==========================================
// 2. PHONE ACCESSORIES STORE (FREE)
// ==========================================
const getPhoneAccessoriesSections = (storeName) => [
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
            products: [
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
            ],
        },
    },
    {
        id: "phone-image-banner",
        type: "image-banner",
        title: "MagSafe Banner",
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
// ==========================================
// 3. PREMIUM THEME 1 (PREMIUM)
// ==========================================
const getPremiumTheme1Sections = (storeName) => [
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
            products: [
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
            ],
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
// ==========================================
// 4. VOLTIX SMART TECH (PREMIUM)
// ==========================================
const getVoltixSections = (storeName) => [
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
            products: [
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
            ],
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
exports.SERVER_STORE_THEMES = {
    // 1. FREE: Electronics Store
    "electronics-store": {
        id: "electronics-store",
        slug: "electronics-store",
        name: "Electronics Store",
        category: "Consumer Electronics & Tech",
        description: "Modern electronics storefront featuring headphones, smartphones, laptops, categories, and product cards.",
        accessLevel: "free",
        defaultTheme: {
            primaryColor: "#0f172a",
            secondaryColor: "#2563eb",
            backgroundColor: "#ffffff",
            fontFamily: "Inter, sans-serif",
            buttonStyle: "rounded",
            contentWidth: "normal",
            sectionSpacing: "normal",
        },
        getDefaultSections: getElectronicsSections,
    },
    // 2. FREE: Phone Accessories Store
    "phone-accessories-store": {
        id: "phone-accessories-store",
        slug: "phone-accessories-store",
        name: "Phone Accessories Store",
        category: "Mobile Accessories & Cases",
        description: "Vibrant mobile accessories storefront showcasing protective phone cases, MagSafe accessories, and chargers.",
        accessLevel: "free",
        defaultTheme: {
            primaryColor: "#0f172a",
            secondaryColor: "#06b6d4",
            backgroundColor: "#f8fafc",
            fontFamily: "Inter, sans-serif",
            buttonStyle: "pill",
            contentWidth: "normal",
            sectionSpacing: "normal",
        },
        getDefaultSections: getPhoneAccessoriesSections,
    },
    // 3. PREMIUM: Premium Theme 1
    "premium-theme-1": {
        id: "premium-theme-1",
        slug: "premium-theme-1",
        name: "Premium Theme 1",
        category: "Luxury Boutique & Bespoke",
        description: "Editorial luxury boutique storefront with handcrafted leather goods, horology, and serif typography.",
        accessLevel: "premium",
        defaultTheme: {
            primaryColor: "#18181b",
            secondaryColor: "#d97706",
            backgroundColor: "#fafaf9",
            fontFamily: "Georgia, Cambria, 'Times New Roman', serif",
            buttonStyle: "square",
            contentWidth: "normal",
            sectionSpacing: "spacious",
        },
        getDefaultSections: getPremiumTheme1Sections,
    },
    // 4. PREMIUM: Voltix Smart Tech
    "voltix-smart-tech": {
        id: "voltix-smart-tech",
        slug: "voltix-smart-tech",
        name: "Voltix Smart Tech",
        category: "Smart Technology & Gaming",
        description: "Smart technology storefront with smartphones, headphones, smartwatches, gaming products, black/white layouts, and orange accents.",
        accessLevel: "premium",
        defaultTheme: {
            primaryColor: "#09090b",
            secondaryColor: "#ff6b00",
            backgroundColor: "#09090b",
            fontFamily: "Inter, sans-serif",
            buttonStyle: "square",
            contentWidth: "full",
            sectionSpacing: "normal",
        },
        getDefaultSections: getVoltixSections,
    },
};
/**
 * Safe Default Principle:
 * A theme MUST be Premium unless it is explicitly registered as one of the two Free themes.
 */
const isThemePremium = (themeId) => {
    if (!themeId)
        return true; // Safe default: must be premium unless explicitly identified as Free
    const normalized = themeId.trim().toLowerCase();
    return !exports.FREE_THEME_IDS.has(normalized);
};
exports.isThemePremium = isThemePremium;
/**
 * Checks if the authenticated user has rights to use the requested theme:
 * - Free themes: all users (Free, Active Premium, Expired Premium) can use.
 * - Premium themes: ONLY active non-expired Premium users or Admins can use.
 */
const canUserAccessTheme = (user, themeId) => {
    const normalized = (themeId || exports.DEFAULT_THEME_ID).trim().toLowerCase();
    // If theme is in the Free set, access is always allowed
    if (exports.FREE_THEME_IDS.has(normalized)) {
        return true;
    }
    // Admin always has full access
    if (user?.role === "admin") {
        return true;
    }
    // For any other theme, strictly verify active non-expired Premium entitlement
    return (0, entitlementService_1.isUserPremiumActive)(user);
};
exports.canUserAccessTheme = canUserAccessTheme;
/**
 * Returns preset sections and theme config for a theme ID.
 */
const getThemeDefaults = (themeId = exports.DEFAULT_THEME_ID, storeName = "My Store") => {
    const definition = exports.SERVER_STORE_THEMES[themeId] || exports.SERVER_STORE_THEMES[exports.DEFAULT_THEME_ID];
    return {
        themeId: definition.id,
        sections: definition.getDefaultSections(storeName),
        theme: definition.defaultTheme,
    };
};
exports.getThemeDefaults = getThemeDefaults;
/**
 * Returns available store themes with access flags for a given user.
 */
const getAvailableStoreThemes = (user) => {
    return Object.values(exports.SERVER_STORE_THEMES).map((theme) => ({
        id: theme.id,
        slug: theme.slug,
        name: theme.name,
        category: theme.category,
        description: theme.description,
        accessLevel: theme.accessLevel,
        isPremium: theme.accessLevel === "premium",
        hasAccess: (0, exports.canUserAccessTheme)(user, theme.id),
    }));
};
exports.getAvailableStoreThemes = getAvailableStoreThemes;
