"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicPagesList = exports.getPublicContentBySlug = exports.deleteContent = exports.updateContent = exports.getContentById = exports.getAllContent = exports.createContent = exports.resolveUniqueSlug = exports.sanitizeSlug = exports.RESERVED_SLUGS = void 0;
const Content_1 = __importDefault(require("../models/Content"));
const User_1 = __importDefault(require("../models/User"));
const Website_1 = __importDefault(require("../models/Website"));
const templateService_1 = require("../services/templateService");
exports.RESERVED_SLUGS = new Set([
    "login",
    "signup",
    "dashboard",
    "content",
    "media",
    "users",
    "analytics",
    "settings",
    "stores",
    "store-editor",
    "store",
    "api",
    "p",
]);
/**
 * Sanitize raw string into a clean URL slug.
 * Spaces and underscores -> hyphens.
 * Removes non-alphanumeric/hyphen characters.
 * Trims leading/trailing hyphens.
 */
const sanitizeSlug = (raw) => {
    const trimmed = String(raw || "").trim().toLowerCase();
    if (trimmed === "" || trimmed === "home" || trimmed === "index" || trimmed === "/") {
        return "home";
    }
    return trimmed
        .replace(/^[/#]+/, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};
exports.sanitizeSlug = sanitizeSlug;
/**
 * Resolves a safe, collision-free, non-reserved slug.
 * If collision occurs with another document, appends sequential numeric suffix (-1, -2...).
 */
const resolveUniqueSlug = async (rawSlug, excludeId) => {
    let base = (0, exports.sanitizeSlug)(rawSlug);
    if (!base) {
        base = `page-${Date.now()}`;
    }
    // Prevent shadowing system admin routes
    if (exports.RESERVED_SLUGS.has(base)) {
        base = `${base}-page`;
    }
    const query = { slug: base };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const existing = await Content_1.default.findOne(query);
    if (!existing) {
        return base;
    }
    let index = 1;
    while (true) {
        const candidate = `${base}-${index}`;
        const checkQuery = { slug: candidate };
        if (excludeId) {
            checkQuery._id = { $ne: excludeId };
        }
        const check = await Content_1.default.findOne(checkQuery);
        if (!check) {
            return candidate;
        }
        index++;
    }
};
exports.resolveUniqueSlug = resolveUniqueSlug;
const createContent = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { title, slug, content, type, status, featuredImage, metaTitle, metaDescription, website, templateId } = req.body;
        if (!title || !content || !type) {
            res.status(400).json({
                message: "Title, content and type are required",
            });
            return;
        }
        // Backend enforcement for template plan access
        if (templateId) {
            const resolved = (0, templateService_1.resolveTemplateId)(templateId);
            if ((0, templateService_1.isTemplatePremium)(resolved)) {
                const user = await User_1.default.findById(userId);
                if (!(0, templateService_1.canUserAccessTemplate)(user, resolved)) {
                    res.status(403).json({
                        message: "The selected template requires a Premium plan. Upgrade to unlock this template.",
                        premiumRequired: true,
                    });
                    return;
                }
            }
        }
        // If attaching to a website, verify ownership
        if (website) {
            if (req.user?.role !== "admin") {
                const targetWebsite = await Website_1.default.findOne({ _id: website, owner: userId });
                if (!targetWebsite) {
                    res.status(403).json({
                        message: "You are not authorized to attach content to this website",
                    });
                    return;
                }
            }
            else {
                const targetWebsite = await Website_1.default.findById(website);
                if (!targetWebsite) {
                    res.status(404).json({
                        message: "Website not found",
                    });
                    return;
                }
            }
        }
        const safeSlug = await (0, exports.resolveUniqueSlug)(slug || title);
        const newContent = await Content_1.default.create({
            title,
            slug: safeSlug,
            content,
            type,
            status: status || "draft",
            featuredImage: featuredImage || "",
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
            author: userId,
            website: website || undefined,
            templateId: templateId ? (0, templateService_1.resolveTemplateId)(templateId) : undefined,
        });
        res.status(201).json({
            message: "Content created successfully",
            content: newContent,
        });
    }
    catch (error) {
        console.error("Create content error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.createContent = createContent;
const getAllContent = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const filter = {};
        // Non-admin users only see content they authored
        if (req.user?.role !== "admin") {
            filter.author = userId;
        }
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.search && String(req.query.search).trim() !== "") {
            const regex = new RegExp(String(req.query.search).trim(), "i");
            filter.$or = [{ title: regex }, { slug: regex }];
        }
        if (req.query.website) {
            const websiteId = typeof req.query.website === "string" ? req.query.website : String(req.query.website);
            if (req.user?.role !== "admin") {
                const targetWebsite = await Website_1.default.findOne({ _id: websiteId, owner: userId });
                if (!targetWebsite) {
                    res.status(403).json({
                        message: "You are not authorized to view content for this website",
                    });
                    return;
                }
            }
            filter.website = websiteId;
        }
        const contents = await Content_1.default.find(filter)
            .populate("author", "name email role")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Content fetched successfully",
            contents,
        });
    }
    catch (error) {
        console.error("Get content error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getAllContent = getAllContent;
const getContentById = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const content = await Content_1.default.findById(id)
            .populate("author", "name email role");
        if (!content) {
            res.status(404).json({
                message: "Content not found",
            });
            return;
        }
        const authorId = content.author
            ? (content.author?._id
                ? content.author._id.toString()
                : content.author.toString())
            : null;
        if (req.user?.role !== "admin" && (!authorId || authorId !== userId)) {
            res.status(403).json({
                message: "You are not authorized to access this content",
            });
            return;
        }
        res.status(200).json({
            message: "Content fetched successfully",
            content,
        });
    }
    catch (error) {
        console.error("Get content by ID error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getContentById = getContentById;
const updateContent = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const { title, slug, content, type, status, featuredImage, metaTitle, metaDescription, website, templateId } = req.body;
        const existingContent = await Content_1.default.findById(id);
        if (!existingContent) {
            res.status(404).json({
                message: "Content not found",
            });
            return;
        }
        const authorId = existingContent.author
            ? (existingContent.author?._id
                ? existingContent.author._id.toString()
                : existingContent.author.toString())
            : null;
        if (req.user?.role !== "admin" && (!authorId || authorId !== userId)) {
            res.status(403).json({
                message: "You are not authorized to modify this content",
            });
            return;
        }
        // Backend enforcement for template plan access
        if (templateId !== undefined && templateId) {
            const resolved = (0, templateService_1.resolveTemplateId)(templateId);
            if ((0, templateService_1.isTemplatePremium)(resolved)) {
                const user = await User_1.default.findById(userId);
                if (!(0, templateService_1.canUserAccessTemplate)(user, resolved)) {
                    res.status(403).json({
                        message: "The selected template requires a Premium plan. Upgrade to unlock this template.",
                        premiumRequired: true,
                    });
                    return;
                }
            }
            existingContent.templateId = resolved;
        }
        // If reassigning website, verify website ownership
        if (website !== undefined && website) {
            if (req.user?.role !== "admin") {
                const targetWebsite = await Website_1.default.findOne({ _id: website, owner: userId });
                if (!targetWebsite) {
                    res.status(403).json({
                        message: "You are not authorized to attach content to this website",
                    });
                    return;
                }
            }
            else {
                const targetWebsite = await Website_1.default.findById(website);
                if (!targetWebsite) {
                    res.status(404).json({
                        message: "Website not found",
                    });
                    return;
                }
            }
        }
        const idParam = Array.isArray(id) ? id[0] : String(id);
        if (slug !== undefined) {
            const safeSlug = await (0, exports.resolveUniqueSlug)(slug || title || existingContent.title, idParam);
            existingContent.slug = safeSlug;
        }
        existingContent.title = title ?? existingContent.title;
        existingContent.content = content ?? existingContent.content;
        existingContent.type = type ?? existingContent.type;
        existingContent.status = status ?? existingContent.status;
        if (featuredImage !== undefined) {
            existingContent.featuredImage = featuredImage;
        }
        if (metaTitle !== undefined) {
            existingContent.metaTitle = metaTitle;
        }
        if (metaDescription !== undefined) {
            existingContent.metaDescription = metaDescription;
        }
        if (website !== undefined) {
            existingContent.website = website || undefined;
        }
        await existingContent.save();
        res.status(200).json({
            message: "Content updated successfully",
            content: existingContent,
        });
    }
    catch (error) {
        console.error("Update content error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.updateContent = updateContent;
const deleteContent = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const content = await Content_1.default.findById(id);
        if (!content) {
            res.status(404).json({
                message: "Content not found",
            });
            return;
        }
        const authorId = content.author
            ? (content.author?._id
                ? content.author._id.toString()
                : content.author.toString())
            : null;
        if (req.user?.role !== "admin" && (!authorId || authorId !== userId)) {
            res.status(403).json({
                message: "You are not authorized to delete this content",
            });
            return;
        }
        await Content_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: "Content deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete content error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.deleteContent = deleteContent;
/**
 * Public route to fetch published content by slug.
 * If slug is empty, "home", "index", or "root", returns the designated Home page.
 * Returns 404 for draft pages or non-existent content.
 */
const getPublicContentBySlug = async (req, res) => {
    try {
        let slug = req.params.slug ? String(req.params.slug).trim().toLowerCase() : "";
        let content = null;
        if (!slug || slug === "home" || slug === "index" || slug === "root") {
            // 1. Look for published page with slug 'home' or 'index'
            content = await Content_1.default.findOne({
                status: "published",
                type: "page",
                slug: { $in: ["home", "index"] },
            }).populate("author", "name email");
            // 2. Fallback: look for published page with title 'Home' (case-insensitive)
            if (!content) {
                content = await Content_1.default.findOne({
                    status: "published",
                    type: "page",
                    title: { $regex: /^home$/i },
                }).populate("author", "name email");
            }
            // 3. Fallback: look for any published content with slug 'home'
            if (!content) {
                content = await Content_1.default.findOne({
                    status: "published",
                    slug: "home",
                }).populate("author", "name email");
            }
            // 4. Fallback: first published page of type 'page'
            if (!content) {
                content = await Content_1.default.findOne({
                    status: "published",
                    type: "page",
                })
                    .sort({ createdAt: 1 })
                    .populate("author", "name email");
            }
        }
        else {
            content = await Content_1.default.findOne({
                slug,
                status: "published",
            }).populate("author", "name email");
        }
        if (!content) {
            res.status(404).json({
                message: "Published content not found",
            });
            return;
        }
        res.status(200).json({
            message: "Published page fetched successfully",
            content,
        });
    }
    catch (error) {
        console.error("Get public content error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getPublicContentBySlug = getPublicContentBySlug;
/**
 * Public route to fetch published pages list for navbar menus and links.
 */
const getPublicPagesList = async (req, res) => {
    try {
        const pages = await Content_1.default.find({
            type: "page",
            status: "published",
        })
            .select("_id title slug status metaTitle metaDescription createdAt")
            .sort({ createdAt: 1 });
        res.status(200).json({
            message: "Published pages fetched successfully",
            pages,
        });
    }
    catch (error) {
        console.error("Get public pages list error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getPublicPagesList = getPublicPagesList;
