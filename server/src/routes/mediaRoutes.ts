import { Router, Request, Response, NextFunction } from "express";
import upload from "../config/multer";
import {
  uploadMedia,
  getAllMedia,
  getMediaById,
  deleteMedia,
} from "../controllers/mediaController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ message: err.message || "File upload error" });
      return;
    }
    next();
  });
};

router.post("/upload", protect, handleUpload, uploadMedia);
router.get("/", protect, getAllMedia);
router.get("/:id", protect, getMediaById);
router.delete("/:id", protect, deleteMedia);

export default router;