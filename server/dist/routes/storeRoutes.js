"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const planMiddleware_1 = require("../middleware/planMiddleware");
const router = (0, express_1.Router)();
// Store CRUD routes
router.get("/", authMiddleware_1.protect, storeController_1.getStores);
router.post("/", authMiddleware_1.protect, planMiddleware_1.requireStoreCreationEntitlement, storeController_1.createStore);
router.get("/:id", authMiddleware_1.protect, storeController_1.getStoreById);
router.put("/:id", authMiddleware_1.protect, storeController_1.updateStore);
router.delete("/:id", authMiddleware_1.protect, storeController_1.deleteStore);
router.post("/:id/publish", authMiddleware_1.protect, storeController_1.publishStore);
// Backward compatibility routes
router.put("/", authMiddleware_1.protect, storeController_1.saveDraftStoreConfig);
router.post("/publish", authMiddleware_1.protect, storeController_1.publishStoreConfig);
exports.default = router;
