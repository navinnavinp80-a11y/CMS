"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitController_1 = require("../controllers/visitController");
const router = (0, express_1.Router)();
router.post("/", visitController_1.recordVisit);
exports.default = router;
