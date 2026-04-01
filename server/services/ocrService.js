import Tesseract from "tesseract.js";

/**
 * Extract text from an image buffer (for AI pipelines).
 */
export async function ocrImageBuffer(buffer, lang = "eng+hin") {
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, lang, {
    logger: () => {},
  });
  return (text || "").trim();
}
