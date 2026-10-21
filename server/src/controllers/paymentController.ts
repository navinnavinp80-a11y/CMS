import { Request, Response } from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment";
import { createPremiumOrder } from "../services/paymentService";
import crypto from "crypto";
import User from "../models/User";

export const createPremiumPaymentOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as Request & {
      user?: { id?: string; _id?: string };
    }).user;

    const authenticatedUserId = req.user?.id;

    if (
      !authenticatedUserId ||
      !mongoose.isValidObjectId(authenticatedUserId)
    ) {
      res.status(401).json({
        success: false,
        message: "Please log in to upgrade to Premium.",
      });
      return;
    }

    const order = await createPremiumOrder(authenticatedUserId);

    await Payment.create({
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
  } catch (error) {
    console.error("Create Premium order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order. Please try again.",
    });
  }
};


export const verifyPremiumPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      res.status(401).json({
        success: false,
        message: "Please log in first.",
      });
      return;
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
      return;
    }

    const payment = await Payment.findOne({
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

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
      return;
    }


    const razorpay = (await import("../services/paymentService")).default;
    const razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      razorpayPayment.amount !== payment.amount ||
      razorpayPayment.currency !== payment.currency
    ) {
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
    const user = await User.findById(userId);

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

    const startsFrom =
      user.plan === "premium" && currentExpiry > now
        ? currentExpiry
        : now;

    const expiresAt = new Date(
      startsFrom.getTime() + 30 * 24 * 60 * 60 * 1000
    );

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
  } catch (error) {
    console.error("Verify Premium payment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify payment. Please contact support if charged.",
    });
  }
};