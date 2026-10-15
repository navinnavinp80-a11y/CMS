export type StoreSectionType =
  | "announcement"
  | "header"
  | "hero"
  | "featured-products"
  | "product-grid"
  | "image-banner"
  | "rich-text"
  | "newsletter"
  | "footer";

export interface StoreProductItem {
  id: string;
  title: string;
  description?: string;
  price: string;
  compareAtPrice?: string;
  imageUrl: string;
  productUrl?: string;
  badge?: string;
}

export interface AnnouncementSettings {
  text: string;
  backgroundColor: string;
  textColor: string;
  linkUrl?: string;
}

export interface HeaderSettings {
  storeName: string;
  logoUrl?: string;
  navLinks: Array<{ label: string; url: string }>;
  backgroundColor: string;
}

export interface HeroSettings {
  heading: string;
  subtitle: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImage: string;
  backgroundColor: string;
  textColor?: string;
  textAlign: "left" | "center" | "right";
  imagePosition?: "center" | "top" | "bottom";
  overlayOpacity?: number;
}

export interface ProductsSettings {
  heading: string;
  productsCount: number;
  gridColumns: number;
  products: StoreProductItem[];
}

export interface ImageBannerSettings {
  imageUrl: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  imagePosition?: "center" | "top" | "bottom";
  textAlign?: "left" | "center" | "right";
}

export interface RichTextSettings {
  heading: string;
  body: string;
  textAlign: "left" | "center" | "right";
  textColor?: string;
}

export interface NewsletterSettings {
  heading: string;
  description: string;
  buttonText: string;
  inputPlaceholder?: string;
}

export interface FooterSettings {
  storeName: string;
  logoUrl?: string;
  footerDescription?: string;
  footerText: string;
  navLinks?: Array<{ label: string; url: string }>;
  backgroundColor: string;
  textColor: string;
}

export type StoreSectionSettings =
  | AnnouncementSettings
  | HeaderSettings
  | HeroSettings
  | ProductsSettings
  | ImageBannerSettings
  | RichTextSettings
  | NewsletterSettings
  | FooterSettings
  | Record<string, any>;

export interface StoreSection {
  id: string;
  type: StoreSectionType;
  title: string;
  settings: Record<string, any>;
}

export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  buttonStyle: "square" | "rounded" | "pill";
  contentWidth: "compact" | "normal" | "full";
  sectionSpacing: "compact" | "normal" | "spacious";
}

export const DEFAULT_THEME: StoreTheme = {
  primaryColor: "#202223",
  secondaryColor: "#4f46e5",
  backgroundColor: "#ffffff",
  fontFamily: "Inter, sans-serif",
  buttonStyle: "rounded",
  contentWidth: "normal",
  sectionSpacing: "normal",
};

export const DEFAULT_PRODUCTS: StoreProductItem[] = [
  {
    id: "prod-1",
    title: "Minimalist Canvas Backpack",
    description: "Durable water-resistant cotton canvas with vegetable-tanned leather trim.",
    price: "$79.00",
    compareAtPrice: "$99.00",
    badge: "Bestseller",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prod-2",
    title: "Organic Wool Crewneck",
    description: "Responsibly sourced merino knit with ribbed cuffs and tailored hem.",
    price: "$124.00",
    compareAtPrice: "$145.00",
    badge: "Sale",
    imageUrl:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prod-3",
    title: "Ceramic Studio Coffee Mug",
    description: "Hand-thrown stoneware finished with matte reactive glaze.",
    price: "$34.00",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prod-4",
    title: "Aeropress Leather Sleeve",
    description: "Custom debossed full-grain sleeve for standard coffee press.",
    price: "$48.00",
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prod-5",
    title: "Raw Denim Work Jacket",
    description: "13.5oz Japanese selvedge denim built to break in beautifully over time.",
    price: "$185.00",
    compareAtPrice: "$210.00",
    badge: "Popular",
    imageUrl:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
  {
    id: "prod-6",
    title: "Hand-poured Botanical Candle",
    description: "Soy wax with notes of cedarwood, amber, and mountain pine.",
    price: "$28.00",
    imageUrl:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    productUrl: "#",
  },
];

export const createDefaultSection = (
  type: StoreSectionType,
  title?: string
): StoreSection => {
  const uniqueId = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  switch (type) {
    case "announcement":
      return {
        id: uniqueId,
        type,
        title: title || "Announcement Bar",
        settings: {
          text: "Welcome to our store • Free shipping on orders over $50!",
          backgroundColor: "#111827",
          textColor: "#ffffff",
          linkUrl: "",
        },
      };

    case "header":
      return {
        id: uniqueId,
        type,
        title: title || "Header / Navigation",
        settings: {
          storeName: "My Store",
          logoUrl: "",
          navLinks: [
            { label: "Home", url: "/" },
            { label: "Catalog", url: "/store" },
            { label: "About", url: "#" },
            { label: "Contact", url: "#" },
          ],
          backgroundColor: "#ffffff",
        },
      };

    case "hero":
      return {
        id: uniqueId,
        type,
        title: title || "Hero Banner",
        settings: {
          heading: "Discover your next favorite.",
          subtitle: "Carefully curated products engineered for modern living.",
          description: "Explore our latest collection designed for everyday luxury and timeless utility.",
          buttonText: "Shop now",
          buttonUrl: "#products",
          backgroundColor: "#e9eef5",
          textColor: "#111827",
          textAlign: "center",
          backgroundImage: "",
          imagePosition: "center",
          overlayOpacity: 0.4,
        },
      };

    case "featured-products":
      return {
        id: uniqueId,
        type,
        title: title || "Featured Products",
        settings: {
          heading: "Featured Products",
          productsCount: 4,
          gridColumns: 4,
          products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS.slice(0, 4))),
        },
      };

    case "product-grid":
      return {
        id: uniqueId,
        type,
        title: title || "Product Grid",
        settings: {
          heading: "All Products Collection",
          productsCount: 6,
          gridColumns: 3,
          products: JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)),
        },
      };

    case "image-banner":
      return {
        id: uniqueId,
        type,
        title: title || "Image Banner",
        settings: {
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
          heading: "Artisan Quality & Design",
          description:
            "Crafted using sustainable materials built to last a lifetime.",
          buttonText: "Explore Collection",
          buttonUrl: "#",
          imagePosition: "center",
          textAlign: "left",
        },
      };

    case "rich-text":
      return {
        id: uniqueId,
        type,
        title: title || "Rich Text",
        settings: {
          heading: "Our Commitment to Craft",
          body: "We partner with responsible independent creators around the world to bring you timeless, durable items made without compromise.",
          textAlign: "center",
          textColor: "#111827",
        },
      };

    case "newsletter":
      return {
        id: uniqueId,
        type,
        title: title || "Newsletter",
        settings: {
          heading: "Subscribe to our emails",
          description:
            "Be the first to learn about seasonal drops, exclusive perks, and behind-the-scenes stories.",
          buttonText: "Subscribe",
          inputPlaceholder: "Enter your email address...",
        },
      };

    case "footer":
      return {
        id: uniqueId,
        type,
        title: title || "Footer",
        settings: {
          storeName: "My Store",
          logoUrl: "",
          footerDescription: "Premium goods curated with passion and attention to detail.",
          footerText: "© 2026 My Store. All rights reserved.",
          navLinks: [
            { label: "Catalog", url: "/store" },
            { label: "About Us", url: "#" },
            { label: "Shipping & Returns", url: "#" },
            { label: "Contact Us", url: "#" },
          ],
          backgroundColor: "#111827",
          textColor: "#9ca3af",
        },
      };

    default:
      return {
        id: uniqueId,
        type,
        title: title || "Section",
        settings: {},
      };
  }
};
