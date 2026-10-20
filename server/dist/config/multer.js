"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// Sanitize filename to ensure safe filesystem storage and valid URLs
const sanitizeFilename = (originalName) => {
    const ext = path_1.default.extname(originalName).toLowerCase();
    const nameWithoutExt = path_1.default.basename(originalName, ext);
    const cleanName = nameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${cleanName || "asset"}${ext}`;
};
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const clean = sanitizeFilename(file.originalname);
        const uniqueName = `${Date.now()}-${clean}`;
        cb(null, uniqueName);
    },
});
const allowedMimeTypes = new Set([
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    // Videos
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
]);
const fileFilter = (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype.toLowerCase())) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image and video files are allowed"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB max file size
    },
    fileFilter,
});
exports.default = upload;
