import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/summarize", authenticateToken, aiController.summarize);
router.post("/grammar-fix", authenticateToken, aiController.grammarFix);
router.post("/translate", authenticateToken, aiController.translate);

export default router;
