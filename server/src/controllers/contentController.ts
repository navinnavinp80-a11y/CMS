import { Request, Response } from "express";
import Content from "../models/Content";
import User from "../models/User";
import {
  isTemplatePremium,
  canUserAccessTemplate,
  resolveTemplateId,
} from "../services/templateService";

export const RESERVED_SLUGS = new Set([
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
export const sanitizeSlug = (raw: string): string => {
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

/**
 * Resolves a safe, collision-free, non-reserved slug.
 * If collision occurs with another document, appends sequential numeric suffix (-1, -2...).
 */
export const resolveUniqueSlug = async (
  rawSlug: string,
  excludeId?: string
): Promise<string> => {
  let base = sanitizeSlug(rawSlug);
  if (!base) {
    base = `page-${Date.now()}`;
  }

  // Prevent shadowing system admin routes
  if (RESERVED_SLUGS.has(base)) {
    base = `${base}-page`;
  }

  const query: Record<string, any> = { slug: base };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await Content.findOne(query);

  if (!existing) {
    return base;
  }

  let index = 1;
  while (true) {
    const candidate = `${base}-${index}`;
    const checkQuery: Record<string, any> = { slug: candidate };
    if (excludeId) {
      checkQuery._id = { $ne: excludeId };
    }
    const check = await Content.findOne(checkQuery);
    if (!check) {
      return candidate;
    }
    index++;
  }
};

export const createContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, slug, content, type, status, featuredImage, metaTitle, metaDescription, website, templateId } = req.body;

    if (!title || !content || !type) {
      res.status(400).json({
        message: "Title, content and type are required",
      });
      return;
    }

    // Backend enforcement for template plan access
    if (templateId) {
      const resolved = resolveTemplateId(templateId);
      if (isTemplatePremium(resolved)) {
        const user = await User.findById(req.user?.id);
        if (!canUserAccessTemplate(user, resolved)) {
          res.status(403).json({
            message: "The selected template requires a Premium plan. Upgrade to unlock this template.",
            premiumRequired: true,
          });
          return;
        }
      }
    }

    const safeSlug = await resolveUniqueSlug(slug || title);

    const newContent = await Content.create({
      title,
      slug: safeSlug,
      content,
      type,
      status: status || "draft",
      featuredImage: featuredImage || "",
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      author: req.user?.id,
      website: website || undefined,
      templateId: templateId ? resolveTemplateId(templateId) : undefined,
    });

    res.status(201).json({
      message: "Content created successfully",
      content: newContent,
    });
  } catch (error) {
    console.error("Create content error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter: Record<string, any> = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.website) {
      filter.website = req.query.website;
    }

    const contents = await Content.find(filter)
      .populate("author", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Content fetched successfully",
      contents,
    });
  } catch (error) {
    console.error("Get content error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getContentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id)
      .populate("author", "name email role");

    if (!content) {
      res.status(404).json({
        message: "Content not found",
      });
      return;
    }

    res.status(200).json({
      message: "Content fetched successfully",
      content,
    });
  } catch (error) {
    console.error("Get content by ID error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, slug, content, type, status, featuredImage, metaTitle, metaDescription, website, templateId } = req.body;

    const existingContent = await Content.findById(id);

    if (!existingContent) {
      res.status(404).json({
        message: "Content not found",
      });
      return;
    }

    const authorId = existingContent.author?.toString();
    if (authorId && authorId !== req.user?.id && req.user?.role !== "admin") {
      res.status(403).json({
        message: "You are not authorized to modify this content",
      });
      return;
    }

    // Backend enforcement for template plan access
    if (templateId !== undefined && templateId) {
      const resolved = resolveTemplateId(templateId);
      if (isTemplatePremium(resolved)) {
        const user = await User.findById(req.user?.id);
        if (!canUserAccessTemplate(user, resolved)) {
          res.status(403).json({
            message: "The selected template requires a Premium plan. Upgrade to unlock this template.",
            premiumRequired: true,
          });
          return;
        }
      }
      existingContent.templateId = resolved;
    }

    const idParam = Array.isArray(id) ? id[0] : String(id);
    if (slug !== undefined) {
      const safeSlug = await resolveUniqueSlug(slug || title || existingContent.title, idParam);
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
  } catch (error) {
    console.error("Update content error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id);

    if (!content) {
      res.status(404).json({
        message: "Content not found",
      });
      return;
    }

    const authorId = content.author?.toString();
    if (authorId && authorId !== req.user?.id && req.user?.role !== "admin") {
      res.status(403).json({
        message: "You are not authorized to delete this content",
      });
      return;
    }

    await Content.findByIdAndDelete(id);

    res.status(200).json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * Public route to fetch published content by slug.
 * If slug is empty, "home", "index", or "root", returns the designated Home page.
 * Returns 404 for draft pages or non-existent content.
 */
export const getPublicContentBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let slug = req.params.slug ? String(req.params.slug).trim().toLowerCase() : "";

    let content = null;

    if (!slug || slug === "home" || slug === "index" || slug === "root") {
      // 1. Look for published page with slug 'home' or 'index'
      content = await Content.findOne({
        status: "published",
        type: "page",
        slug: { $in: ["home", "index"] },
      }).populate("author", "name email");

      // 2. Fallback: look for published page with title 'Home' (case-insensitive)
      if (!content) {
        content = await Content.findOne({
          status: "published",
          type: "page",
          title: { $regex: /^home$/i },
        }).populate("author", "name email");
      }

      // 3. Fallback: look for any published content with slug 'home'
      if (!content) {
        content = await Content.findOne({
          status: "published",
          slug: "home",
        }).populate("author", "name email");
      }

      // 4. Fallback: first published page of type 'page'
      if (!content) {
        content = await Content.findOne({
          status: "published",
          type: "page",
        })
          .sort({ createdAt: 1 })
          .populate("author", "name email");
      }
    } else {
      content = await Content.findOne({
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
  } catch (error) {
    console.error("Get public content error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * Public route to fetch published pages list for navbar menus and links.
 */
export const getPublicPagesList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pages = await Content.find({
      type: "page",
      status: "published",
    })
      .select("_id title slug status metaTitle metaDescription createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Published pages fetched successfully",
      pages,
    });
  } catch (error) {
    console.error("Get public pages list error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};