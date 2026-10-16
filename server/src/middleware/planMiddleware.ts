import { Request, Response, NextFunction } from "express";
import { canUserCreate } from "../services/entitlementService";

/**
 * Express middleware to enforce Free/Premium creation limits before creating a new website or store.
 * - Allows up to 2 creations on Free plan (websites + stores combined).
 * - Requires active Premium for 3 or more creations.
 * - Does not block edits, draft updates, or publishing.
 */
export const requireCreationEntitlement = async (
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

    const entitlement = await canUserCreate(userId);

    if (!entitlement.allowed) {
      res.status(403).json({
        message:
          entitlement.reason ||
          "Creation limit reached on Free plan. Upgrade to Premium to create more websites and stores.",
        limitReached: true,
        currentCount: entitlement.currentCount,
        maxAllowed: entitlement.maxAllowed,
        remaining: entitlement.remaining,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Plan entitlement middleware error:", error);
    res.status(500).json({
      message: "Server error verifying plan entitlements",
    });
  }
};
