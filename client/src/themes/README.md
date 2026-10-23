# Headless CMS Store Theme Architecture

## 1. Overview
The Headless CMS Store Creation section provides a modular, type-safe theme architecture that allows storefronts to be organized, maintained, previewed, and strictly gated by subscription tier (`free` vs. `premium`).

All themes are centralized under `client/src/themes/` and governed by the central registry:
[client/src/themes/registry.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/registry.ts).

---

## 2. Directory Structure

```text
client/src/themes/
├── registry.ts                   # Central single source of truth for all store themes
├── README.md                     # Root theme documentation & developer guide
├── free/                         # Unrestricted Free themes
│   ├── electronics-store/        # Free Theme 1: Electronics storefront
│   │   ├── ElectronicsStoreTheme.tsx
│   │   ├── theme.css
│   │   └── README.md
│   └── phone-accessories-store/  # Free Theme 2: Mobile accessories storefront
│       ├── PhoneAccessoriesTheme.tsx
│       ├── theme.css
│       └── README.md
└── premium/                      # Gated Premium themes
    ├── premium-theme-1/          # Premium Theme 1: Atelier luxury & boutique
    │   ├── PremiumTheme1.tsx
    │   ├── theme.css
    │   └── README.md
    └── voltix-smart-tech/        # Premium Theme 2: Voltix smart tech & gaming
        ├── VoltixSmartTechTheme.tsx
        ├── theme.css
        └── README.md
```

---

## 3. Strict Theme Classifications

| Display Name | Theme ID / Slug | Access Level | Description & Category |
| :--- | :--- | :--- | :--- |
| **Electronics Store** | `electronics-store` | **FREE** | Electronics storefront featuring headphones, smartphones, laptops, categories, and product cards. |
| **Phone Accessories Store** | `phone-accessories-store` | **FREE** | Phone cases, MagSafe accessories, wireless chargers, and mobile equipment storefront. |
| **Premium Theme 1** | `premium-theme-1` | **PREMIUM** | Atelier luxury boutique storefront with handcrafted leather goods, horology, and serif typography. |
| **Voltix Smart Tech** | `voltix-smart-tech` | **PREMIUM** | Smart technology storefront with smartphones, headphones, smartwatches, gaming products, black/white layouts, and orange accents. |
| *Any Future Theme* | *custom-id* | **PREMIUM** | **Default Safely**: Any unregistered or new theme is strictly classified as Premium unless explicitly verified as Free. |

---

## 4. Theme Access & Security Model

### User Tier Entitlements
1. **Free Tier Users**:
   - Permitted to select and create stores using **only** `electronics-store` and `phone-accessories-store`.
   - All Premium themes display a locked badge with an **Upgrade to Premium** CTA.
   - Clicking the CTA navigates directly to `/premium`.
2. **Active Premium Users**:
   - Full access to all Free and Premium themes.
3. **Expired Premium Users**:
   - Immediately lose access to Premium themes upon subscription expiration.
   - Regain access exclusively to the two Free themes.
   - Locked Premium themes prompt renewal to `/premium`.

### Backend Enforcement
- Access control is enforced **both** on the frontend and on the backend server (`server/src/controllers/storeController.ts` & `server/src/services/storeThemeService.ts`).
- The backend verifies the authenticated user's database subscription status and `premiumExpiresAt` timestamp.
- Requests with spoofed client headers or manipulated IDs receive an immediate `403 Forbidden` response.

---

## 5. How to Add a New Theme

Follow these steps to add a new theme cleanly and safely:

### Step 1: Create the Theme Directory
Decide the classification:
- If Free (rare and requiring architectural approval): place under `client/src/themes/free/<theme-slug>/`
- If Premium (standard default): place under `client/src/themes/premium/<theme-slug>/`

### Step 2: Implement Component & Styles
1. Create `<ThemeName>.tsx`:
   - Import `StorefrontRenderer` from `../../pages/StoreEditor/StorefrontRenderer`.
   - Define `<ThemeName>ThemeConfig: StoreTheme`.
   - Define `<ThemeName>Products: StoreProductItem[]`.
   - Define `create<ThemeName>Sections(storeName?: string): StoreSection[]`.
   - Export `<ThemeName>Theme` React component wrapping `StorefrontRenderer` with a unique CSS root class (e.g. `.theme-<slug>`).
2. Create `theme.css`:
   - Scope all styles under `.theme-<slug>`.
   - Define CSS custom properties for brand colors, buttons, and typography.
3. Create a comprehensive `README.md` documenting IDs, access level, sections, and style notes.

### Step 3: Register in the Central Registry
Open [client/src/themes/registry.ts](file:///c:/Users/LOQ/OneDrive/Desktop/CMS/client/src/themes/registry.ts) and add the new entry:

```typescript
"my-new-theme": {
  id: "my-new-theme",
  slug: "my-new-theme",
  name: "My New Theme",
  category: "Store Category",
  description: "Description of the theme...",
  accessLevel: "premium", // ALWAYS default to "premium" unless explicitly approved as Free
  previewImage: MY_PREVIEW_SVG,
  palette: { primary: "#...", secondary: "#...", accent: "#...", background: "#..." },
  component: MyNewTheme,
  defaultTheme: MY_THEME_CONFIG,
  createDefaultSections: createMyNewThemeSections,
}
```

### Step 4: Register in Backend Service
Open `server/src/services/storeThemeService.ts` and add the backend definition and default sections so API creation requests apply the theme presets on the server.

### Step 5: Test & Validate
1. Run `npm run build` in `client` and `server`.
2. Verify that Free users see the theme locked with an Upgrade button.
3. Verify that active Premium users can select and publish stores with the new theme.
