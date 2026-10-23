# Premium Theme 1 (Atelier Luxury & Boutique)

## Overview
- **Display Name**: Premium Theme 1
- **Theme ID**: `premium-theme-1`
- **Theme Slug**: `premium-theme-1`
- **Access Level**: `premium` (Requires active, non-expired Premium subscription)
- **Store Category**: Luxury Boutique, Handcrafted Leather Goods, Bespoke Horology & Heirloom Design

---

## Technical Specifications
- **Component Entry Point**: [PremiumTheme1.tsx](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/premium/premium-theme-1/PremiumTheme1.tsx)
- **Associated CSS**: [theme.css](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/premium/premium-theme-1/theme.css)
- **Primary Design Palette**:
  - Primary Brand Color: `#18181b` (Obsidian Charcoal)
  - Secondary / Accent Color: `#d97706` (Warm Patina Amber / Gold)
  - Background Color: `#fafaf9` (Cream White)
  - Typography: `Georgia, Cambria, 'Times New Roman', serif`
  - Button Style: `square` (Sharp 0px corners, high editorial prestige)
  - Content Width: `normal` (1200px)
  - Section Spacing: `spacious` (80px)

---

## Main Sections Included
1. **Announcement Bar**: Monospaced obsidian banner with numbered edition notices.
2. **Header / Navigation**: Atelier brand mark, uppercase navigation typography, minimalist cart icon.
3. **Hero Banner**: Editorial layout with serif statement headline and gold accent subtext.
4. **Featured Luxury Products**: 4-column curated collection of leather briefcases, chronographs, and cashmere throws.
5. **Atelier Manifesto (Rich Text)**: Narrative brand story emphasizing generational craft over mass production.
6. **Artisan Craft Banner**: Full-width imagery displaying raw materials and workshop dedication.
7. **Private Client Newsletter**: Bespoke private bulletin invitation with exclusive access.
8. **Footer**: Refined dark slate footer with private client portal links and provenance guides.

---

## Theme Registration & Selection
- Registered in [registry.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/registry.ts) with `id: "premium-theme-1"` and `accessLevel: "premium"`.
- In the CMS Store Creation Modal (`/stores`), this theme displays a gold **Premium** crown badge.
- For Free users and expired subscribers:
  - Theme card displays a lock indicator.
  - Clicking triggers an **Upgrade to Premium** action navigating to `/premium`.
- Server enforcement in `server/src/services/storeThemeService.ts` strictly rejects any creation or update attempts from non-premium accounts with a `403 Forbidden` response.

---

## Shared Components & Dependencies
- Reuses [StorefrontRenderer](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/StorefrontRenderer.tsx) for dynamic modular section rendering.
- Shared type interfaces: `StoreSection`, `StoreTheme`, `StoreProductItem` from [types.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/types.ts).
