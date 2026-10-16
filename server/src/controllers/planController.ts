import { Request, Response } from "express";
import { getUserPlanSummary } from "../services/entitlementService";

/**
 * GET /api/plan
 * Returns the authenticated user's current subscription plan, creation metrics, and entitlement status.
 */
export const getUserPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        message: "Unauthorized: Missing user authentication",
      });
      return;
    }

    const summary = await getUserPlanSummary(userId);

    res.status(200).json({
      message: "User plan details fetched successfully",
      plan: summary.plan,
      isPremiumActive: summary.isPremiumActive,
      premiumExpiresAt: summary.premiumExpiresAt,
      usage: {
        websitesCount: summary.websitesCount,
        storesCount: summary.storesCount,
        totalCreations: summary.totalCreations,
        maxAllowed: summary.maxAllowed,
        remaining: summary.remaining,
        canCreate: summary.canCreate,
      },
    });
  } catch (error) {
    console.error("Get user plan error:", error);
    res.status(500).json({
      message: "Server error fetching user plan details",
    });
  }
};
