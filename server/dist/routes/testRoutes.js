"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/admin", authMiddleware_1.protect, authMiddleware_1.adminOnly, (req, res) => {
    res.json({
        message: "Welcome Admin",
        user: req.user,
    });
});
exports.default = router;
