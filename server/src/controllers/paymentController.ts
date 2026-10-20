import { Request, Response } from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment";
import { createPremiumOrder } from "../services/paymentService";

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
