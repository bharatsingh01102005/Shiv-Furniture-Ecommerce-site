// Simple middleware to validate required fields in request body
export function requireFields(...fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const val = req.body[f];
      return val === undefined || val === null || val === "";
    });

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
}

// Express-validator result handler
import { validationResult } from "express-validator";

export function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }
  next();
}

// Whitelist allowed fields in request body to prevent extra properties
export function sanitizeBody(allowed = []) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== "object") return next();

    const cleaned = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        cleaned[key] = req.body[key];
      }
    }

    req.body = cleaned;
    next();
  };
}
