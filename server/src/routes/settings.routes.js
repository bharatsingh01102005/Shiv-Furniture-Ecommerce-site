import { Router } from "express";
import { Settings } from "../models/Settings.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import catchAsync from "../utils/catchAsync.js";
import { body } from "express-validator";
import { runValidation, sanitizeBody } from "../middleware/validate.js";

const router = Router();

// GET /api/settings/public — delivery pricing info for checkout (public)
router.get(
  "/public",
  catchAsync(async (req, res) => {
    const settings = await Settings.findOne().lean();
    if (!settings) return res.json({ settings: null });

    // Only expose fields needed by the checkout page
    res.json({
      settings: {
        shopPincode: settings.shopPincode,
        rateUP: settings.rateUP,
        rateRajasthan: settings.rateRajasthan,
        rateOther: settings.rateOther,
        pincodeKmDivisor: settings.pincodeKmDivisor,
        minDeliveryFee: settings.minDeliveryFee,
        maxDeliveryFee: settings.maxDeliveryFee,
        shopAddress: settings.shopAddress,
        currency: settings.currency,
      },
    });
  })
);

// GET /api/settings/admin — full settings (admin only)
router.get(
  "/admin",
  requireAuth,
  requireAdmin,
  catchAsync(async (req, res) => {
    const settings = await Settings.findOne().lean();
    res.json({ settings });
  })
);

// PUT /api/settings/admin — update settings (admin only)
router.put(
  "/admin",
  requireAuth,
  requireAdmin,
  writeLimiter,
  sanitizeBody([
    "shopPincode",
    "rateUP",
    "rateRajasthan",
    "rateOther",
    "pincodeKmDivisor",
    "minDeliveryFee",
    "maxDeliveryFee",
    "shopAddress",
    "currency",
    "shopLat",
    "shopLng",
    "perKmRate",
  ]),
  body("rateUP").isFloat({ min: 0 }).withMessage("rateUP must be a non-negative number"),
  body("rateRajasthan").isFloat({ min: 0 }).withMessage("rateRajasthan must be a non-negative number"),
  body("rateOther").isFloat({ min: 0 }).withMessage("rateOther must be a non-negative number"),
  body("pincodeKmDivisor").isInt({ min: 1 }).withMessage("pincodeKmDivisor must be at least 1"),
  runValidation,
  catchAsync(async (req, res) => {
    const { rateUP, rateRajasthan, rateOther, pincodeKmDivisor } = req.body;

    // Validate numeric delivery rates
    if (typeof rateUP !== "number" || rateUP < 0) {
      return res.status(400).json({ message: "rateUP must be a non-negative number" });
    }
    if (typeof rateRajasthan !== "number" || rateRajasthan < 0) {
      return res.status(400).json({ message: "rateRajasthan must be a non-negative number" });
    }
    if (typeof rateOther !== "number" || rateOther < 0) {
      return res.status(400).json({ message: "rateOther must be a non-negative number" });
    }
    if (typeof pincodeKmDivisor !== "number" || pincodeKmDivisor < 1) {
      return res.status(400).json({ message: "pincodeKmDivisor must be at least 1" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      // First time setup
      const created = await Settings.create(req.body);
      return res.json({ settings: created });
    }

    // Update fields
    settings.shopPincode = req.body.shopPincode || settings.shopPincode;
    settings.rateUP = rateUP;
    settings.rateRajasthan = rateRajasthan;
    settings.rateOther = rateOther;
    settings.pincodeKmDivisor = pincodeKmDivisor;
    settings.minDeliveryFee = req.body.minDeliveryFee ?? settings.minDeliveryFee;
    settings.maxDeliveryFee = req.body.maxDeliveryFee ?? settings.maxDeliveryFee;
    settings.shopAddress = req.body.shopAddress || settings.shopAddress;
    settings.currency = req.body.currency || settings.currency;

    // Legacy coordinate fields (optional)
    if (typeof req.body.shopLat === "number") settings.shopLat = req.body.shopLat;
    if (typeof req.body.shopLng === "number") settings.shopLng = req.body.shopLng;
    if (typeof req.body.perKmRate === "number") settings.perKmRate = req.body.perKmRate;

    await settings.save();
    res.json({ settings });
  })
);

export default router;
