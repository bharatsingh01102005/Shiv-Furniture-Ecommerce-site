import express from "express";
import { connectDB } from "./db.js";
import { config } from "./config.js";
import { applySecurity } from "./middleware/security.js";
import AppError from "./utils/AppError.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { seedProductsIfEmpty, ensureSettings, ensureAdminUser } from "./seed/seed.js";

const app = express();

// Apply security middleware (helmet, cors, cookie-parser, mongo-sanitize)
applySecurity(app);
app.use(express.json({ limit: "250kb" }));

// Health check route
app.get("/api/health", (req, res) => res.json({ ok: true, message: "Server is running" }));

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

// Start server
async function startServer() {
  try {
    await connectDB();
    await seedProductsIfEmpty();
    await ensureSettings();
    await ensureAdminUser();

    const PORT = Number(config.port) || 3000;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   Environment: ${config.nodeEnv}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`🔥 Port ${PORT} is already in use. Set PORT to another value or stop the process using it.`);
        process.exit(1);
      }
      throw error;
    });
  } catch (error) {
    console.error("🔥 Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
