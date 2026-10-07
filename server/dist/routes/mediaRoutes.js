"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("../config/multer"));
const mediaController_1 = require("../controllers/mediaController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/upload", authMiddleware_1.protect, multer_1.default.single("file"), mediaController_1.uploadMedia);
router.get("/", authMiddleware_1.protect, mediaController_1.getAllMedia);
router.get("/:id", authMiddleware_1.protect, mediaController_1.getMediaById);
router.delete("/:id", authMiddleware_1.protect, mediaController_1.deleteMedia);
exports.default = router;
