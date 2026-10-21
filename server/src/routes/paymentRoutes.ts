
import { Router } from "express";
import {
  createPremiumPaymentOrder,
  verifyPremiumPayment,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/create-order", protect, createPremiumPaymentOrder);

router.post("/verify", protect, verifyPremiumPayment);

export default router;
