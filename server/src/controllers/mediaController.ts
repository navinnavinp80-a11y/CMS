import { Request, Response } from "express";
import Media from "../models/Media";
import Website from "../models/Website";
import fs from "fs";
import path from "path";

export const uploadMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Missing authentication" });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: "No file uploaded",
      });
      return;
    }

    const fileType = req.file.mimetype.startsWith("image/")
      ? "image"
      : req.file.mimetype.startsWith("video/")
        ? "video"
        : null;

    if (!fileType) {
      res.status(400).json({
        message: "Only image and video files are allowed",
      });
      return;
    }

    const { website } = req.body;
    if (website) {
      if (req.user?.role !== "admin") {
        const targetWebsite = await Website.findOne({ _id: website, owner: userId });
        if (!targetWebsite) {
          res.status(403).json({
            message: "You are not authorized to attach media to this website",
          });
          return;
        }
      } else {
        const targetWebsite = await Website.findById(website);
        if (!targetWebsite) {
          res.status(404).json({
            message: "Website not found",
          });
          return;
        }
      }
    }

    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      type: fileType,
      uploadedBy: userId,
      website: website || undefined,
    });

    res.status(201).json({
      message: "Media uploaded successfully",
      media,
    });
  } catch (error) {
    console.error("Media upload error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getAllMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Missing authentication" });
      return;
    }

    const filter: Record<string, any> = {};

    // Non-admin users only see media they uploaded
    if (req.user?.role !== "admin") {
      filter.uploadedBy = userId;
    }

    if (req.query.website) {
      const websiteId = typeof req.query.website === "string" ? req.query.website : String(req.query.website);
      if (req.user?.role !== "admin") {
        const targetWebsite = await Website.findOne({ _id: websiteId, owner: userId });
        if (!targetWebsite) {
          res.status(403).json({
            message: "You are not authorized to view media for this website",
          });
          return;
        }
      }
      filter.website = websiteId;
    }

    const media = await Media.find(filter)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Media fetched successfully",
      media,
    });
  } catch (error) {
    console.error("Get media error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMediaById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Missing authentication" });
      return;
    }

    const { id } = req.params;

    const media = await Media.findById(id)
      .populate("uploadedBy", "name email role");

    if (!media) {
      res.status(404).json({
        message: "Media not found",
      });
      return;
    }

    const uploaderId = media.uploadedBy
      ? ((media.uploadedBy as any)?._id
        ? (media.uploadedBy as any)._id.toString()
        : media.uploadedBy.toString())
      : null;

    if (req.user?.role !== "admin" && (!uploaderId || uploaderId !== userId)) {
      res.status(403).json({
        message: "You are not authorized to access this media asset",
      });
      return;
    }

    res.status(200).json({
      message: "Media fetched successfully",
      media,
    });
  } catch (error) {
    console.error("Get media by ID error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Missing authentication" });
      return;
    }

    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      res.status(404).json({
        message: "Media not found",
      });
      return;
    }

    const uploaderId = media.uploadedBy
      ? ((media.uploadedBy as any)?._id
        ? (media.uploadedBy as any)._id.toString()
        : media.uploadedBy.toString())
      : null;

    if (req.user?.role !== "admin" && (!uploaderId || uploaderId !== userId)) {
      res.status(403).json({
        message: "You are not authorized to delete this media asset",
      });
      return;
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      media.filename
    );

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete local media file:", err);
      }
    }

    await Media.findByIdAndDelete(id);

    res.status(200).json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};