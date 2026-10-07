"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordVisit = void 0;
const Visit_1 = __importDefault(require("../models/Visit"));
const recordVisit = async (req, res) => {
    try {
        const { contentId } = req.body;
        const visit = await Visit_1.default.create({
            content: contentId || undefined,
            visitedAt: new Date(),
        });
        res.status(201).json({
            message: "Visit recorded successfully",
            visit,
        });
    }
    catch (error) {
        console.error("Record visit error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.recordVisit = recordVisit;
