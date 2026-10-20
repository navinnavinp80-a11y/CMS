import { Request, Response } from "express";
import User from "../models/User";
import {
  getAvailableTemplates,
  isTemplatePremium,
  canUserAccessTemplate,
  resolveTemplateId,
} from "../services/templateService";

/**
 * GET /api/templates
 * Returns list of templates and flags if user has access.
 */
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    let user = null;
    if (req.user?.id) {
      user = await User.findById(req.user.id);
    }

    const templates = getAvailableTemplates(user);

    res.status(200).json({
      message: "Templates fetched successfully",
      templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ message: "Server error fetching templates" });
  }
};

/**
 * POST /api/templates/validate
 * Validates if the authenticated user has access to a specific template.
 */
export const validateTemplateAccess = async (req: Request, res: Response): Promise<void> => {
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

    const resolved = resolveTemplateId(templateId);
    const user = await User.findById(userId);
    const allowed = canUserAccessTemplate(user, resolved);
    const isPremium = isTemplatePremium(resolved);

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
  } catch (error) {
    console.error("Validate template access error:", error);
    res.status(500).json({ message: "Server error validating template access" });
  }
};
