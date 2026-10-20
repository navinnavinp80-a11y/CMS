import { Router } from "express";
import { getTemplates, validateTemplateAccess } from "../controllers/templateController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", protect, getTemplates);
router.post("/validate", protect, validateTemplateAccess);

export default router;
