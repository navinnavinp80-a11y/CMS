import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import Website from "../models/Website";
import StoreConfig from "../models/StoreConfig";

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
}

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
  user: IUser | { plan?: string; premiumExpiresAt?: Date | null } | null
): boolean => {
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

/**
 * Validates whether the user is entitled to create an additional website or store.
 * - Free users: max 2 total creations (websites + stores combined).
 * - Active Premium users: unlimited creations.
 * - Expired Premium users: revert to the Free limit.
 */
export const canUserCreate = async (
  userId: string | mongoose.Types.ObjectId
): Promise<EntitlementCheckResult> => {
  const user = await User.findById(userId);

  const isPremium = isUserPremiumActive(user);
  const { websitesCount, storesCount, totalCreations } =
    await getUserCreationsCount(userId);

  if (user?.role === "admin" || isPremium) {
    return {
      allowed: true,
      isPremium: true,
      currentCount: totalCreations,
      maxAllowed: Infinity,
      remaining: Infinity,
    };
  }

  const maxAllowed = FREE_PLAN_CREATION_LIMIT;
  const remaining = Math.max(0, maxAllowed - totalCreations);
  const allowed = totalCreations < maxAllowed;

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Creation limit reached on Free plan (${totalCreations}/${maxAllowed} creations used). Upgrade to Premium to create more websites and stores.`,
    isPremium: false,
    currentCount: totalCreations,
    maxAllowed,
    remaining,
  };
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

  const maxAllowed = isPremium ? Infinity : FREE_PLAN_CREATION_LIMIT;
  const remaining = isPremium ? Infinity : Math.max(0, maxAllowed - totalCreations);
  const canCreate = isPremium || totalCreations < FREE_PLAN_CREATION_LIMIT;

  return {
    plan: isPremium ? "premium" : "free",
    isPremiumActive: isPremium,
    premiumExpiresAt: user?.premiumExpiresAt || null,
    websitesCount,
    storesCount,
    totalCreations,
    maxAllowed,
    remaining,
    canCreate,
  };
};
