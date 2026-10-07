import { Router } from "express";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/admin",
  protect,
  adminOnly,
  (req, res) => {
    res.json({
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

export default router;