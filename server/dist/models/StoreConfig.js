"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const sectionSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    settings: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { _id: false });
const themeSchema = new mongoose_1.Schema({
    primaryColor: { type: String, default: "#202223" },
    secondaryColor: { type: String, default: "#4f46e5" },
    backgroundColor: { type: String, default: "#ffffff" },
    fontFamily: { type: String, default: "Inter, sans-serif" },
    buttonStyle: {
        type: String,
        enum: ["square", "rounded", "pill"],
        default: "rounded",
    },
    contentWidth: {
        type: String,
        enum: ["compact", "normal", "full"],
        default: "normal",
    },
    sectionSpacing: {
        type: String,
        enum: ["compact", "normal", "spacious"],
        default: "normal",
    },
}, { _id: false });
const storeConfigSchema = new mongoose_1.Schema({
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    name: {
        type: String,
        trim: true,
    },
    storeName: {
        type: String,
        required: true,
        default: "My Store",
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    sections: {
        type: [sectionSchema],
        default: [],
    },
    theme: {
        type: themeSchema,
        default: () => ({}),
    },
    publishedVersion: {
        storeName: { type: String },
        sections: { type: [sectionSchema] },
        theme: { type: themeSchema },
        publishedAt: { type: Date },
    },
}, {
    timestamps: true,
});
storeConfigSchema.pre("validate", function () {
    if (this.name && !this.storeName) {
        this.storeName = this.name;
    }
    if (this.storeName && !this.name) {
        this.name = this.storeName;
    }
    if (!this.slug && (this.storeName || this.name)) {
        const raw = this.storeName || this.name || "store";
        this.slug = raw
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});
const StoreConfig = mongoose_1.default.model("StoreConfig", storeConfigSchema);
exports.default = StoreConfig;
