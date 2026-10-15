"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contentController_1 = require("../controllers/contentController");
const router = (0, express_1.Router)();
// Public pages list for navigation / menu links
router.get("/pages/list", contentController_1.getPublicPagesList);
// Public root / home page
router.get("/", contentController_1.getPublicContentBySlug);
// Public page by slug
router.get("/:slug", contentController_1.getPublicContentBySlug);
exports.default = router;
