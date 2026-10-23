# Voltix Smart Tech Theme

## Overview
- **Display Name**: Voltix Smart Tech
- **Theme ID**: `voltix-smart-tech`
- **Theme Slug**: `voltix-smart-tech`
- **Access Level**: `premium` (Requires active, non-expired Premium subscription)
- **Store Category**: Smart Technology, Smartphones, Smartwatches, Gaming Peripherals, Studio Sound

---

## Technical Specifications
- **Component Entry Point**: [VoltixSmartTechTheme.tsx](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/premium/voltix-smart-tech/VoltixSmartTechTheme.tsx)
- **Associated CSS**: [theme.css](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/premium/voltix-smart-tech/theme.css)
- **Primary Design Palette**:
  - Primary Brand Color: `#09090b` (Deep Void Black)
  - Secondary / Accent Color: `#ff6b00` (High-Voltage Neon Orange)
  - Background Color: `#09090b` (Dark Mode Cyber Background)
  - Typography: `Inter, sans-serif`
  - Button Style: `square` (Sharp 0px cyber edges)
  - Content Width: `full` (1440px wide immersive layout)
  - Section Spacing: `normal` (56px)

---

## Main Sections Included
1. **High-Voltage Announcement Bar**: Vivid orange bar with black bold typography highlighting 24h dispatch.
2. **Cyber Header / Navigation**: Bold dark navigation with orange hover effects and high-contrast cart indicator.
3. **Hero Banner**: Next-gen dark mode banner with "SUPERCHARGED BY VOLTIX INTELLIGENCE" headline and glowing CTA button.
4. **Featured Smart Tech Products**: High-contrast dark cards showcasing flagship 5G smartphones, spatial headphones, titanium smartwatches, and optical gaming keyboards.
5. **High Performance Architecture (Rich Text)**: Technical specifications narrative highlighting 0.1ms latency and titanium durability.
6. **Titanium Power Banner**: Industrial image banner with sharp orange accent borderlines.
7. **Voltix Insider Newsletter**: Dark newsletter signup for firmware releases and esports events.
8. **Footer**: Jet-black footer with vibrant orange top border accent and developer SDK links.

---

## Theme Registration & Selection
- Registered in [registry.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/registry.ts) with `id: "voltix-smart-tech"` and `accessLevel: "premium"`.
- In the CMS Store Creation Modal (`/stores`):
  - Displays a **Premium** crown badge with black/orange cyber thumbnail.
  - Locked for Free tier users and expired subscriptions with an **Upgrade to Premium** action navigating directly to `/premium`.
  - Unlocked and selectable for active Premium subscribers and administrators.
- Backend verification in `server/src/services/storeThemeService.ts` strictly validates active subscription status and expiry timestamp before permitting store creation.

---

## Shared Components & Dependencies
- Reuses [StorefrontRenderer](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/StorefrontRenderer.tsx) for dynamic modular section rendering.
- Shared type interfaces: `StoreSection`, `StoreTheme`, `StoreProductItem` from [types.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/pages/StoreEditor/types.ts).
