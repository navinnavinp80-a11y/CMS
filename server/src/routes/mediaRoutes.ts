import { Router } from "express";
import upload from "../config/multer";
import {
  uploadMedia,
  getAllMedia,getMediaById,
  deleteMedia,
} from "../controllers/mediaController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/upload", protect, upload.single("file"), uploadMedia);
router.get("/", protect, getAllMedia);
router.get("/:id", protect, getMediaById);
router.delete("/:id", protect, deleteMedia);

export default router;