import { Router } from "express";
import * as convertController from "../controllers/convertController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

function multipartSingle(upload, field = "file") {
  return (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      return upload.single(field)(req, res, (err) => {
        if (err) return next(err);
        next();
      });
    }
    next();
  };
}

function multipartArray(upload, field = "images", max = 20) {
  return (req, res, next) => {
    const ct = req.headers["content-type"] || "";
    if (ct.includes("multipart/form-data")) {
      return upload.array(field, max)(req, res, (err) => {
        if (err) return next(err);
        next();
      });
    }
    next();
  };
}

export function createConvertRouter(upload) {
  const router = Router();

  router.post(
    "/pdf-to-word",
    authenticateToken,
    multipartSingle(upload, "file"),
    convertController.convertPdfToWord
  );

  router.post(
    "/word-to-pdf",
    authenticateToken,
    multipartSingle(upload, "file"),
    convertController.convertWordToPdf
  );

  router.post(
    "/image-to-pdf",
    authenticateToken,
    multipartArray(upload, "images", 20),
    convertController.convertImageToPdf
  );

  return router;
}
