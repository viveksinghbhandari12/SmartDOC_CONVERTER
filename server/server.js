import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { initDb } from "./config/db.js";
import { createUploadMiddleware } from "./middlewares/uploadMiddleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import { createFileRouter } from "./routes/fileRoutes.js";
import { createConvertRouter } from "./routes/convertRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET?.trim()) {
  console.error(
    "FATAL: JWT_SECRET is missing. Add it to server/.env (see .env.example) and restart."
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

const PORT = Number(process.env.PORT) || 5000;
const uploadRoot = path.join(rootDir, "uploads", "temp");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const upload = createUploadMiddleware(uploadRoot);

const app = express();
app.locals.uploadRoot = uploadRoot;

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "smartdoc_ai" });
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", createFileRouter(upload));
app.use("/api/convert", createConvertRouter(upload));
app.use("/api/ai", aiRoutes);

const clientDist = path.join(rootDir, "..", "client", "dist");
const shouldServeClient =
  fs.existsSync(clientDist) &&
  (process.env.SERVE_STATIC === "1" || process.env.NODE_ENV === "production");

if (shouldServeClient) {
  app.use(
    express.static(clientDist, {
      index: false,
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    })
  );
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    err.status = 400;
    err.message = "File too large (max 5MB)";
    err.code = "FILE_TOO_LARGE";
  }
  errorHandler(err, req, res, next);
});

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      const mode =
        shouldServeClient ? "API + static client" : "API only";
      console.log(`SmartDoc AI (${mode}) listening on port ${PORT}`);
    });
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
}

start();
