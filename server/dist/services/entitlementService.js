"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPlanSummary = exports.canUserCreate = exports.canUserCreateStore = exports.canUserCreateWebsite = exports.getUserStoresCount = exports.getUserWebsitesCount = exports.isUserPremiumActive = exports.getUserCreationsCount = exports.FREE_PLAN_CREATION_LIMIT = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Website_1 = __importDefault(require("../models/Website"));
const StoreConfig_1 = __importDefault(require("../models/StoreConfig"));
exports.FREE_PLAN_CREATION_LIMIT = 2;
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
    if (!user || user.plan !== "premium") {
        return false;
    }
    if (user.premiumExpiresAt) {
        const expiresAt = new Date(user.premiumExpiresAt).getTime();
        if (expiresAt <= Date.now()) {
            return false; // Expired
        }
    }
    return true;
};
exports.isUserPremiumActive = isUserPremiumActive;
/**
 * Returns the number of websites owned by the user.
 * Individual pages inside a website (Content documents) do NOT count as websites.
 */
const getUserWebsitesCount = async (userId) => {
    const userObjectId = typeof userId === "string" ? new mongoose_1.default.Types.ObjectId(userId) : userId;
    return await Website_1.default.countDocuments({ owner: userObjectId });
};
exports.getUserWebsitesCount = getUserWebsitesCount;
/**
 * Returns the number of stores owned by the user.
 */
const getUserStoresCount = async (userId) => {
    const userObjectId = typeof userId === "string" ? new mongoose_1.default.Types.ObjectId(userId) : userId;
    return await StoreConfig_1.default.countDocuments({ owner: userObjectId });
};
exports.getUserStoresCount = getUserStoresCount;
/**
 * Validates whether the user is entitled to create an additional website.
 * - Every registered user can create a maximum of 2 websites for free.
 * - 1st and 2nd websites work normally.
 * - Starting from the 3rd website, block creation unless user has an active Premium plan.
 * - This limit applies strictly to websites, not content pages or blog posts.
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
    const maxAllowed = exports.FREE_PLAN_CREATION_LIMIT;
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
    const storesCount = await (0, exports.getUserStoresCount)(userId);
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
            : "Creation limit reached on Free plan. Upgrade to Premium to create more stores.",
        isPremium: false,
        currentCount: storesCount,
        maxAllowed,
        remaining,
    };
};
exports.canUserCreateStore = canUserCreateStore;
/**
 * General entitlement verification, delegating to website entitlement by default.
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
    const websitesCount = await (0, exports.getUserWebsitesCount)(userId);
    const storesCount = await (0, exports.getUserStoresCount)(userId);
    const maxAllowed = isPremium ? Infinity : exports.FREE_PLAN_CREATION_LIMIT;
    const remaining = isPremium ? Infinity : Math.max(0, maxAllowed - websitesCount);
    const canCreate = isPremium || websitesCount < exports.FREE_PLAN_CREATION_LIMIT;
    return {
        plan: isPremium ? "premium" : "free",
        isPremiumActive: isPremium,
        premiumExpiresAt: user?.premiumExpiresAt || null,
        websitesCount,
        storesCount,
        totalCreations: websitesCount + storesCount,
        maxAllowed,
        remaining,
        canCreate,
    };
};
exports.getUserPlanSummary = getUserPlanSummary;
