import { Router } from "express";
import { Product } from "../models/Product.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import catchAsync from "../utils/catchAsync.js";
import { body } from "express-validator";
import { runValidation, sanitizeBody } from "../middleware/validate.js";

const router = Router();

// Helper to validate product fields
function validateProduct(body) {
  const { title, mrp, category } = body;

  if (!title || title.trim().length < 2) {
    return "Product title must be at least 2 characters";
  }
  if (!mrp || typeof mrp !== "number" || mrp < 1) {
    return "MRP must be a valid number greater than 0";
  }
  if (!category || category.trim().length < 2) {
    return "Category must be at least 2 characters";
  }

  return null; // no error
}

// GET /api/products — list all products (supports search & category filter)
router.get(
  "/",
  catchAsync(async (req, res) => {
    const { search = "", category = "" } = req.query;

    const query = {};
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: "i" } },
        { description: { $regex: String(search), $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).limit(200);
    res.json({ products });
  })
);

// POST /api/products — add a new product (admin only)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  writeLimiter,
  sanitizeBody(["title", "description", "category", "mrp", "discount", "images"]),
  body("title").isString().isLength({ min: 2 }).withMessage("Product title must be at least 2 characters"),
  body("mrp").isFloat({ gt: 0 }).withMessage("MRP must be a valid number greater than 0"),
  body("category").isString().isLength({ min: 2 }).withMessage("Category must be at least 2 characters"),
  runValidation,
  catchAsync(async (req, res) => {
    const created = await Product.create(req.body);
    res.status(201).json({ product: created });
  })
);

// PUT /api/products/:id — update a product (admin only)
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  writeLimiter,
  sanitizeBody(["title", "description", "category", "mrp", "discount", "images"]),
  body("title").optional().isString().isLength({ min: 2 }).withMessage("Product title must be at least 2 characters"),
  body("mrp").optional().isFloat({ gt: 0 }).withMessage("MRP must be a valid number greater than 0"),
  body("category").optional().isString().isLength({ min: 2 }).withMessage("Category must be at least 2 characters"),
  runValidation,
  catchAsync(async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ product: updated });
  })
);

// DELETE /api/products/:id — delete a product (admin only)
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  writeLimiter,
  catchAsync(async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  })
);

export default router;
