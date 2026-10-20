import { IUser } from "../models/User";
import { isUserPremiumActive } from "./entitlementService";

export interface ServerTemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  plan: "free" | "premium";
  badge: string;
  aliases: string[];
}

export const TEMPLATES: ServerTemplateDefinition[] = [
  {
    id: "minimal-clean",
    name: "Minimal & Clean",
    description: "Pure white, spacious layout with clean typography, simple navigation, and minimal cards. Perfect for portfolios, blogs, and personal websites.",
    category: "Portfolio & Personal",
    plan: "free",
    badge: "Free",
    aliases: ["business-landing"],
  },
  {
    id: "modern-business",
    name: "Modern Business",
    description: "Cream background with sage-green accents, structured agency hero section, service cards, and clear call-to-action. Perfect for agencies, consultancies, and small businesses.",
    category: "Agency & Business",
    plan: "free",
    badge: "Free",
    aliases: ["about-us"],
  },
  {
    id: "premium-saas",
    name: "Obsidian SaaS / Tech Enterprise",
    description: "High-contrast dark obsidian aesthetic with cyber-violet accents, enterprise infrastructure metrics, feature showcases, and glowing CTA. Exclusive to Premium subscribers.",
    category: "Enterprise & Tech",
    plan: "premium",
    badge: "Premium",
    aliases: ["contact-page"],
  },
];

export const TEMPLATE_ALIASES: Record<string, string> = {
  "business-landing": "minimal-clean",
  "about-us": "modern-business",
  "contact-page": "premium-saas",
  "minimal-clean": "minimal-clean",
  "modern-business": "modern-business",
  "premium-saas": "premium-saas",
};

/**
 * Resolves a template ID including backwards-compatible aliases.
 */
export const resolveTemplateId = (id?: string | null): string => {
  if (!id) return "minimal-clean";
  return TEMPLATE_ALIASES[id] || id;
};

/**
 * Checks whether a given template ID requires an active Premium plan.
 */
export const isTemplatePremium = (id?: string | null): boolean => {
  if (!id) return false;
  const canonicalId = resolveTemplateId(id);
  const found = TEMPLATES.find((t) => t.id === canonicalId);
  return found?.plan === "premium";
};

/**
 * Checks if a specific user is authorized to access and use a template.
 */
export const canUserAccessTemplate = (
  user: IUser | { role?: string; plan?: string; premiumExpiresAt?: Date | null } | null,
  templateId?: string | null
): boolean => {
  if (!templateId || !isTemplatePremium(templateId)) {
    return true; // Free templates accessible by all users
  }

  if (user?.role === "admin") {
    return true; // Admin has full access to all templates
  }

  return isUserPremiumActive(user as IUser);
};

/**
 * Returns available templates annotated with user entitlement flag.
 */
export const getAvailableTemplates = (
  user: IUser | { role?: string; plan?: string; premiumExpiresAt?: Date | null } | null
) => {
  return TEMPLATES.map((tmpl) => ({
    ...tmpl,
    hasAccess: canUserAccessTemplate(user, tmpl.id),
  }));
};
