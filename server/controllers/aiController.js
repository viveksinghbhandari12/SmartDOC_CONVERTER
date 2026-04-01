import fs from "fs/promises";
import { createRequire } from "module";
import mammoth from "mammoth";
import {
  summarizeText,
  grammarFixText,
  translateText,
} from "../services/aiService.js";
import { ocrImageBuffer } from "../services/ocrService.js";
import { assertStoredFileName } from "../utils/validateStoredFileName.js";
import { resolveUploadPath } from "./fileController.js";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

async function extractTextFromUpload(uploadRoot, storedName, mimeType) {
  assertStoredFileName(storedName);
  const full = resolveUploadPath(uploadRoot, storedName);
  const buf = await fs.readFile(full);

  if (mimeType === "application/pdf" || storedName.toLowerCase().endsWith(".pdf")) {
    const data = await pdfParse(buf);
    return (data.text || "").trim();
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    storedName.toLowerCase().endsWith(".docx")
  ) {
    const r = await mammoth.extractRawText({ buffer: buf });
    return (r.value || "").trim();
  }

  if (
    mimeType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp)$/i.test(storedName)
  ) {
    return ocrImageBuffer(buf);
  }

  throw Object.assign(new Error("Unsupported file type for text extraction"), {
    status: 400,
    code: "UNSUPPORTED_EXTRACT",
  });
}

export async function summarize(req, res, next) {
  try {
    let text = (req.body?.text || "").trim();

    if (!text && req.body?.storedName) {
      text = await extractTextFromUpload(
        req.app.locals.uploadRoot,
        req.body.storedName,
        req.body.mimeType
      );
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Provide text or storedName (+ mimeType) of an uploaded file",
        code: "NO_TEXT",
      });
    }

    const summary = await summarizeText(text);
    res.json({ success: true, data: { summary } });
  } catch (e) {
    next(e);
  }
}

export async function grammarFix(req, res, next) {
  try {
    let text = (req.body?.text || "").trim();

    if (!text && req.body?.storedName) {
      text = await extractTextFromUpload(
        req.app.locals.uploadRoot,
        req.body.storedName,
        req.body.mimeType
      );
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Provide text or storedName (+ mimeType)",
        code: "NO_TEXT",
      });
    }

    const improved = await grammarFixText(text);
    res.json({ success: true, data: { text: improved } });
  } catch (e) {
    next(e);
  }
}

export async function translate(req, res, next) {
  try {
    const direction = req.body?.direction;
    if (direction !== "hi-en" && direction !== "en-hi") {
      return res.status(400).json({
        success: false,
        error: 'direction must be "hi-en" or "en-hi"',
        code: "INVALID_DIRECTION",
      });
    }

    let text = (req.body?.text || "").trim();

    if (!text && req.body?.storedName) {
      text = await extractTextFromUpload(
        req.app.locals.uploadRoot,
        req.body.storedName,
        req.body.mimeType
      );
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Provide text or storedName (+ mimeType)",
        code: "NO_TEXT",
      });
    }

    const translated = await translateText(text, direction);
    res.json({ success: true, data: { text: translated } });
  } catch (e) {
    next(e);
  }
}
