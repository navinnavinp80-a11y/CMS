"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableTemplates = exports.canUserAccessTemplate = exports.isTemplatePremium = exports.resolveTemplateId = exports.TEMPLATE_ALIASES = exports.TEMPLATES = void 0;
const entitlementService_1 = require("./entitlementService");
exports.TEMPLATES = [
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
exports.TEMPLATE_ALIASES = {
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
const resolveTemplateId = (id) => {
    if (!id)
        return "minimal-clean";
    return exports.TEMPLATE_ALIASES[id] || id;
};
exports.resolveTemplateId = resolveTemplateId;
/**
 * Checks whether a given template ID requires an active Premium plan.
 */
const isTemplatePremium = (id) => {
    if (!id)
        return false;
    const canonicalId = (0, exports.resolveTemplateId)(id);
    const found = exports.TEMPLATES.find((t) => t.id === canonicalId);
    return found?.plan === "premium";
};
exports.isTemplatePremium = isTemplatePremium;
/**
 * Checks if a specific user is authorized to access and use a template.
 */
const canUserAccessTemplate = (user, templateId) => {
    if (!templateId || !(0, exports.isTemplatePremium)(templateId)) {
        return true; // Free templates accessible by all users
    }
    if (user?.role === "admin") {
        return true; // Admin has full access to all templates
    }
    return (0, entitlementService_1.isUserPremiumActive)(user);
};
exports.canUserAccessTemplate = canUserAccessTemplate;
/**
 * Returns available templates annotated with user entitlement flag.
 */
const getAvailableTemplates = (user) => {
    return exports.TEMPLATES.map((tmpl) => ({
        ...tmpl,
        hasAccess: (0, exports.canUserAccessTemplate)(user, tmpl.id),
    }));
};
exports.getAvailableTemplates = getAvailableTemplates;
