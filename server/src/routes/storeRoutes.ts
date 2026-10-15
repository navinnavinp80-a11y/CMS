import { Router } from "express";
import {
  getStores,
  createStore,
  getStoreById,
  updateStore,
  deleteStore,
  publishStore,
  saveDraftStoreConfig,
  publishStoreConfig,
} from "../controllers/storeController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Store CRUD routes
router.get("/", protect, getStores);
router.post("/", protect, createStore);
router.get("/:id", protect, getStoreById);
router.put("/:id", protect, updateStore);
router.delete("/:id", protect, deleteStore);
router.post("/:id/publish", protect, publishStore);

// Backward compatibility routes
router.put("/", protect, saveDraftStoreConfig);
router.post("/publish", protect, publishStoreConfig);

export default router;
