import { Router } from "express";
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
} from "../controllers/contentController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, createContent);
router.get("/", protect, getAllContent);
router.get("/:id", protect, getContentById);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);

export default router;