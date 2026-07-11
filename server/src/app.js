import express from "express";
import { applySecurity } from "./middleware/security.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();

// Apply security middleware (helmet, cors, cookie-parser, mongo-sanitize)
applySecurity(app);
app.use(express.json({ limit: "250kb" }));

// Health check route
app.get("api/health", (req, res) => res.json({ ok: true, message: "Server is running" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/settings", settingsRoutes);

// Handle unknown routes
app.all("*", (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
