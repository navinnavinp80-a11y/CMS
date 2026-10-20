"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStoreCreationEntitlement = exports.requireCreationEntitlement = exports.requireWebsiteCreationEntitlement = void 0;
const entitlementService_1 = require("../services/entitlementService");
/**
 * Express middleware to enforce Free/Premium website creation limits before creating a new website.
 * - Allows 2 websites on Free plan (owned by authenticated user).
 * - Blocks 3rd creation on Free plan with exact required message.
 * - Allows unlimited creations for active Premium users.
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
        console.error("Website plan entitlement middleware error:", error);
        res.status(500).json({
            message: "Server error verifying plan entitlements",
        });
    }
};
exports.requireWebsiteCreationEntitlement = requireWebsiteCreationEntitlement;
/**
 * General creation entitlement middleware for websites and stores.
 */
exports.requireCreationEntitlement = exports.requireWebsiteCreationEntitlement;
/**
 * Express middleware to enforce store creation limits.
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
        console.error("Store plan entitlement middleware error:", error);
        res.status(500).json({
            message: "Server error verifying plan entitlements",
        });
    }
};
exports.requireStoreCreationEntitlement = requireStoreCreationEntitlement;
