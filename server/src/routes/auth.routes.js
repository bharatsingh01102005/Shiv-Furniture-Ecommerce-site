import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { config } from "../config.js";
import { setAuthCookie } from "../utils/cookies.js";
import { requireAuth } from "../middleware/auth.js";
import { sendResetOtpEmail } from "../utils/mailer.js";
import catchAsync from "../utils/catchAsync.js";
import { body } from "express-validator";
import { runValidation } from "../middleware/validate.js";

const router = Router();

// Helper to create and sign a JWT for a user
function signToken(user) {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is missing in .env");
  }
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

// ---------- Signup ----------

router.post(
  "/signup",
  authLimiter,
  body("name").isString().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  runValidation,
  catchAsync(async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      phone: phone ? phone.trim() : undefined,
      isAdmin: false,
    });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ message: "Signup successful" });
  })
);

// ---------- Login ----------

router.post(
  "/login",
  authLimiter,
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").exists().withMessage("Password is required"),
  runValidation,
  catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.passwordHash) {
      return res
        .status(400)
        .json({ message: "This account uses Google Sign-In. Please continue with Google." });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ message: "Login successful", isAdmin: user.isAdmin });
  })
);

// ---------- Google Sign-In ----------

const googleClient = new OAuth2Client(config.googleClientId || undefined);

router.post(
  "/google",
  authLimiter,
  catchAsync(async (req, res) => {
    const { credential } = req.body;

    if (!credential || credential.length < 20) {
      return res.status(400).json({ message: "Invalid Google credential" });
    }
    if (!config.googleClientId) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID missing in .env" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Google token is missing email" });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || payload.given_name || "User";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, googleId, isAdmin: false });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.name || user.name === "User") user.name = name;
      await user.save();
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ message: "Google login successful", isAdmin: user.isAdmin });
  })
);

// ---------- Forgot Password (OTP via email) ----------

router.post(
  "/forgot/request",
  authLimiter,
  body("email").isEmail().withMessage("Enter a valid email address"),
  runValidation,
  catchAsync(async (req, res) => {
    const { email } = req.body;

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with the same message to prevent user enumeration
    if (!user) {
      return res.json({ message: "If an account exists, OTP has been sent." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    user.resetOtpHash = otpHash;
    user.resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendResetOtpEmail({ to: normalizedEmail, otp, name: user.name || "User" });

    return res.json({ message: "If an account exists, OTP has been sent." });
  })
);

router.post(
  "/forgot/reset",
  authLimiter,
  body("email").isEmail().withMessage("Enter a valid email"),
  body("otp").isLength({ min: 4 }).withMessage("OTP is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  runValidation,
  catchAsync(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isExpired = new Date(user.resetOtpExpiresAt).getTime() < Date.now();
    const isMatch = await bcrypt.compare(otp, user.resetOtpHash);

    if (!isMatch || isExpired) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  })
);

// ---------- Logout & Me ----------

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
