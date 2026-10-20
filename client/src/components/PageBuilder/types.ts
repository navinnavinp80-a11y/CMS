export type ComponentType =
  | "hero"
  | "text"
  | "image"
  | "button"
  | "navbar"
  | "columns"
  | "video"
  | "divider"
  | "spacer"
  | "footer";

export interface NavItem {
  label: string;
  url: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface ColumnContent {
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
}

export interface ColumnData {
  left: ColumnContent;
  right: ColumnContent;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  text?: string;
  imageUrl?: string;
  navbarLogo?: string;
  navbarItems?: NavItem[];
  columns?: ColumnData;
  videoUrl?: string;
  dividerStyle?: "solid" | "dashed" | "dotted";
  dividerWidth?: "50%" | "75%" | "100%";
  height?: number;
  footerLogo?: string;
  footerDescription?: string;
  footerCopyright?: string;
  footerLinks?: FooterLink[];
  variant?: "default" | "minimal" | "modern" | "premium" | string;
  badge?: string;
}

