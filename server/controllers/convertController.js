import fs from "fs/promises";
import path from "path";
import { assertStoredFileName } from "../utils/validateStoredFileName.js";
import {
  pdfToWordBuffer,
  wordToPdfBufferFromPath,
  imagesToPdfBuffer,
} from "../services/conversionService.js";
import { safeUnlink, safeUnlinkMany } from "../services/fileCleanup.js";
import { resolveUploadPath } from "./fileController.js";

/**
 * RFC 5987: ASCII fallback + UTF-8 filename* (encodeURIComponent in filename= breaks many browsers).
 */
function buildContentDisposition(downloadName) {
  const base =
    String(downloadName || "download").split(/[/\\]/).pop() || "download";
  const safeAscii = base
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_")
    .slice(0, 180);
  const star = encodeURIComponent(base);
  return `attachment; filename="${safeAscii}"; filename*=UTF-8''${star}`;
}

function sendBufferDownload(res, buffer, downloadName, mime) {
  res.setHeader("Content-Type", mime || "application/octet-stream");
  res.setHeader("Content-Disposition", buildContentDisposition(downloadName));
  res.send(buffer);
}

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function assertImageStoredName(name) {
  if (!IMAGE_EXT.test(name)) {
    const err = new Error("Stored file must be an image (jpg, png, webp)");
    err.status = 400;
    err.code = "INVALID_TYPE";
    throw err;
  }
}

export async function convertPdfToWord(req, res, next) {
  const tempPaths = [];
  try {
    let pdfPath;
    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({
          success: false,
          error: "A PDF file is required",
          code: "INVALID_TYPE",
        });
      }
      pdfPath = req.file.path;
      tempPaths.push(pdfPath);
    } else if (req.body?.storedName) {
      assertStoredFileName(req.body.storedName);
      if (!req.body.storedName.toLowerCase().endsWith(".pdf")) {
        return res.status(400).json({
          success: false,
          error: "Stored file must be a PDF",
          code: "INVALID_TYPE",
        });
      }
      pdfPath = resolveUploadPath(req.app.locals.uploadRoot, req.body.storedName);
    } else {
      return res.status(400).json({
        success: false,
        error: "Provide a PDF file or storedName from a prior upload",
        code: "NO_INPUT",
      });
    }

    const pdfBuffer = await fs.readFile(pdfPath);
    const docxBuffer = await pdfToWordBuffer(pdfBuffer);
    const base =
      path.basename(pdfPath, path.extname(pdfPath)) || "document";
    sendBufferDownload(res, docxBuffer, `${base}.docx`, docxMime());
  } catch (e) {
    next(e);
  } finally {
    await safeUnlinkMany(tempPaths);
  }
}

export async function convertWordToPdf(req, res, next) {
  const tempPaths = [];
  try {
    let docxPath;
    if (req.file) {
      if (
        req.file.mimetype !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return res.status(400).json({
          success: false,
          error: "A DOCX file is required",
          code: "INVALID_TYPE",
        });
      }
      docxPath = req.file.path;
      tempPaths.push(docxPath);
    } else if (req.body?.storedName) {
      assertStoredFileName(req.body.storedName);
      if (!req.body.storedName.toLowerCase().endsWith(".docx")) {
        return res.status(400).json({
          success: false,
          error: "Stored file must be a DOCX",
          code: "INVALID_TYPE",
        });
      }
      docxPath = resolveUploadPath(
        req.app.locals.uploadRoot,
        req.body.storedName
      );
    } else {
      return res.status(400).json({
        success: false,
        error: "Provide a DOCX file or storedName",
        code: "NO_INPUT",
      });
    }

    const pdfBuffer = await wordToPdfBufferFromPath(docxPath);
    const base =
      path.basename(docxPath, path.extname(docxPath)) || "document";
    sendBufferDownload(res, pdfBuffer, `${base}.pdf`, "application/pdf");
  } catch (e) {
    next(e);
  } finally {
    await safeUnlinkMany(tempPaths);
  }
}

export async function convertImageToPdf(req, res, next) {
  const tempPaths = [];
  try {
    const buffers = [];

    if (req.files?.length) {
      for (const f of req.files) {
        if (!f.mimetype?.startsWith("image/")) {
          return res.status(400).json({
            success: false,
            error: "Each uploaded part must be an image",
            code: "INVALID_TYPE",
          });
        }
        tempPaths.push(f.path);
        buffers.push(await fs.readFile(f.path));
      }
    } else if (Array.isArray(req.body?.storedNames)) {
      for (const name of req.body.storedNames) {
        assertStoredFileName(name);
        assertImageStoredName(name);
        const p = resolveUploadPath(req.app.locals.uploadRoot, name);
        buffers.push(await fs.readFile(p));
      }
    } else {
      return res.status(400).json({
        success: false,
        error:
          "Provide image files (field: images) or storedNames array from uploads",
        code: "NO_INPUT",
      });
    }

    if (!buffers.length) {
      return res.status(400).json({
        success: false,
        error: "No images to convert",
        code: "NO_IMAGES",
      });
    }

    const pdfBuffer = await imagesToPdfBuffer(buffers);
    sendBufferDownload(res, pdfBuffer, "images.pdf", "application/pdf");
  } catch (e) {
    next(e);
  } finally {
    await safeUnlinkMany(tempPaths);
  }
}

function docxMime() {
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
