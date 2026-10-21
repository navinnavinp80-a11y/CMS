"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPremiumOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
if (!keyId || !keySecret) {
    console.warn("Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined in environment variables.");
}
// Single initialized Razorpay SDK client instance
const razorpay = new razorpay_1.default({
    key_id: keyId || "",
    key_secret: keySecret || "",
});
/**
 * Creates a Razorpay order for Premium plan subscription.
 *
 * @param userId - ID of the authenticated user
 * @returns { orderId, amount, currency, keyId }
 */
const createPremiumOrder = async (userId) => {
    const currentKeyId = process.env.RAZORPAY_KEY_ID;
    const currentKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!currentKeyId || !currentKeySecret) {
        throw new Error("Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment.");
    }
    // Parse amount in paise from process.env.PREMIUM_MONTHLY_PRICE_PAISE
    const rawPrice = process.env.PREMIUM_MONTHLY_PRICE_PAISE;
    let amount = 39900; // default 39900 paise (₹399)
    if (rawPrice) {
        const parsed = Number(rawPrice);
        if (isNaN(parsed) || parsed <= 0) {
            throw new Error("Invalid subscription price configuration. PREMIUM_MONTHLY_PRICE_PAISE must be a positive number.");
        }
        // If configured as 399 (rupees intended), normalize to 39900 paise; otherwise use as-is
        amount = parsed < 1000 ? parsed * 100 : parsed;
    }
    const currency = (process.env.PREMIUM_CURRENCY || process.env.PREMIUM_PLAN_CURRENCY || "INR").toUpperCase();
    const receipt = `rcpt_${Date.now()}_${userId.slice(-6)}`;
    // Create order via Razorpay SDK instance
    const razorpayOrder = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes: {
            userId,
            plan: "premium",
        },
    });
    return {
        orderId: razorpayOrder.id,
        amount,
        currency,
        keyId: currentKeyId,
    };
};
exports.createPremiumOrder = createPremiumOrder;
exports.default = razorpay;
