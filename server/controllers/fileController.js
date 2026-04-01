import path from "path";
import { safeUnlink } from "../services/fileCleanup.js";

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
        code: "NO_FILE",
      });
    }

    res.status(201).json({
      success: true,
      data: {
        storedName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (e) {
    if (req.file?.path) await safeUnlink(req.file.path);
    next(e);
  }
}

/**
 * Resolve absolute path for a stored upload filename (must be validated).
 */
export function resolveUploadPath(uploadRoot, storedName) {
  return path.join(uploadRoot, path.basename(storedName));
}
