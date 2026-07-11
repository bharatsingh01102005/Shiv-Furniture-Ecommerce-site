/**
 * server.js — Local development entry point ONLY.
 *
 * This file is NOT used by Vercel. Vercel uses api/index.js.
 * Run with: node --watch server.js  (or: nodemon server.js)
 */

import { connectDB } from "./src/db.js";
import {
  seedProductsIfEmpty,
  ensureSettings,
  ensureAdminUser,
} from "./src/seed/seed.js";
import app from "./src/app.js";
import { config } from "./src/config.js";

async function startServer() {
  try {
    await connectDB();
    await seedProductsIfEmpty();
    await ensureSettings();
    await ensureAdminUser();

    const PORT = Number(config.port) || 3000;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${config.nodeEnv}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `🔥 Port ${PORT} is already in use. Set PORT to another value or stop the process using it.`
        );
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
