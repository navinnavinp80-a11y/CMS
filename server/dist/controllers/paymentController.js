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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPremiumPayment = exports.createPremiumPaymentOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Payment_1 = __importDefault(require("../models/Payment"));
const paymentService_1 = require("../services/paymentService");
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const createPremiumPaymentOrder = async (req, res) => {
    try {
        const userId = req.user;
        const authenticatedUserId = req.user?.id;
        if (!authenticatedUserId ||
            !mongoose_1.default.isValidObjectId(authenticatedUserId)) {
            res.status(401).json({
                success: false,
                message: "Please log in to upgrade to Premium.",
            });
            return;
        }
        const order = await (0, paymentService_1.createPremiumOrder)(authenticatedUserId);
        await Payment_1.default.create({
            user: authenticatedUserId,
            razorpayOrderId: order.orderId,
            amount: Number(order.amount),
            currency: order.currency,
            status: "created",
            plan: "premium",
        });
        res.status(201).json({
            success: true,
            message: "Payment order created successfully.",
            data: order,
        });
    }
    catch (error) {
        console.error("Create Premium order error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create payment order. Please try again.",
        });
    }
};
exports.createPremiumPaymentOrder = createPremiumPaymentOrder;
const verifyPremiumPayment = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId || !mongoose_1.default.isValidObjectId(userId)) {
            res.status(401).json({
                success: false,
                message: "Please log in first.",
            });
            return;
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
        if (typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string") {
            res.status(400).json({
                success: false,
                message: "Missing payment verification details.",
            });
            return;
        }
        const payment = await Payment_1.default.findOne({
            razorpayOrderId: razorpay_order_id,
            user: userId,
        });
        if (!payment) {
            res.status(404).json({
                success: false,
                message: "Payment order not found.",
            });
            return;
        }
        if (payment.status === "paid") {
            res.status(409).json({
                success: false,
                message: "This payment has already been processed.",
            });
            return;
        }
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            res.status(500).json({
                success: false,
                message: "Payment verification is not configured.",
            });
            return;
        }
        const expectedSignature = crypto_1.default
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        const received = Buffer.from(razorpay_signature, "hex");
        const expected = Buffer.from(expectedSignature, "hex");
        if (received.length !== expected.length ||
            !crypto_1.default.timingSafeEqual(received, expected)) {
            res.status(400).json({
                success: false,
                message: "Invalid payment signature.",
            });
            return;
        }
        const razorpay = (await Promise.resolve().then(() => __importStar(require("../services/paymentService")))).default;
        const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
        if (razorpayPayment.order_id !== razorpay_order_id ||
            razorpayPayment.status !== "captured" ||
            razorpayPayment.amount !== payment.amount ||
            razorpayPayment.currency !== payment.currency) {
            res.status(400).json({
                success: false,
                message: "Payment is not captured or the payment details do not match.",
            });
            return;
        }
        // Update the payment record only after server-side verification.
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "paid";
        payment.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await payment.save();
        // Extend an existing active Premium plan; otherwise start from now.
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        const now = new Date();
        const currentExpiry = user.premiumExpiresAt
            ? new Date(user.premiumExpiresAt)
            : now;
        const startsFrom = user.plan === "premium" && currentExpiry > now
            ? currentExpiry
            : now;
        const expiresAt = new Date(startsFrom.getTime() + 30 * 24 * 60 * 60 * 1000);
        user.plan = "premium";
        user.premiumExpiresAt = expiresAt;
        await user.save();
        payment.premiumExpiresAt = expiresAt;
        await payment.save();
        res.status(200).json({
            success: true,
            message: "Premium activated successfully.",
            data: {
                plan: user.plan,
                premiumExpiresAt: user.premiumExpiresAt,
            },
        });
    }
    catch (error) {
        console.error("Verify Premium payment error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to verify payment. Please contact support if charged.",
        });
    }
};
exports.verifyPremiumPayment = verifyPremiumPayment;
