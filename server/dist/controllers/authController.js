"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const entitlementService_1 = require("../services/entitlementService");
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check required fields
        if (!name || !email || !password) {
            res.status(400).json({
                message: "Name, email and password are required",
            });
            return;
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                message: "User already exists",
            });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user (strictly default to editor role for public registration)
        const user = await User_1.default.create({
            name,
            email,
            password: hashedPassword,
            role: "editor",
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan || "free",
                premiumExpiresAt: user.premiumExpiresAt || null,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: "Email and password are required",
            });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        const isPremium = (0, entitlementService_1.isUserPremiumActive)(user);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: isPremium ? "premium" : "free",
                premiumExpiresAt: user.premiumExpiresAt || null,
                isPremium,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};
exports.loginUser = loginUser;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                message: "Unauthorized: Missing authentication",
            });
            return;
        }
        const user = await User_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const isPremium = (0, entitlementService_1.isUserPremiumActive)(user);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: isPremium ? "premium" : "free",
                premiumExpiresAt: user.premiumExpiresAt || null,
                isPremium,
            },
        });
    }
    catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({
            message: "Server error fetching user profile",
        });
    }
};
exports.getMe = getMe;
