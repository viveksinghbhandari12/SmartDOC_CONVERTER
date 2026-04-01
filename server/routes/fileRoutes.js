import { Router } from "express";
import * as fileController from "../controllers/fileController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

export function createFileRouter(upload) {
  const router = Router();
  router.post(
    "/",
    authenticateToken,
    upload.single("file"),
    fileController.uploadFile
  );
  return router;
}
