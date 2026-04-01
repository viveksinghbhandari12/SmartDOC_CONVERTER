/**
 * Ensures the client-provided name is a bare filename we created (uuid + ext).
 */
export function isValidStoredFileName(name) {
  if (typeof name !== "string" || name.length > 200) return false;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(pdf|docx|jpg|jpeg|png|webp)$/i.test(
    name
  );
}

export function assertStoredFileName(name) {
  if (!isValidStoredFileName(name)) {
    const err = new Error("Invalid stored file reference");
    err.status = 400;
    err.code = "INVALID_STORED_NAME";
    throw err;
  }
}
