import { Request, Response } from "express";
import User from "../models/User";
import Content from "../models/Content";
import Visit from "../models/Visit";

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalPosts = await Content.countDocuments({
      type: "post",
    });

    const totalPages = await Content.countDocuments({
      type: "page",
    });

    const totalUsers = await User.countDocuments();

    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Start of tomorrow
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const visitorsToday = await Visit.countDocuments({
      visitedAt: {
        $gte: startOfToday,
        $lt: startOfTomorrow,
      },
    });

    const hourlyTraffic = await Visit.aggregate([
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
    const popularArticles = await Visit.aggregate([
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
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};