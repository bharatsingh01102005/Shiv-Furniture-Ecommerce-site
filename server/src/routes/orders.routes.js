import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import { Order } from "../models/Order.js";
import { Settings } from "../models/Settings.js";
import { Product } from "../models/Product.js";
import { calcDeliveryQuote } from "../utils/pincode.js";
import { config } from "../config.js";
import catchAsync from "../utils/catchAsync.js";
import { body } from "express-validator";
import { runValidation, sanitizeBody } from "../middleware/validate.js";

const router = Router();

// GET /api/orders — fetch logged-in user's orders
router.get(
  "/",
  requireAuth,
  catchAsync(async (req, res) => {
    const orders = await Order.find({ userId: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ orders, upiId: config.upiId });
  })
);

// POST /api/orders/delivery-quote — calculate delivery fee by pincode
router.post(
  "/delivery-quote",
  requireAuth,
  writeLimiter,
  sanitizeBody(["pincode", "state", "latitude", "longitude"]),
  body("pincode").isString().isLength({ min: 4 }).withMessage("Please enter a valid pincode"),
  runValidation,
  catchAsync(async (req, res) => {
    const { pincode, state = "", latitude, longitude } = req.body;

    const settings = await Settings.findOne().lean();
    if (!settings) {
      return res.status(500).json({ message: "Shop settings not configured" });
    }

    const quote = calcDeliveryQuote(settings, {
      pincode: String(pincode).trim(),
      state,
      latitude: latitude || null,
      longitude: longitude || null,
    });

    res.json({ quote });
  })
);

// POST /api/orders/create — place a new order
router.post(
  "/create",
  requireAuth,
  writeLimiter,
  sanitizeBody(["items", "transactionId", "shippingAddress"]),
  body("items").isArray({ min: 1 }).withMessage("Cart cannot be empty"),
  body("shippingAddress.name").isString().isLength({ min: 2 }).withMessage("Enter a valid name for shipping address"),
  body("shippingAddress.phone").isString().isLength({ min: 7 }).withMessage("Enter a valid phone number"),
  body("shippingAddress.line1").isString().isLength({ min: 3 }).withMessage("Enter a valid street address"),
  body("shippingAddress.pincode").isString().isLength({ min: 4 }).withMessage("Enter a valid pincode"),
  runValidation,
  catchAsync(async (req, res) => {
  const { items, transactionId = "", shippingAddress } = req.body;

  // Basic validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart cannot be empty" });
  }
  if (!shippingAddress || !shippingAddress.name || shippingAddress.name.trim().length < 2) {
    return res.status(400).json({ message: "Enter a valid name for shipping address" });
  }
  if (!shippingAddress.phone || shippingAddress.phone.trim().length < 7) {
    return res.status(400).json({ message: "Enter a valid phone number" });
  }
  if (!shippingAddress.line1 || shippingAddress.line1.trim().length < 3) {
    return res.status(400).json({ message: "Enter a valid street address" });
  }
  if (!shippingAddress.pincode || shippingAddress.pincode.trim().length < 4) {
    return res.status(400).json({ message: "Enter a valid pincode" });
  }

  // Fetch products and calculate subtotal
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(String(item.productId));
    if (!product) continue;

    const qty = Math.max(1, Number(item.qty) || 1);
    subtotal += qty * Number(product.price);
    orderItems.push({
      productId: product._id,
      title: product.title,
      qty,
      price: product.price,
    });
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ message: "No valid products found in cart" });
  }

  // Calculate delivery fee
  const settings = await Settings.findOne().lean();
  if (!settings) {
    return res.status(500).json({ message: "Shop settings not configured" });
  }

  const ship = shippingAddress;
  const { distanceKm, perKmRate, deliveryFee } = calcDeliveryQuote(settings, {
    pincode: ship.pincode,
    state: ship.state || "",
    latitude: ship.latitude || null,
    longitude: ship.longitude || null,
  });

  const total = subtotal + deliveryFee;

  // Create the order in database
  const order = await Order.create({
    userId: req.user.sub,
    shippingAddress: ship,
    pricing: { subtotal, deliveryDistanceKm: distanceKm, deliveryFee, perKmRate, total },
    items: orderItems,
    amountRupees: total,
    currency: "INR",
    paymentMethod: "UPI",
    upiId: config.upiId,
    transactionId: transactionId.trim() || "",
    status: "PENDING",
  });
  res.status(201).json({ order });
  })
);

// GET /api/orders/admin/all — admin: view all orders
router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  catchAsync(async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(300);
    res.json({ orders });
  })
);

// PUT /api/orders/admin/:id/status — admin: update order status
router.put(
  "/admin/:id/status",
  requireAuth,
  requireAdmin,
  writeLimiter,
  sanitizeBody(["status", "adminRemark", "rejectReason"]),
  catchAsync(async (req, res) => {
    const { status, adminRemark = "", rejectReason = "" } = req.body;

    const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "REJECTED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const update = { status };
    if (typeof adminRemark === "string") update.adminRemark = adminRemark;
    if (typeof rejectReason === "string") update.rejectReason = rejectReason;

    const updated = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.json({ order: updated });
  })
);

export default router;
