import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/stats", protect, getDashboardStats);

export default router;