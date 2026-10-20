import { Request, Response, NextFunction } from "express";
import { canUserCreateWebsite, canUserCreateStore } from "../services/entitlementService";

/**
 * Express middleware to enforce Free/Premium website creation limits before creating a new website.
 * - Allows 2 websites on Free plan (owned by authenticated user).
 * - Blocks 3rd creation on Free plan with exact required message.
 * - Allows unlimited creations for active Premium users.
 */
export const requireWebsiteCreationEntitlement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized: Missing user authentication",
      });
      return;
    }

    const entitlement = await canUserCreateWebsite(userId);

    if (!entitlement.allowed) {
      res.status(403).json({
        message:
          entitlement.reason ||
          "Free plan allows only 2 websites. Upgrade to Premium to create more websites.",
        limitReached: true,
        currentCount: entitlement.currentCount,
        maxAllowed: entitlement.maxAllowed,
        remaining: entitlement.remaining,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Website plan entitlement middleware error:", error);
    res.status(500).json({
      message: "Server error verifying plan entitlements",
    });
  }
};

/**
 * General creation entitlement middleware for websites and stores.
 */
export const requireCreationEntitlement = requireWebsiteCreationEntitlement;

/**
 * Express middleware to enforce store creation limits.
 */
export const requireStoreCreationEntitlement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized: Missing user authentication",
      });
      return;
    }

    const entitlement = await canUserCreateStore(userId);

    if (!entitlement.allowed) {
      res.status(403).json({
        message:
          entitlement.reason ||
          "Creation limit reached on Free plan. Upgrade to Premium to create more stores.",
        limitReached: true,
        currentCount: entitlement.currentCount,
        maxAllowed: entitlement.maxAllowed,
        remaining: entitlement.remaining,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Store plan entitlement middleware error:", error);
    res.status(500).json({
      message: "Server error verifying plan entitlements",
    });
  }
};
