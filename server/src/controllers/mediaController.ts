import { Request, Response } from "express";
import Media from "../models/Media";
import fs from "fs";
import path from "path";

export const uploadMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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

    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      type: fileType,
      uploadedBy: req.user?.id,
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
    const media = await Media.find()
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
    const { id } = req.params;

    const media = await Media.findById(id)
      .populate("uploadedBy", "name email role");

    if (!media) {
      res.status(404).json({
        message: "Media not found",
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
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      res.status(404).json({
        message: "Media not found",
      });
      return;
    }

    const uploaderId = media.uploadedBy?.toString();
    if (uploaderId && uploaderId !== req.user?.id && req.user?.role !== "admin") {
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
      fs.unlinkSync(filePath);
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