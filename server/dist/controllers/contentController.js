"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContent = exports.updateContent = exports.getContentById = exports.getAllContent = exports.createContent = void 0;
const Content_1 = __importDefault(require("../models/Content"));
const createContent = async (req, res) => {
    try {
        const { title, slug, content, type, status } = req.body;
        if (!title || !slug || !content || !type) {
            res.status(400).json({
                message: "Title, slug and content are required",
            });
            return;
        }
        const existingContent = await Content_1.default.findOne({ slug });
        if (existingContent) {
            res.status(400).json({
                message: "Slug already exists",
            });
            return;
        }
        const newContent = await Content_1.default.create({
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
        const contents = await Content_1.default.find()
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
        const { id } = req.params;
        const content = await Content_1.default.findById(id)
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
        const { id } = req.params;
        const { title, slug, content, type, status } = req.body;
        const existingContent = await Content_1.default.findById(id);
        if (!existingContent) {
            res.status(404).json({
                message: "Content not found",
            });
            return;
        }
        if (slug && slug !== existingContent.slug) {
            const slugExists = await Content_1.default.findOne({
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
        const { id } = req.params;
        const content = await Content_1.default.findByIdAndDelete(id);
        if (!content) {
            res.status(404).json({
                message: "Content not found",
            });
            return;
        }
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
