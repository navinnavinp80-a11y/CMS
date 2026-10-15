"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWebsite = exports.updateWebsite = exports.createWebsite = exports.getWebsitePages = exports.getWebsiteById = exports.getMyWebsites = exports.ensureWebsiteAndAssociatePages = exports.sanitizeWebsiteSlug = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Website_1 = __importDefault(require("../models/Website"));
const Content_1 = __importDefault(require("../models/Content"));
/**
 * Sanitize a string into a clean URL slug for a website.
 */
const sanitizeWebsiteSlug = (input) => {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
exports.sanitizeWebsiteSlug = sanitizeWebsiteSlug;
/**
 * Helper: Ensures at least one website entry exists for the user and associates
 * any unassigned pages (Home, About, Contact) under this website.
 */
const ensureWebsiteAndAssociatePages = async (userId) => {
    let website = userId ? await Website_1.default.findOne({ owner: userId }) : null;
    if (!website) {
        website = await Website_1.default.findOne();
    }
    if (!website) {
        let baseSlug = "my-website";
        let candidateSlug = baseSlug;
        let idx = 1;
        while (await Website_1.default.findOne({ slug: candidateSlug })) {
            candidateSlug = `${baseSlug}-${idx}`;
            idx++;
        }
        website = await Website_1.default.create({
            name: "My Website",
            slug: candidateSlug,
            description: "Primary website containing Home, About, Contact, and landing pages.",
            owner: userId ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
            status: "published",
        });
    }
    // Associate any pages with no website assigned
    const unassignedPages = await Content_1.default.find({
        type: "page",
        $or: [{ website: { $exists: false } }, { website: null }],
    });
    if (unassignedPages.length > 0) {
        for (const page of unassignedPages) {
            page.website = website._id;
            // If slug was an auto-generated placeholder like page-2 or page-3, normalize it to clean slug if possible
            if (page.title.toLowerCase() === "about" && page.slug.startsWith("page-")) {
                const slugTaken = await Content_1.default.findOne({ slug: "about", _id: { $ne: page._id } });
                if (!slugTaken)
                    page.slug = "about";
            }
            else if (page.title.toLowerCase() === "contact" && page.slug.startsWith("page-")) {
                const slugTaken = await Content_1.default.findOne({ slug: "contact", _id: { $ne: page._id } });
                if (!slugTaken)
                    page.slug = "contact";
            }
            await page.save();
        }
    }
    // Assign homepage if not designated yet
    if (!website.homePage) {
        const homePage = await Content_1.default.findOne({
            website: website._id,
            type: "page",
            $or: [{ slug: "home" }, { title: { $regex: /^home$/i } }],
        });
        if (homePage) {
            website.homePage = homePage._id;
            await website.save();
        }
    }
    return website;
};
exports.ensureWebsiteAndAssociatePages = ensureWebsiteAndAssociatePages;
// 1. Get all websites for the current user
const getMyWebsites = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Auto-initialize website and link any unassigned Home/About/Contact pages
        await (0, exports.ensureWebsiteAndAssociatePages)(userId);
        let websites = await Website_1.default.find(userId ? { $or: [{ owner: userId }, { owner: { $exists: false } }] } : {})
            .populate("owner", "name email")
            .populate("homePage", "title slug")
            .sort({ createdAt: 1 });
        if (websites.length === 0) {
            websites = await Website_1.default.find()
                .populate("owner", "name email")
                .populate("homePage", "title slug")
                .sort({ createdAt: 1 });
        }
        const siteIds = websites.map((w) => w._id);
        // Aggregate page statistics for each website
        const contentCounts = await Content_1.default.aggregate([
            { $match: { website: { $in: siteIds } } },
            {
                $group: {
                    _id: { website: "$website", status: "$status" },
                    count: { $sum: 1 },
                },
            },
        ]);
        const countMap = {};
        for (const item of contentCounts) {
            const siteId = item._id.website.toString();
            if (!countMap[siteId]) {
                countMap[siteId] = { totalPages: 0, publishedPages: 0, draftPages: 0 };
            }
            countMap[siteId].totalPages += item.count;
            if (item._id.status === "published") {
                countMap[siteId].publishedPages += item.count;
            }
            else {
                countMap[siteId].draftPages += item.count;
            }
        }
        const websitesWithStats = websites.map((site) => {
            const siteObj = site.toObject();
            const stats = countMap[site._id.toString()] || {
                totalPages: 0,
                publishedPages: 0,
                draftPages: 0,
            };
            return {
                ...siteObj,
                pageCount: stats.totalPages,
                publishedPageCount: stats.publishedPages,
                draftPageCount: stats.draftPages,
            };
        });
        res.status(200).json({
            message: "Websites fetched successfully",
            websites: websitesWithStats,
        });
    }
    catch (error) {
        console.error("getMyWebsites error:", error);
        res.status(500).json({ message: "Server error fetching websites" });
    }
};
exports.getMyWebsites = getMyWebsites;
// 2. Get single website by ID
const getWebsiteById = async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(idParam)) {
            res.status(400).json({ message: "Invalid website ID" });
            return;
        }
        const website = await Website_1.default.findById(idParam)
            .populate("owner", "name email")
            .populate("homePage", "title slug");
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        const pageCount = await Content_1.default.countDocuments({
            website: website._id,
            type: "page",
        });
        res.status(200).json({
            message: "Website fetched successfully",
            website: {
                ...website.toObject(),
                pageCount,
            },
        });
    }
    catch (error) {
        console.error("getWebsiteById error:", error);
        res.status(500).json({ message: "Server error fetching website" });
    }
};
exports.getWebsiteById = getWebsiteById;
// 3. Get all pages belonging to a specific website
const getWebsitePages = async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(idParam)) {
            res.status(400).json({ message: "Invalid website ID" });
            return;
        }
        const website = await Website_1.default.findById(idParam);
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        // Fetch pages sorted so Home comes first, then by creation date
        const pages = await Content_1.default.find({
            website: idParam,
            type: "page",
        })
            .populate("author", "name email")
            .sort({ createdAt: 1 });
        // Custom sort: ensure home page is first
        const sortedPages = [...pages].sort((a, b) => {
            const aIsHome = a.slug === "home" || a.title.toLowerCase() === "home";
            const bIsHome = b.slug === "home" || b.title.toLowerCase() === "home";
            if (aIsHome && !bIsHome)
                return -1;
            if (!aIsHome && bIsHome)
                return 1;
            return 0;
        });
        res.status(200).json({
            message: "Website pages fetched successfully",
            pages: sortedPages,
            website: {
                _id: website._id,
                name: website.name,
                slug: website.slug,
                status: website.status,
            },
        });
    }
    catch (error) {
        console.error("getWebsitePages error:", error);
        res.status(500).json({ message: "Server error fetching website pages" });
    }
};
exports.getWebsitePages = getWebsitePages;
// 4. Create a new Website
const createWebsite = async (req, res) => {
    try {
        const { name, slug, description, status } = req.body;
        const userId = req.user?.id;
        if (!name || !name.trim()) {
            res.status(400).json({ message: "Website name is required" });
            return;
        }
        let cleanSlug = (0, exports.sanitizeWebsiteSlug)(slug || name);
        if (!cleanSlug) {
            cleanSlug = `website-${Date.now()}`;
        }
        // Ensure unique slug
        let candidate = cleanSlug;
        let idx = 1;
        while (await Website_1.default.findOne({ slug: candidate })) {
            candidate = `${cleanSlug}-${idx}`;
            idx++;
        }
        const website = await Website_1.default.create({
            name: name.trim(),
            slug: candidate,
            description: description ? description.trim() : "",
            owner: new mongoose_1.default.Types.ObjectId(userId),
            status: status === "published" ? "published" : "draft",
        });
        res.status(201).json({
            message: "Website created successfully",
            website,
        });
    }
    catch (error) {
        console.error("createWebsite error:", error);
        res.status(500).json({ message: "Server error creating website" });
    }
};
exports.createWebsite = createWebsite;
// 5. Update an existing Website
const updateWebsite = async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
        const { name, slug, description, status, homePage } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(idParam)) {
            res.status(400).json({ message: "Invalid website ID" });
            return;
        }
        const website = await Website_1.default.findById(idParam);
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        if (slug) {
            const cleanSlug = (0, exports.sanitizeWebsiteSlug)(slug);
            if (cleanSlug !== website.slug) {
                const slugExists = await Website_1.default.findOne({
                    slug: cleanSlug,
                    _id: { $ne: idParam },
                });
                if (slugExists) {
                    res.status(409).json({ message: `Slug '${cleanSlug}' is already taken.` });
                    return;
                }
                website.slug = cleanSlug;
            }
        }
        if (name)
            website.name = name.trim();
        if (description !== undefined)
            website.description = description.trim();
        if (status)
            website.status = status;
        if (homePage !== undefined)
            website.homePage = homePage || undefined;
        await website.save();
        res.status(200).json({
            message: "Website updated successfully",
            website,
        });
    }
    catch (error) {
        console.error("updateWebsite error:", error);
        res.status(500).json({ message: "Server error updating website" });
    }
};
exports.updateWebsite = updateWebsite;
// 6. Delete a Website
const deleteWebsite = async (req, res) => {
    try {
        const idParam = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(idParam)) {
            res.status(400).json({ message: "Invalid website ID" });
            return;
        }
        const website = await Website_1.default.findById(idParam);
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        // Cascade delete associated pages
        const deleted = await Content_1.default.deleteMany({ website: idParam });
        await Website_1.default.findByIdAndDelete(idParam);
        res.status(200).json({
            message: `Website '${website.name}' and its ${deleted.deletedCount} pages deleted successfully.`,
        });
    }
    catch (error) {
        console.error("deleteWebsite error:", error);
        res.status(500).json({ message: "Server error deleting website" });
    }
};
exports.deleteWebsite = deleteWebsite;
