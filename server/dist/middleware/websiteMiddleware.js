"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebsiteOwnership = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Website_1 = __importDefault(require("../models/Website"));
const verifyWebsiteOwnership = async (req, res, next) => {
    try {
        const siteId = req.params.websiteId ||
            req.params.siteId ||
            req.body.websiteId ||
            req.body.website ||
            req.query.websiteId ||
            req.headers["x-website-id"];
        if (!siteId) {
            res.status(400).json({
                message: "Website ID is required",
            });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(String(siteId))) {
            res.status(400).json({
                message: "Invalid website ID format",
            });
            return;
        }
        const website = await Website_1.default.findById(siteId);
        if (!website) {
            res.status(404).json({
                message: "Website not found",
            });
            return;
        }
        const currentUserId = req.user?.id;
        const isOwner = website.owner.toString() === currentUserId;
        const isAdmin = req.user?.role === "admin";
        if (!isOwner && !isAdmin) {
            res.status(403).json({
                message: "Access denied. You do not own this website.",
            });
            return;
        }
        req.website = website;
        next();
    }
    catch (error) {
        console.error("verifyWebsiteOwnership error:", error);
        res.status(500).json({
            message: "Server error verifying website access",
        });
    }
};
exports.verifyWebsiteOwnership = verifyWebsiteOwnership;
