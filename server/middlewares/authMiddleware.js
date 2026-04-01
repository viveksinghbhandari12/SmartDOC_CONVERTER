import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "NO_TOKEN",
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
        code: "SERVER_CONFIG",
      });
    }
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
}
