"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicWebsitePage = exports.getPublicWebsiteHome = void 0;
const Website_1 = __importDefault(require("../models/Website"));
const Content_1 = __importDefault(require("../models/Content"));
const Visit_1 = __importDefault(require("../models/Visit"));
// 1. Resolve Website Homepage: GET /api/public/sites/:siteSlug
const getPublicWebsiteHome = async (req, res) => {
    try {
        const siteSlug = String(req.params.siteSlug || "");
        if (!siteSlug) {
            res.status(400).json({ message: "Site slug is required" });
            return;
        }
        const website = await Website_1.default.findOne({
            slug: siteSlug.toLowerCase().trim(),
            status: "published",
        }).populate("homePage");
        if (!website) {
            res.status(404).json({
                message: "Published website not found",
            });
            return;
        }
        let pageContent = null;
        if (website.homePage) {
            // Verify the configured homePage is published
            const homeDoc = await Content_1.default.findOne({
                _id: website.homePage._id,
                website: website._id,
                status: "published",
            });
            if (homeDoc) {
                pageContent = homeDoc;
            }
        }
        // Fallback: look for a page with slug 'home', 'index', or the first published page
        if (!pageContent) {
            pageContent = await Content_1.default.findOne({
                website: website._id,
                slug: { $in: ["home", "index"] },
                status: "published",
            });
        }
        if (!pageContent) {
            pageContent = await Content_1.default.findOne({
                website: website._id,
                type: "page",
                status: "published",
            }).sort({ createdAt: 1 });
        }
        // Fallback to any published content on this site
        if (!pageContent) {
            pageContent = await Content_1.default.findOne({
                website: website._id,
                status: "published",
            }).sort({ createdAt: 1 });
        }
        if (!pageContent) {
            res.status(404).json({
                message: "This website does not have any published pages yet.",
                website: {
                    name: website.name,
                    slug: website.slug,
                    settings: website.settings,
                },
            });
            return;
        }
        // Record visit asynchronously
        Visit_1.default.create({ content: pageContent._id, visitedAt: new Date() }).catch(() => { });
        res.status(200).json({
            message: "Website homepage fetched successfully",
            website: {
                id: website._id,
                name: website.name,
                slug: website.slug,
                description: website.description,
                settings: website.settings,
            },
            content: pageContent,
            homePage: pageContent,
            page: pageContent,
        });
    }
    catch (error) {
        console.error("getPublicWebsiteHome error:", error);
        res.status(500).json({
            message: "Server error fetching website home",
        });
    }
};
exports.getPublicWebsiteHome = getPublicWebsiteHome;
// 2. Resolve Specific Page on a Website: GET /api/public/sites/:siteSlug/pages/:pageSlug
const getPublicWebsitePage = async (req, res) => {
    try {
        const siteSlug = String(req.params.siteSlug || "");
        const pageSlug = String(req.params.pageSlug || "");
        if (!siteSlug || !pageSlug) {
            res.status(400).json({ message: "Site slug and page slug are required" });
            return;
        }
        const website = await Website_1.default.findOne({
            slug: siteSlug.toLowerCase().trim(),
            status: "published",
        });
        if (!website) {
            res.status(404).json({
                message: "Published website not found",
            });
            return;
        }
        const pageContent = await Content_1.default.findOne({
            website: website._id,
            slug: pageSlug.trim(),
            status: "published",
        });
        if (!pageContent) {
            res.status(404).json({
                message: "Published page not found on this website",
            });
            return;
        }
        // Record visit asynchronously
        Visit_1.default.create({ content: pageContent._id, visitedAt: new Date() }).catch(() => { });
        res.status(200).json({
            message: "Published page fetched successfully",
            website: {
                id: website._id,
                name: website.name,
                slug: website.slug,
                description: website.description,
                settings: website.settings,
            },
            content: pageContent,
            page: pageContent,
        });
    }
    catch (error) {
        console.error("getPublicWebsitePage error:", error);
        res.status(500).json({
            message: "Server error fetching website page",
        });
    }
};
exports.getPublicWebsitePage = getPublicWebsitePage;
