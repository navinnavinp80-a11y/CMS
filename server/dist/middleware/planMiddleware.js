"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCreationEntitlement = exports.requireStoreCreationEntitlement = exports.requireWebsiteCreationEntitlement = void 0;
const entitlementService_1 = require("../services/entitlementService");
/**
 * Express middleware to enforce Free/Premium creation limits before creating a new website.
 * - Maximum of 2 websites for Free plan.
 * - Starting from the 3rd website, block creation unless user has an active Premium plan.
 * - Does not block content pages, edits, or publishing.
 */
const requireWebsiteCreationEntitlement = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized: Missing user authentication",
            });
            return;
        }
        const entitlement = await (0, entitlementService_1.canUserCreateWebsite)(userId);
        if (!entitlement.allowed) {
            res.status(403).json({
                message: entitlement.reason ||
                    "Free plan allows only 2 websites. Upgrade to Premium to create more websites.",
                limitReached: true,
                currentCount: entitlement.currentCount,
                maxAllowed: entitlement.maxAllowed,
                remaining: entitlement.remaining,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Website creation entitlement middleware error:", error);
        res.status(500).json({
            message: "Server error verifying plan entitlements",
        });
    }
};
exports.requireWebsiteCreationEntitlement = requireWebsiteCreationEntitlement;
/**
 * Express middleware to enforce Free/Premium store creation limits.
 */
const requireStoreCreationEntitlement = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized: Missing user authentication",
            });
            return;
        }
        const entitlement = await (0, entitlementService_1.canUserCreateStore)(userId);
        if (!entitlement.allowed) {
            res.status(403).json({
                message: entitlement.reason ||
                    "Creation limit reached on Free plan. Upgrade to Premium to create more stores.",
                limitReached: true,
                currentCount: entitlement.currentCount,
                maxAllowed: entitlement.maxAllowed,
                remaining: entitlement.remaining,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Store creation entitlement middleware error:", error);
        res.status(500).json({
            message: "Server error verifying plan entitlements",
        });
    }
};
exports.requireStoreCreationEntitlement = requireStoreCreationEntitlement;
/**
 * Backwards compatibility alias
 */
exports.requireCreationEntitlement = exports.requireWebsiteCreationEntitlement;
