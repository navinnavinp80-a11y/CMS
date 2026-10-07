"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "No token provided",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "Access denied. Admin only.",
        });
        return;
    }
    next();
};
exports.adminOnly = adminOnly;
