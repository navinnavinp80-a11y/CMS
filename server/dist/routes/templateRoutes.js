"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const templateController_1 = require("../controllers/templateController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.protect, templateController_1.getTemplates);
router.post("/validate", authMiddleware_1.protect, templateController_1.validateTemplateAccess);
exports.default = router;
