# Electronics Store Theme

## Overview
- **Display Name**: Electronics Store
- **Theme ID**: `electronics-store`
- **Theme Slug**: `electronics-store`
- **Access Level**: `free` (Accessible by all users, including Free plan and expired accounts)
- **Store Category**: Consumer Electronics, Personal Computers, Studio Audio & Gadgets

---

## Technical Specifications
- **Component Entry Point**: [ElectronicsStoreTheme.tsx](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/free/electronics-store/ElectronicsStoreTheme.tsx)
- **Associated CSS**: [theme.css](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/free/electronics-store/theme.css)
- **Primary Design Palette**:
  - Primary Brand Color: `#0f172a` (Tech Slate)
  - Secondary / Accent Color: `#2563eb` (Electric Blue)
  - Background Color: `#ffffff` (Pure White)
  - Typography: `Inter, sans-serif`
  - Button Style: `rounded` (8px radius)
  - Content Width: `normal` (1200px)

---

## Main Sections Included
1. **Announcement Bar**: Promotional headline with high-contrast slate background and warranty perks.
2. **Header / Navigation**: Brand logo, primary category links (Audio, Smartphones, Laptops, Support), and cart trigger.
3. **Hero Banner**: Next-gen tech hero with high-impact typography and CTA button.
4. **Featured Products**: 4-column responsive grid showcasing flagship headphones, smartphones, laptops, and earbuds.
5. **Brand Image Banner**: High-resolution photography highlighting acoustics and craft.
6. **Tech Drops Newsletter**: Email capture with input and subscribe button.
7. **Footer**: 4-column structured footer with copyright, warranty notes, and legal links.

---

## Theme Registration & Selection
- Registered in [registry.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/registry.ts) with `id: "electronics-store"` and `accessLevel: "free"`.
- Displayed in the CMS Store Creation Modal (`/stores`) for all authenticated users.
- Server validation verifies entitlement via `server/src/services/storeThemeService.ts`. Because this theme is Free, creation is permitted for all tiers without requiring an active Premium subscription.

---

## Shared Components & Dependencies
- Reuses [StorefrontRenderer](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/StorefrontRenderer.tsx) for dynamic modular section rendering.
- Shared type interfaces: `StoreSection`, `StoreTheme`, `StoreProductItem` from [types.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/types.ts).
