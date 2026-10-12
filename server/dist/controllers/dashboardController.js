"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Content_1 = __importDefault(require("../models/Content"));
const Visit_1 = __importDefault(require("../models/Visit"));
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized: Missing user authentication",
            });
            return;
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // User-owned records: posts & pages authored by the authenticated user
        const totalPosts = await Content_1.default.countDocuments({
            type: "post",
            author: userObjectId,
        });
        const totalPages = await Content_1.default.countDocuments({
            type: "page",
            author: userObjectId,
        });
        // Global CMS platform metrics (genuinely shared across all accounts)
        const totalUsers = await User_1.default.countDocuments();
        const globalPosts = await Content_1.default.countDocuments({ type: "post" });
        const globalPages = await Content_1.default.countDocuments({ type: "page" });
        // Start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        // Start of tomorrow
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        // Platform-wide visitor analytics (shared)
        const visitorsToday = await Visit_1.default.countDocuments({
            visitedAt: {
                $gte: startOfToday,
                $lt: startOfTomorrow,
            },
        });
        const hourlyTraffic = await Visit_1.default.aggregate([
            {
                $match: {
                    visitedAt: {
                        $gte: startOfToday,
                        $lt: startOfTomorrow,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $hour: "$visitedAt",
                    },
                    visitors: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        // User-owned article analytics: top-visited articles authored by the authenticated user
        const userContentIds = await Content_1.default.find({
            author: userObjectId,
        }).distinct("_id");
        const popularArticles = userContentIds.length === 0
            ? []
            : await Visit_1.default.aggregate([
                {
                    $match: {
                        content: {
                            $in: userContentIds,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$content",
                        visits: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        visits: -1,
                    },
                },
                {
                    $limit: 5,
                },
                {
                    $lookup: {
                        from: "contents",
                        localField: "_id",
                        foreignField: "_id",
                        as: "article",
                    },
                },
                {
                    $unwind: "$article",
                },
                {
                    $project: {
                        _id: 1,
                        title: "$article.title",
                        slug: "$article.slug",
                        visits: 1,
                    },
                },
            ]);
        // Fetch user details for verified identity in UI
        const user = await User_1.default.findById(userObjectId).select("name email role");
        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            user: user
                ? {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
                : null,
            stats: {
                totalPosts,
                totalPages,
                totalUsers,
                visitorsToday,
                hourlyTraffic,
                popularArticles,
                globalPosts,
                globalPages,
            },
        });
    }
    catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getDashboardStats = getDashboardStats;
