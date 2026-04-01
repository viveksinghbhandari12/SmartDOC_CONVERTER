import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userModel from "../models/userModel.js";

function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Valid email is required",
        code: "INVALID_EMAIL",
      });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
        code: "WEAK_PASSWORD",
      });
    }
    if (typeof name !== "string" || name.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
        code: "INVALID_NAME",
      });
    }

    const existing = await userModel.findUserByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
        code: "EMAIL_EXISTS",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await userModel.createUser({
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
    });

    const token = signToken(userId, email.toLowerCase());
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userId, email: email.toLowerCase(), name: name.trim() },
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!validateEmail(email) || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
        code: "INVALID_CREDENTIALS",
      });
    }

    const user = await userModel.findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        code: "LOGIN_FAILED",
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
        code: "LOGIN_FAILED",
      });
    }

    const token = signToken(user.id, user.email);
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  } catch (e) {
    next(e);
  }
}

function signToken(userId, email) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("JWT_SECRET is not configured");
    err.status = 500;
    throw err;
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ sub: userId, email }, secret, { expiresIn });
}

export async function me(req, res, next) {
  try {
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }
    res.json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name } },
    });
  } catch (e) {
    next(e);
  }
}
