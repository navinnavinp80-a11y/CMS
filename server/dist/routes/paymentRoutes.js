"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/create-order", authMiddleware_1.protect, paymentController_1.createPremiumPaymentOrder);
router.post("/verify", authMiddleware_1.protect, paymentController_1.verifyPremiumPayment);
exports.default = router;
