# Phone Accessories Store Theme

## Overview
- **Display Name**: Phone Accessories Store
- **Theme ID**: `phone-accessories-store`
- **Theme Slug**: `phone-accessories-store`
- **Access Level**: `free` (Available to all users, Free and Premium)
- **Store Category**: Mobile Cases, MagSafe Accessories, Screen Protectors, Fast Chargers

---

## Technical Specifications
- **Component Entry Point**: [PhoneAccessoriesTheme.tsx](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/free/phone-accessories-store/PhoneAccessoriesTheme.tsx)
- **Associated CSS**: [theme.css](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/free/phone-accessories-store/theme.css)
- **Primary Design Palette**:
  - Primary Brand Color: `#0f172a` (Deep Slate)
  - Secondary / Accent Color: `#06b6d4` (Electric Cyan)
  - Background Color: `#f8fafc` (Clean Slate White)
  - Typography: `Inter, sans-serif`
  - Button Style: `pill` (Fully rounded 9999px pill buttons)
  - Content Width: `normal` (1200px)

---

## Main Sections Included
1. **Announcement Bar**: Cyan gradient announcement highlighting multi-case bundle discounts.
2. **Header / Navigation**: Brand logo, direct navigation links (Phone Cases, MagSafe, Fast Chargers, Screen Protectors), and cart indicator.
3. **Hero Banner**: High-conversion hero banner emphasizing device protection and everyday ergonomics.
4. **Featured Products**: 4-column responsive grid showcasing protective cases, 3-in-1 charging stations, screen protectors, and fast cables.
5. **Brand Image Banner**: MagSafe-focused banner highlighting neodymium magnetic alignment.
6. **Mobile Enthusiast Newsletter**: Email capture with pill-style subscribe CTA.
7. **Footer**: 4-column structured footer with case fit guide, warranty details, and contact options.

---

## Theme Registration & Selection
- Registered in [registry.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/registry.ts) with `id: "phone-accessories-store"` and `accessLevel: "free"`.
- Displayed in the CMS Store Creation Modal (`/stores`) for all authenticated users.
- Server validation in `server/src/services/storeThemeService.ts` classifies this theme as `free`, allowing creation for both Free and active/expired Premium tiers.

---

## Shared Components & Dependencies
- Reuses [StorefrontRenderer](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/StorefrontRenderer.tsx) for dynamic modular section rendering.
- Shared type interfaces: `StoreSection`, `StoreTheme`, `StoreProductItem` from [types.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/types.ts).
