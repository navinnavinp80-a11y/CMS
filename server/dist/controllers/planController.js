"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPlan = void 0;
const entitlementService_1 = require("../services/entitlementService");
/**
 * GET /api/plan
 * Returns the authenticated user's current subscription plan, creation metrics, and entitlement status.
 */
const getUserPlan = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized: Missing user authentication",
            });
            return;
        }
        const summary = await (0, entitlementService_1.getUserPlanSummary)(userId);
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
    }
    catch (error) {
        console.error("Get user plan error:", error);
        res.status(500).json({
            message: "Server error fetching user plan details",
        });
    }
};
exports.getUserPlan = getUserPlan;
