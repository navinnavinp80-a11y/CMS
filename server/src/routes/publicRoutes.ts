import { Router } from "express";
import { getPublicContentBySlug } from "../controllers/contentController";

const router = Router();

router.get("/:slug", getPublicContentBySlug);

export default router;
