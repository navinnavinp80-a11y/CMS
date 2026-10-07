"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Content_1 = __importDefault(require("../models/Content"));
const Visit_1 = __importDefault(require("../models/Visit"));
const getDashboardStats = async (req, res) => {
    try {
        const totalPosts = await Content_1.default.countDocuments({
            type: "post",
        });
        const totalPages = await Content_1.default.countDocuments({
            type: "page",
        });
        const totalUsers = await User_1.default.countDocuments();
        // Start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        // Start of tomorrow
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
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
        // popularArticles ഇവിടെയാണ് വരേണ്ടത്
        const popularArticles = await Visit_1.default.aggregate([
            {
                $match: {
                    content: {
                        $exists: true,
                        $ne: null,
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
        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            stats: {
                totalPosts,
                totalPages,
                totalUsers,
                visitorsToday,
                hourlyTraffic,
                popularArticles,
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
