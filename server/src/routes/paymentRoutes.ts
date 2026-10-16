import { Router } from "express";
import {
  getPaymentConfig,
  createOrder,
  verifyPayment,
  getPaymentHistory,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/config", getPaymentConfig);
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getPaymentHistory);

export default router;
