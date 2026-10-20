"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebsitePages = exports.deleteWebsite = exports.updateWebsite = exports.getWebsiteById = exports.createWebsite = exports.getWebsites = exports.normalizeWebsiteSlug = void 0;
const Website_1 = __importDefault(require("../models/Website"));
const Content_1 = __importDefault(require("../models/Content"));
const User_1 = __importDefault(require("../models/User"));
const entitlementService_1 = require("../services/entitlementService");
const templateService_1 = require("../services/templateService");
const defaultTemplateComponents_1 = require("../services/defaultTemplateComponents");
const normalizeWebsiteSlug = (slug) => {
    return slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
exports.normalizeWebsiteSlug = normalizeWebsiteSlug;
/**
 * GET /api/websites
 * Returns all websites belonging to the authenticated user (or all for admin).
 * Supports optional ?search= query parameter.
 */
const getWebsites = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const searchQuery = req.query.search;
        const baseFilter = req.user?.role === "admin"
            ? {}
            : { $or: [{ owner: userId }, { owner: { $exists: false } }, { owner: null }] };
        let filter = baseFilter;
        if (searchQuery && searchQuery.trim() !== "") {
            const regex = new RegExp(searchQuery.trim(), "i");
            const searchConditions = [{ name: regex }, { slug: regex }, { description: regex }];
            filter =
                Object.keys(baseFilter).length > 0
                    ? { $and: [baseFilter, { $or: searchConditions }] }
                    : { $or: searchConditions };
        }
        const websites = await Website_1.default.find(filter)
            .populate("owner", "name email role")
            .populate("homePage", "title slug status")
            .sort({ updatedAt: -1 });
        // Ensure every website has a homePage linked so frontend page editor can always open it
        for (const site of websites) {
            if (!site.homePage) {
                let existingPage = await Content_1.default.findOne({
                    website: site._id,
                    type: "page",
                });
                if (!existingPage) {
                    existingPage = await Content_1.default.create({
                        title: `${site.name} Home`,
                        slug: site.slug === "home" ? `home-${Date.now().toString().slice(-4)}` : site.slug,
                        content: JSON.stringify([]),
                        type: "page",
                        status: site.status,
                        author: userId,
                        website: site._id,
                    });
                }
                site.homePage = existingPage._id;
                await site.save();
            }
        }
        res.status(200).json({
            message: "Websites fetched successfully",
            websites,
            website: websites[0] || null,
        });
    }
    catch (error) {
        console.error("Get websites error:", error);
        res.status(500).json({ message: "Server error fetching websites" });
    }
};
exports.getWebsites = getWebsites;
/**
 * POST /api/websites
 * Creates a new website for the authenticated user.
 * Enforces Free/Premium entitlement limit.
 */
const createWebsite = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        // Entitlement verification: Free users get max 2 websites; 3rd requires active Premium
        const entitlement = await (0, entitlementService_1.canUserCreateWebsite)(userId);
        if (!entitlement.allowed) {
            res.status(403).json({
                message: entitlement.reason ||
                    "Free plan allows only 2 websites. Upgrade to Premium to create more websites.",
                limitReached: true,
                currentCount: entitlement.currentCount,
                maxAllowed: entitlement.maxAllowed,
            });
            return;
        }
        const { name, slug, description, status, settings, templateId } = req.body;
        const finalName = String(name || "").trim();
        if (!finalName) {
            res.status(400).json({ message: "Website name is required" });
            return;
        }
        const cleanSlug = (0, exports.normalizeWebsiteSlug)(slug || finalName);
        if (!cleanSlug) {
            res.status(400).json({
                message: "Invalid slug format. Please use letters, numbers, and hyphens.",
            });
            return;
        }
        // Backend template access entitlement check
        const chosenTemplateId = (0, templateService_1.resolveTemplateId)(templateId || "minimal-clean");
        if ((0, templateService_1.isTemplatePremium)(chosenTemplateId)) {
            const user = await User_1.default.findById(userId);
            if (!(0, templateService_1.canUserAccessTemplate)(user, chosenTemplateId)) {
                res.status(403).json({
                    message: "The selected template requires a Premium plan. Upgrade to unlock this template.",
                    premiumRequired: true,
                });
                return;
            }
        }
        // Check if slug is already taken
        const slugExists = await Website_1.default.findOne({ slug: cleanSlug });
        if (slugExists) {
            res.status(400).json({
                message: `The website URL / slug "${cleanSlug}" is already in use. Please choose another.`,
            });
            return;
        }
        const newWebsite = await Website_1.default.create({
            name: finalName,
            slug: cleanSlug,
            description: description || "",
            owner: userId,
            status: status === "published" ? "published" : "draft",
            templateId: chosenTemplateId,
            settings: settings || {},
        });
        // Auto-create initial home page with chosen template components
        const initialComponents = (0, defaultTemplateComponents_1.getDefaultComponentsForTemplate)(chosenTemplateId, finalName);
        const homePage = await Content_1.default.create({
            title: `${finalName} Home`,
            slug: cleanSlug === "home" ? `home-${Date.now().toString().slice(-4)}` : cleanSlug,
            content: JSON.stringify(initialComponents),
            type: "page",
            status: status === "published" ? "published" : "draft",
            author: userId,
            website: newWebsite._id,
            templateId: chosenTemplateId,
        });
        newWebsite.homePage = homePage._id;
        await newWebsite.save();
        res.status(201).json({
            message: "Website created successfully",
            website: newWebsite,
        });
    }
    catch (error) {
        console.error("Create website error:", error);
        if (error.code === 11000) {
            res.status(400).json({ message: "A website with this slug already exists." });
            return;
        }
        res.status(500).json({ message: "Server error creating website" });
    }
};
exports.createWebsite = createWebsite;
/**
 * GET /api/websites/:id
 * Fetches a single website and its associated pages.
 * Enforces owner/admin authorization.
 */
const getWebsiteById = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const website = await Website_1.default.findById(id)
            .populate("owner", "name email role")
            .populate("homePage", "title slug status");
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        const websiteOwnerId = website.owner?._id
            ? website.owner._id.toString()
            : website.owner?.toString();
        if (websiteOwnerId && websiteOwnerId !== userId && req.user?.role !== "admin") {
            res.status(403).json({ message: "You are not authorized to access this website" });
            return;
        }
        const pages = await Content_1.default.find({
            website: website._id,
            type: "page",
        }).sort({ createdAt: 1 });
        res.status(200).json({
            message: "Website fetched successfully",
            website,
            pages,
        });
    }
    catch (error) {
        console.error("Get website by ID error:", error);
        res.status(500).json({ message: "Server error fetching website" });
    }
};
exports.getWebsiteById = getWebsiteById;
/**
 * PUT /api/websites/:id
 * Updates an existing website.
 * Enforces owner/admin authorization.
 * Note: Editing does NOT consume creation allowance.
 */
const updateWebsite = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const website = await Website_1.default.findById(id);
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        const websiteOwnerId = website.owner?._id
            ? website.owner._id.toString()
            : website.owner?.toString();
        if (websiteOwnerId && websiteOwnerId !== userId && req.user?.role !== "admin") {
            res.status(403).json({ message: "You are not authorized to modify this website" });
            return;
        }
        const { name, slug, description, status, homePage, settings, templateId } = req.body;
        if (templateId !== undefined && templateId) {
            const chosenTemplateId = (0, templateService_1.resolveTemplateId)(templateId);
            if ((0, templateService_1.isTemplatePremium)(chosenTemplateId)) {
                const user = await User_1.default.findById(userId);
                if (!(0, templateService_1.canUserAccessTemplate)(user, chosenTemplateId)) {
                    res.status(403).json({
                        message: "The selected template requires a Premium plan. Upgrade to unlock this template.",
                        premiumRequired: true,
                    });
                    return;
                }
            }
            website.templateId = chosenTemplateId;
        }
        if (slug) {
            const cleanSlug = (0, exports.normalizeWebsiteSlug)(slug);
            if (!cleanSlug) {
                res.status(400).json({ message: "Invalid slug format" });
                return;
            }
            if (cleanSlug !== website.slug) {
                const slugExists = await Website_1.default.findOne({
                    slug: cleanSlug,
                    _id: { $ne: id },
                });
                if (slugExists) {
                    res.status(400).json({
                        message: `The website URL / slug "${cleanSlug}" is already in use.`,
                    });
                    return;
                }
                website.slug = cleanSlug;
            }
        }
        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (trimmedName)
                website.name = trimmedName;
        }
        if (description !== undefined) {
            website.description = String(description).trim();
        }
        if (status !== undefined && (status === "draft" || status === "published")) {
            website.status = status;
        }
        if (homePage !== undefined) {
            website.homePage = homePage || undefined;
        }
        if (settings !== undefined) {
            website.settings = {
                ...website.settings,
                ...settings,
            };
        }
        await website.save();
        res.status(200).json({
            message: "Website updated successfully",
            website,
        });
    }
    catch (error) {
        console.error("Update website error:", error);
        if (error.code === 11000) {
            res.status(400).json({ message: "A website with this slug already exists." });
            return;
        }
        res.status(500).json({ message: "Server error updating website" });
    }
};
exports.updateWebsite = updateWebsite;
/**
 * DELETE /api/websites/:id
 * Permanently deletes a website.
 * Enforces owner/admin authorization.
 */
const deleteWebsite = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const website = await Website_1.default.findById(id);
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        const websiteOwnerId = website.owner?._id
            ? website.owner._id.toString()
            : website.owner?.toString();
        if (websiteOwnerId && websiteOwnerId !== userId && req.user?.role !== "admin") {
            res.status(403).json({ message: "You are not authorized to delete this website" });
            return;
        }
        // Unlink any pages associated with this website without causing index collisions
        const sitePages = await Content_1.default.find({ website: id });
        for (const page of sitePages) {
            try {
                page.website = undefined;
                const collision = await Content_1.default.findOne({
                    $or: [{ website: null }, { website: { $exists: false } }],
                    slug: page.slug,
                    _id: { $ne: page._id },
                });
                if (collision) {
                    page.slug = `${page.slug}-${Date.now().toString().slice(-4)}`;
                }
                await page.save();
            }
            catch (e) {
                // Fallback: delete orphan page if it cannot be unlinked cleanly
                await Content_1.default.findByIdAndDelete(page._id).catch(() => null);
            }
        }
        await Website_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: "Website deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete website error:", error);
        res.status(500).json({ message: "Server error deleting website" });
    }
};
exports.deleteWebsite = deleteWebsite;
/**
 * GET /api/websites/:id/pages
 * Returns all pages belonging to the specified website.
 */
const getWebsitePages = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { id } = req.params;
        const website = await Website_1.default.findById(id);
        if (!website) {
            res.status(404).json({ message: "Website not found" });
            return;
        }
        const websiteOwnerId = website.owner?._id
            ? website.owner._id.toString()
            : website.owner?.toString();
        if (websiteOwnerId && websiteOwnerId !== userId && req.user?.role !== "admin") {
            res.status(403).json({ message: "You are not authorized to view this website" });
            return;
        }
        const pages = await Content_1.default.find({
            website: website._id,
            type: "page",
        }).sort({ createdAt: 1 });
        res.status(200).json({
            message: "Website pages fetched successfully",
            pages,
        });
    }
    catch (error) {
        console.error("Get website pages error:", error);
        res.status(500).json({ message: "Server error fetching website pages" });
    }
};
exports.getWebsitePages = getWebsitePages;
