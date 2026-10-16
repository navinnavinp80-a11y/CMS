"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentHistory = exports.verifyPayment = exports.createOrder = exports.getPaymentConfig = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Payment_1 = __importDefault(require("../models/Payment"));
const User_1 = __importDefault(require("../models/User"));
/**
 * GET /api/payments/config
 * Returns public payment configuration details (Razorpay Key ID, price, currency)
 * without exposing sensitive secrets.
 */
const getPaymentConfig = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID || null;
        const priceStr = process.env.PREMIUM_PLAN_PRICE;
        const durationStr = process.env.PREMIUM_PLAN_DURATION_DAYS;
        const currency = process.env.PREMIUM_PLAN_CURRENCY || "INR";
        const price = priceStr ? Number(priceStr) : null;
        const durationDays = durationStr ? Number(durationStr) : null;
        const isConfigured = Boolean(keyId &&
            process.env.RAZORPAY_KEY_SECRET &&
            price !== null &&
            !isNaN(price) &&
            price > 0 &&
            durationDays !== null &&
            !isNaN(durationDays) &&
            durationDays > 0);
        res.status(200).json({
            configured: isConfigured,
            keyId,
            price,
            currency,
            durationDays,
        });
    }
    catch (error) {
        console.error("Get payment config error:", error);
        res.status(500).json({ message: "Server error fetching payment config" });
    }
};
exports.getPaymentConfig = getPaymentConfig;
/**
 * POST /api/payments/create-order
 * Initiates a server-side Razorpay order.
 * Strictly uses configured environment variables. Does not invent prices.
 */
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            res.status(503).json({
                message: "Razorpay credentials are not configured on the server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
            });
            return;
        }
        const priceEnv = process.env.PREMIUM_PLAN_PRICE;
        if (!priceEnv) {
            res.status(503).json({
                message: "Premium subscription price is not configured on the server. Please configure PREMIUM_PLAN_PRICE.",
            });
            return;
        }
        const amount = Number(priceEnv);
        if (isNaN(amount) || amount <= 0) {
            res.status(503).json({
                message: "Configured subscription price is invalid. It must be a positive number.",
            });
            return;
        }
        const currency = (process.env.PREMIUM_PLAN_CURRENCY || "INR").toUpperCase();
        const receipt = `rcpt_${userId.slice(-6)}_${Date.now()}`;
        // Call Razorpay REST API to create the order
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
        const rzResponse = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // amount in paise / sub-units
                currency,
                receipt,
                notes: {
                    userId,
                    plan: "premium",
                },
            }),
        });
        const rzData = await rzResponse.json().catch(() => ({}));
        if (!rzResponse.ok) {
            console.error("Razorpay order creation failed:", rzData);
            res.status(502).json({
                message: rzData.error?.description ||
                    "Failed to create payment order with Razorpay payment gateway.",
            });
            return;
        }
        // Record the initiated order in database
        await Payment_1.default.create({
            user: userId,
            orderId: rzData.id,
            amount,
            currency,
            status: "created",
            plan: "premium",
        });
        res.status(201).json({
            message: "Payment order created successfully",
            orderId: rzData.id,
            amount,
            currency,
            keyId,
        });
    }
    catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ message: "Server error creating payment order" });
    }
};
exports.createOrder = createOrder;
/**
 * POST /api/payments/verify
 * Cryptographically verifies Razorpay payment signatures on the backend.
 * Activates Premium only upon verified payment and valid configured duration.
 * Never trusts client-provided plan values directly.
 */
const verifyPayment = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({
                message: "Missing required payment verification parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
            });
            return;
        }
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            res.status(503).json({
                message: "Razorpay payment gateway secret is not configured on the server. Please configure RAZORPAY_KEY_SECRET.",
            });
            return;
        }
        // Verify HMAC-SHA256 signature
        const expectedSignature = crypto_1.default
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            // Record failed payment attempt
            await Payment_1.default.findOneAndUpdate({ orderId: razorpay_order_id }, {
                status: "failed",
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
            });
            res.status(400).json({
                message: "Payment signature verification failed. Premium plan was not activated.",
            });
            return;
        }
        // Prevent duplicate payment / replay attacks
        const existingPaid = await Payment_1.default.findOne({
            paymentId: razorpay_payment_id,
            status: "paid",
        });
        if (existingPaid) {
            res.status(400).json({
                message: "This payment has already been verified and processed.",
            });
            return;
        }
        // Validate configured subscription duration (do not invent durations)
        const durationEnv = process.env.PREMIUM_PLAN_DURATION_DAYS;
        if (!durationEnv) {
            res.status(503).json({
                message: "Subscription duration is not configured on the server. Premium cannot be activated with invented duration values. Please configure PREMIUM_PLAN_DURATION_DAYS.",
            });
            return;
        }
        const durationDays = parseInt(durationEnv, 10);
        if (isNaN(durationDays) || durationDays <= 0) {
            res.status(503).json({
                message: "Configured subscription duration is invalid.",
            });
            return;
        }
        const now = new Date();
        const premiumExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
        // Update or create payment record
        let payment = await Payment_1.default.findOne({ orderId: razorpay_order_id });
        if (payment) {
            payment.status = "paid";
            payment.paymentId = razorpay_payment_id;
            payment.signature = razorpay_signature;
            payment.durationDays = durationDays;
            await payment.save();
        }
        else {
            payment = await Payment_1.default.create({
                user: userId,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount: Number(process.env.PREMIUM_PLAN_PRICE) || 0,
                currency: process.env.PREMIUM_PLAN_CURRENCY || "INR",
                status: "paid",
                plan: "premium",
                durationDays,
            });
        }
        // Server-side upgrade of user plan
        await User_1.default.findByIdAndUpdate(userId, {
            plan: "premium",
            premiumExpiresAt,
        });
        res.status(200).json({
            message: "Payment verified successfully. Premium plan activated.",
            plan: "premium",
            premiumExpiresAt,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });
    }
    catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({ message: "Server error verifying payment" });
    }
};
exports.verifyPayment = verifyPayment;
/**
 * GET /api/payments/history
 * Returns the payment transaction records for the authenticated user.
 */
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing authentication" });
            return;
        }
        const payments = await Payment_1.default.find({ user: userId })
            .select("orderId paymentId amount currency status plan durationDays createdAt")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Payment history fetched successfully",
            payments,
        });
    }
    catch (error) {
        console.error("Get payment history error:", error);
        res.status(500).json({ message: "Server error fetching payment history" });
    }
};
exports.getPaymentHistory = getPaymentHistory;
