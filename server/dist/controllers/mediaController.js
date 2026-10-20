"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedia = exports.getMediaById = exports.getAllMedia = exports.uploadMedia = void 0;
const Media_1 = __importDefault(require("../models/Media"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uploadMedia = async (req, res) => {
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
        const media = await Media_1.default.create({
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
    }
    catch (error) {
        console.error("Media upload error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.uploadMedia = uploadMedia;
const getAllMedia = async (req, res) => {
    try {
        const media = await Media_1.default.find()
            .populate("uploadedBy", "name email role")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Media fetched successfully",
            media,
        });
    }
    catch (error) {
        console.error("Get media error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getAllMedia = getAllMedia;
const getMediaById = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await Media_1.default.findById(id)
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
    }
    catch (error) {
        console.error("Get media by ID error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.getMediaById = getMediaById;
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const media = await Media_1.default.findById(id);
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
        const filePath = path_1.default.join(process.cwd(), "uploads", media.filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await Media_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: "Media deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete media error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.deleteMedia = deleteMedia;
