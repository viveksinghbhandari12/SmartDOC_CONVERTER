/**
 * Map infrastructure / DB errors to safe HTTP responses (works in production too).
 */
export function interpretInfrastructureError(err) {
  if (!err) return null;

  const m = String(err.message || "");

  if (m.includes("JWT_SECRET") && m.includes("not configured")) {
    return {
      status: 500,
      message:
        "Server misconfiguration: set JWT_SECRET in server/.env and restart the API.",
      code: "SERVER_CONFIG",
    };
  }

  const c = err.code;

  if (c === "ER_DUP_ENTRY") {
    return {
      status: 409,
      message: "This email is already registered.",
      code: "EMAIL_EXISTS",
    };
  }

  if (c === "ECONNREFUSED" || c === "ETIMEDOUT") {
    return {
      status: 503,
      message:
        "Cannot reach MySQL. Check that the database is running and DB_HOST / DB_PORT in .env are correct.",
      code: "DB_CONNECTION",
    };
  }

  if (c === "ER_ACCESS_DENIED_ERROR" || c === "ER_DBACCESS_DENIED_ERROR") {
    return {
      status: 503,
      message:
        "Database access denied. Check DB_USER, DB_PASSWORD, and that the user can use the database in DB_NAME.",
      code: "DB_ACCESS",
    };
  }

  if (c === "ER_BAD_DB_ERROR") {
    return {
      status: 503,
      message:
        "Database does not exist. Create it (see server/database/init.sql) or fix DB_NAME in .env.",
      code: "DB_MISSING",
    };
  }

  if (c === "ER_NO_SUCH_TABLE") {
    return {
      status: 503,
      message:
        'Missing database table. Run server/database/init.sql or ensure the API can run CREATE TABLE (see config/db.js).',
      code: "DB_SCHEMA",
    };
  }

  return null;
}
