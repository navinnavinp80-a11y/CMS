import { Router } from "express";
import {
  getPublicContentBySlug,
  getPublicPagesList,
} from "../controllers/contentController";

const router = Router();

// Public pages list for navigation / menu links
router.get("/pages/list", getPublicPagesList);

// Public root / home page
router.get("/", getPublicContentBySlug);

// Public page by slug
router.get("/:slug", getPublicContentBySlug);

export default router;
