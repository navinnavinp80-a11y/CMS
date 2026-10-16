import { Router } from "express";
import { getUserPlan } from "../controllers/planController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getUserPlan);

export default router;
