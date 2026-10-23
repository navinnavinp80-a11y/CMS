import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import Website from "../models/Website";
import StoreConfig from "../models/StoreConfig";

export const FREE_PLAN_WEBSITE_LIMIT = 2;
export const FREE_PLAN_CREATION_LIMIT = 2;

export interface CreationCounts {
  websitesCount: number;
  storesCount: number;
  totalCreations: number;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  isPremium: boolean;
  currentCount: number;
  maxAllowed: number;
  remaining: number;
}

export interface UserPlanSummary {
  plan: "free" | "premium";
  isPremiumActive: boolean;
  premiumExpiresAt: Date | null;
  websitesCount: number;
  storesCount: number;
  totalCreations: number;
  maxAllowed: number;
  remaining: number;
  canCreate: boolean;
  canCreateWebsite: boolean;
}

/**
 * Returns the count of websites owned strictly by the authenticated user.
 * Individual pages inside a website (Content documents) and other users' websites do NOT count.
 */
export const getUserWebsitesCount = async (
  userId: string | mongoose.Types.ObjectId
): Promise<number> => {
  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return await Website.countDocuments({ owner: userObjectId });
};

/**
 * Returns the total number of website and store creations owned by the user.
 * Individual pages inside a website (Content documents) do NOT count as creations.
 */
export const getUserCreationsCount = async (
  userId: string | mongoose.Types.ObjectId
): Promise<CreationCounts> => {
  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const [websitesCount, storesCount] = await Promise.all([
    Website.countDocuments({ owner: userObjectId }),
    StoreConfig.countDocuments({ owner: userObjectId }),
  ]);

  return {
    websitesCount,
    storesCount,
    totalCreations: websitesCount + storesCount,
  };
};

/**
 * Checks whether the user has an active, non-expired Premium subscription.
 * An expired Premium subscription cannot bypass the Free plan limit.
 */
export const isUserPremiumActive = (
  user: IUser | { role?: string; plan?: string; premiumExpiresAt?: Date | null } | null
): boolean => {
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

/**
 * Validates whether the user is entitled to create an additional Website.
 * Required business rule:
 * - Free users can create their first two websites (0 and 1 -> allowed, 2 -> blocked).
 * - From the 3rd website onward, an active Premium plan is required.
 * - Exact 403 message: "Free plan allows only 2 websites. Upgrade to Premium to create more websites."
 */
export const canUserCreateWebsite = async (
  userId: string | mongoose.Types.ObjectId
): Promise<EntitlementCheckResult> => {
  const user = await User.findById(userId);
  const isPremium = isUserPremiumActive(user);
  const websitesCount = await getUserWebsitesCount(userId);

  if (user?.role === "admin" || isPremium) {
    return {
      allowed: true,
      isPremium: true,
      currentCount: websitesCount,
      maxAllowed: Infinity,
      remaining: Infinity,
    };
  }

  const maxAllowed = FREE_PLAN_WEBSITE_LIMIT;
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

/**
 * Validates whether the user is entitled to create an additional store.
 */
export const canUserCreateStore = async (
  userId: string | mongoose.Types.ObjectId
): Promise<EntitlementCheckResult> => {
  const user = await User.findById(userId);
  const isPremium = isUserPremiumActive(user);
  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const storesCount = await StoreConfig.countDocuments({ owner: userObjectId });

  if (user?.role === "admin" || isPremium) {
    return {
      allowed: true,
      isPremium: true,
      currentCount: storesCount,
      maxAllowed: Infinity,
      remaining: Infinity,
    };
  }

  const maxAllowed = FREE_PLAN_CREATION_LIMIT;
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

/**
 * General creation entitlement validator (for backward compatibility).
 */
export const canUserCreate = async (
  userId: string | mongoose.Types.ObjectId
): Promise<EntitlementCheckResult> => {
  return canUserCreateWebsite(userId);
};

/**
 * Returns a complete summary of the user's plan, usage, limits, and expiration date.
 */
export const getUserPlanSummary = async (
  userId: string | mongoose.Types.ObjectId
): Promise<UserPlanSummary> => {
  const user = await User.findById(userId);
  const isPremium = isUserPremiumActive(user);
  const { websitesCount, storesCount, totalCreations } =
    await getUserCreationsCount(userId);

  const maxAllowed = isPremium ? Infinity : FREE_PLAN_WEBSITE_LIMIT;
  const remaining = isPremium ? Infinity : Math.max(0, maxAllowed - websitesCount);
  const canCreateWebsiteAllowed = isPremium || websitesCount < FREE_PLAN_WEBSITE_LIMIT;

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
