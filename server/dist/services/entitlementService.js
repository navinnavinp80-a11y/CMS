"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPlanSummary = exports.canUserCreate = exports.canUserCreateStore = exports.canUserCreateWebsite = exports.isUserPremiumActive = exports.getUserCreationsCount = exports.getUserWebsitesCount = exports.FREE_PLAN_CREATION_LIMIT = exports.FREE_PLAN_WEBSITE_LIMIT = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Website_1 = __importDefault(require("../models/Website"));
const StoreConfig_1 = __importDefault(require("../models/StoreConfig"));
exports.FREE_PLAN_WEBSITE_LIMIT = 2;
exports.FREE_PLAN_CREATION_LIMIT = 2;
/**
 * Returns the count of websites owned strictly by the authenticated user.
 * Individual pages inside a website (Content documents) and other users' websites do NOT count.
 */
const getUserWebsitesCount = async (userId) => {
    const userObjectId = typeof userId === "string" ? new mongoose_1.default.Types.ObjectId(userId) : userId;
    return await Website_1.default.countDocuments({ owner: userObjectId });
};
exports.getUserWebsitesCount = getUserWebsitesCount;
/**
 * Returns the total number of website and store creations owned by the user.
 * Individual pages inside a website (Content documents) do NOT count as creations.
 */
const getUserCreationsCount = async (userId) => {
    const userObjectId = typeof userId === "string" ? new mongoose_1.default.Types.ObjectId(userId) : userId;
    const [websitesCount, storesCount] = await Promise.all([
        Website_1.default.countDocuments({ owner: userObjectId }),
        StoreConfig_1.default.countDocuments({ owner: userObjectId }),
    ]);
    return {
        websitesCount,
        storesCount,
        totalCreations: websitesCount + storesCount,
    };
};
exports.getUserCreationsCount = getUserCreationsCount;
/**
 * Checks whether the user has an active, non-expired Premium subscription.
 * An expired Premium subscription cannot bypass the Free plan limit.
 */
const isUserPremiumActive = (user) => {
    if (!user) {
        return false;
    }
    if ("role" in user && user.role === "admin") {
        return true;
    }
    if (user.plan !== "premium") {
        return false;
    }
    if (!user.premiumExpiresAt) {
        return false;
    }
    const expiresAt = new Date(user.premiumExpiresAt).getTime();
    if (isNaN(expiresAt) || expiresAt <= Date.now()) {
        return false; // Expired
    }
    return true;
};
exports.isUserPremiumActive = isUserPremiumActive;
/**
 * Validates whether the user is entitled to create an additional Website.
 * Required business rule:
 * - Free users can create their first two websites (0 and 1 -> allowed, 2 -> blocked).
 * - From the 3rd website onward, an active Premium plan is required.
 * - Exact 403 message: "Free plan allows only 2 websites. Upgrade to Premium to create more websites."
 */
const canUserCreateWebsite = async (userId) => {
    const user = await User_1.default.findById(userId);
    const isPremium = (0, exports.isUserPremiumActive)(user);
    const websitesCount = await (0, exports.getUserWebsitesCount)(userId);
    if (user?.role === "admin" || isPremium) {
        return {
            allowed: true,
            isPremium: true,
            currentCount: websitesCount,
            maxAllowed: Infinity,
            remaining: Infinity,
        };
    }
    const maxAllowed = exports.FREE_PLAN_WEBSITE_LIMIT;
    const remaining = Math.max(0, maxAllowed - websitesCount);
    const allowed = websitesCount < maxAllowed;
    return {
        allowed,
        reason: allowed
            ? undefined
            : "Free plan allows only 2 websites. Upgrade to Premium to create more websites.",
        isPremium: false,
        currentCount: websitesCount,
        maxAllowed,
        remaining,
    };
};
exports.canUserCreateWebsite = canUserCreateWebsite;
/**
 * Validates whether the user is entitled to create an additional store.
 */
const canUserCreateStore = async (userId) => {
    const user = await User_1.default.findById(userId);
    const isPremium = (0, exports.isUserPremiumActive)(user);
    const userObjectId = typeof userId === "string" ? new mongoose_1.default.Types.ObjectId(userId) : userId;
    const storesCount = await StoreConfig_1.default.countDocuments({ owner: userObjectId });
    if (user?.role === "admin" || isPremium) {
        return {
            allowed: true,
            isPremium: true,
            currentCount: storesCount,
            maxAllowed: Infinity,
            remaining: Infinity,
        };
    }
    const maxAllowed = exports.FREE_PLAN_CREATION_LIMIT;
    const remaining = Math.max(0, maxAllowed - storesCount);
    const allowed = storesCount < maxAllowed;
    return {
        allowed,
        reason: allowed
            ? undefined
            : `Creation limit reached on Free plan (${storesCount}/${maxAllowed} stores used). Upgrade to Premium to create more stores.`,
        isPremium: false,
        currentCount: storesCount,
        maxAllowed,
        remaining,
    };
};
exports.canUserCreateStore = canUserCreateStore;
/**
 * General creation entitlement validator (for backward compatibility).
 */
const canUserCreate = async (userId) => {
    return (0, exports.canUserCreateWebsite)(userId);
};
exports.canUserCreate = canUserCreate;
/**
 * Returns a complete summary of the user's plan, usage, limits, and expiration date.
 */
const getUserPlanSummary = async (userId) => {
    const user = await User_1.default.findById(userId);
    const isPremium = (0, exports.isUserPremiumActive)(user);
    const { websitesCount, storesCount, totalCreations } = await (0, exports.getUserCreationsCount)(userId);
    const maxAllowed = isPremium ? Infinity : exports.FREE_PLAN_WEBSITE_LIMIT;
    const remaining = isPremium ? Infinity : Math.max(0, maxAllowed - websitesCount);
    const canCreateWebsiteAllowed = isPremium || websitesCount < exports.FREE_PLAN_WEBSITE_LIMIT;
    return {
        plan: isPremium ? "premium" : "free",
        isPremiumActive: isPremium,
        premiumExpiresAt: user?.premiumExpiresAt || null,
        websitesCount,
        storesCount,
        totalCreations,
        maxAllowed,
        remaining,
        canCreate: canCreateWebsiteAllowed,
        canCreateWebsite: canCreateWebsiteAllowed,
    };
};
exports.getUserPlanSummary = getUserPlanSummary;
