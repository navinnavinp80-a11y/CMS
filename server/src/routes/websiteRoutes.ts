import { Router } from "express";
import {
  getWebsites,
  createWebsite,
  getWebsiteById,
  updateWebsite,
  deleteWebsite,
  getWebsitePages,
} from "../controllers/websiteController";
import { protect } from "../middleware/authMiddleware";
import { requireCreationEntitlement } from "../middleware/planMiddleware";

const router = Router();

router.get("/", protect, getWebsites);
router.post("/", protect, requireCreationEntitlement, createWebsite);
router.get("/:id", protect, getWebsiteById);
router.put("/:id", protect, updateWebsite);
router.delete("/:id", protect, deleteWebsite);
router.get("/:id/pages", protect, getWebsitePages);

export default router;
