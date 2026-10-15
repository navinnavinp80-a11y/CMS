import { Router } from "express";
import {
  getPublicStoreConfig,
  getPublicStoreConfigBySlug,
} from "../controllers/storeController";

const router = Router();

router.get("/:slug", getPublicStoreConfigBySlug);
router.get("/", getPublicStoreConfig);

export default router;
