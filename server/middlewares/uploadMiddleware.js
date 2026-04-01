import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const allowedMime = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function ensureUploadDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function createUploadMiddleware(uploadRoot) {
  ensureUploadDir(uploadRoot);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadRoot);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      if (allowedMime.has(file.mimetype)) {
        return cb(null, true);
      }
      const err = new Error(
        "Invalid file type. Allowed: PDF, DOCX, JPG, PNG, WEBP"
      );
      err.status = 400;
      err.code = "INVALID_FILE_TYPE";
      cb(err);
    },
  });
}

export const MAX_FILE_SIZE_BYTES = MAX_SIZE;
