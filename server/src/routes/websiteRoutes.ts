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
import { requireWebsiteCreationEntitlement } from "../middleware/planMiddleware";

const router = Router();

router.get("/", protect, getWebsites);
router.post("/", protect, requireWebsiteCreationEntitlement, createWebsite);
router.get("/:id", protect, getWebsiteById);
router.put("/:id", protect, updateWebsite);
router.delete("/:id", protect, deleteWebsite);
router.get("/:id/pages", protect, getWebsitePages);

export default router;
