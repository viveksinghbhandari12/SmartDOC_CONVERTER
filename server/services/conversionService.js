import fs from "fs/promises";
import { createRequire } from "module";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import mammoth from "mammoth";
import sharp from "sharp";
import { Document, Packer, Paragraph, TextRun } from "docx";
import path from "path";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const FONT_SIZE = 11;
const MAX_LINE_CHARS = 95;

function wrapLines(text) {
  const lines = [];
  const paragraphs = text.split(/\r?\n/);
  for (const p of paragraphs) {
    if (!p.trim()) {
      lines.push("");
      continue;
    }
    let remaining = p;
    while (remaining.length > 0) {
      lines.push(remaining.slice(0, MAX_LINE_CHARS));
      remaining = remaining.slice(MAX_LINE_CHARS);
    }
  }
  return lines;
}

/**
 * PDF buffer → DOCX buffer
 */
export async function pdfToWordBuffer(pdfBuffer) {
  const data = await pdfParse(pdfBuffer);
  const raw = (data.text || "").trim() || "(No extractable text in this PDF)";
  const parts = raw.split(/\r?\n/).map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line || " " })],
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: parts.length ? parts : [new Paragraph({ children: [new TextRun(raw)] })],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * DOCX file path → PDF buffer
 */
export async function wordToPdfBufferFromPath(docxPath) {
  const buf = await fs.readFile(docxPath);
  const result = await mammoth.extractRawText({ buffer: buf });
  const text = (result.value || "").trim() || "(Empty document)";
  return textToPdfBuffer(text);
}

export async function textToPdfBuffer(text) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const lines = wrapLines(text);
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  const x = MARGIN;

  for (const line of lines) {
    if (y < MARGIN + LINE_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(line || " ", {
      x,
      y,
      size: FONT_SIZE,
      font,
      color: rgb(0, 0, 0),
      maxWidth: PAGE_WIDTH - 2 * MARGIN,
    });
    y -= LINE_HEIGHT;
  }

  return Buffer.from(await pdfDoc.save());
}

/**
 * One or more image buffers → single PDF
 */
export async function imagesToPdfBuffer(imageBuffers) {
  if (!imageBuffers.length) {
    throw Object.assign(new Error("No images provided"), {
      status: 400,
      code: "NO_IMAGES",
    });
  }

  const pdfDoc = await PDFDocument.create();

  for (const imgBuf of imageBuffers) {
    const png = await sharp(imgBuf).png().toBuffer();
    const image = await pdfDoc.embedPng(png);
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const maxW = PAGE_WIDTH - 2 * MARGIN;
    const maxH = PAGE_HEIGHT - 2 * MARGIN;
    const scale = Math.min(maxW / width, maxH / height, 1);
    const dw = width * scale;
    const dh = height * scale;
    const x = (PAGE_WIDTH - dw) / 2;
    const y = (PAGE_HEIGHT - dh) / 2;
    page.drawImage(image, { x, y, width: dw, height: dh });
  }

  return Buffer.from(await pdfDoc.save());
}

export function extensionForMime(mime) {
  switch (mime) {
    case "application/pdf":
      return ".pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return path.extname(mime) || "";
  }
}
