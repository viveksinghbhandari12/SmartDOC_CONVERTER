import { interpretInfrastructureError } from "../utils/interpretInfrastructureError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: "Not found",
    code: "NOT_FOUND",
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const mapped = interpretInfrastructureError(err);
  if (mapped) {
    console.error(err);
    return res.status(mapped.status).json({
      success: false,
      error: mapped.message,
      code: mapped.code,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  console.error(err);

  res.status(status).json({
    success: false,
    error: message,
    code: err.code || "INTERNAL_ERROR",
  });
}
