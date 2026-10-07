import { Router } from "express";
import { recordVisit } from "../controllers/visitController";

const router = Router();

router.post("/", recordVisit);

export default router;