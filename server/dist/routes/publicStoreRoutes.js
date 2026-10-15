"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const router = (0, express_1.Router)();
router.get("/:slug", storeController_1.getPublicStoreConfigBySlug);
router.get("/", storeController_1.getPublicStoreConfig);
exports.default = router;
