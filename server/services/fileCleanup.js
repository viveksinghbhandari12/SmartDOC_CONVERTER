import fs from "fs/promises";

/**
 * Best-effort delete; ignores missing files.
 */
export async function safeUnlink(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (e) {
    if (e.code !== "ENOENT") {
      console.warn("safeUnlink failed:", filePath, e.message);
    }
  }
}

export async function safeUnlinkMany(paths) {
  await Promise.all(paths.filter(Boolean).map(safeUnlink));
}
