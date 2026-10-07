import { Request, Response } from "express";
import Content from "../models/Content";

export const createContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, slug, content,type, status } = req.body;

    if (!title || !slug || !content || !type) {
      res.status(400).json({
        message: "Title, slug and content are required",
      });
      return;
    }

    const existingContent = await Content.findOne({ slug });

    if (existingContent) {
      res.status(400).json({
        message: "Slug already exists",
      });
      return;
    }

    const newContent = await Content.create({
      title,
      slug,
      content,
      type,
      status: status || "draft",
      author: req.user?.id,
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
    const contents = await Content.find()
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
    const { title, slug, content, type, status } = req.body;
    
    const existingContent = await Content.findById(id);

    if (!existingContent) {
      res.status(404).json({
        message: "Content not found",
      });
      return;
    }

    if (slug && slug !== existingContent.slug) {
      const slugExists = await Content.findOne({
        slug,
        _id: { $ne: id },
      });

      if (slugExists) {
        res.status(400).json({
          message: "Slug already exists",
        });
        return;
      }
    }

    existingContent.title = title ?? existingContent.title;
    existingContent.slug = slug ?? existingContent.slug;
    existingContent.content = content ?? existingContent.content;
    existingContent.type = type ?? existingContent.type;
    existingContent.status = status ?? existingContent.status;

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

    const content = await Content.findByIdAndDelete(id);

    if (!content) {
      res.status(404).json({
        message: "Content not found",
      });
      return;
    }

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