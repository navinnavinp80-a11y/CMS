"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTemplateAccess = exports.getTemplates = void 0;
const User_1 = __importDefault(require("../models/User"));
const templateService_1 = require("../services/templateService");
/**
 * GET /api/templates
 * Returns list of templates and flags if user has access.
 */
const getTemplates = async (req, res) => {
    try {
        let user = null;
        if (req.user?.id) {
            user = await User_1.default.findById(req.user.id);
        }
        const templates = (0, templateService_1.getAvailableTemplates)(user);
        res.status(200).json({
            message: "Templates fetched successfully",
            templates,
        });
    }
    catch (error) {
        console.error("Get templates error:", error);
        res.status(500).json({ message: "Server error fetching templates" });
    }
};
exports.getTemplates = getTemplates;
/**
 * POST /api/templates/validate
 * Validates if the authenticated user has access to a specific template.
 */
const validateTemplateAccess = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { templateId } = req.body;
        if (!templateId) {
            res.status(400).json({ message: "Template ID is required" });
            return;
        }
        const resolved = (0, templateService_1.resolveTemplateId)(templateId);
        const user = await User_1.default.findById(userId);
        const allowed = (0, templateService_1.canUserAccessTemplate)(user, resolved);
        const isPremium = (0, templateService_1.isTemplatePremium)(resolved);
        if (!allowed) {
            res.status(403).json({
                allowed: false,
                templateId: resolved,
                isPremium,
                message: "This template is exclusive to Premium subscribers. Upgrade your account to unlock this template.",
            });
            return;
        }
        res.status(200).json({
            allowed: true,
            templateId: resolved,
            isPremium,
            message: "Template access granted",
        });
    }
    catch (error) {
        console.error("Validate template access error:", error);
        res.status(500).json({ message: "Server error validating template access" });
    }
};
exports.validateTemplateAccess = validateTemplateAccess;
