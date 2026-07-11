import mongoose from "mongoose";
import { config } from "./config.js";

/**
 * Serverless-safe MongoDB connection.
 *
 * Vercel Serverless Functions are stateless but the Node.js runtime is reused
 * across "warm" invocations within the same container.  Calling
 * `mongoose.connect()` on every request would open a new connection pool each
 * time, quickly exhausting the MongoDB Atlas connection limit.
 *
 * The pattern below caches the connection promise at module level so it is
 * shared across all warm invocations of the same Lambda container.
 * `mongoose.connection.readyState === 1` means already connected → skip.
 */

let connectionPromise = null;

export async function connectDB() {
  if (!config.mongoUri) {
    throw new Error("MONGO_URI missing in environment");
  }

  // Already connected – reuse the existing connection
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // A connection is in progress (another concurrent cold-start) – wait for it
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  // First call on this container – initiate a new connection
  connectionPromise = mongoose
    .connect(config.mongoUri, {
      // Keep the pool small; serverless functions are short-lived
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("✅ MongoDB connected");
    })
    .catch((error) => {
      // Reset so the next invocation retries
      connectionPromise = null;
      console.error("❌ MongoDB connection error:", error);
      throw error;
    });

  await connectionPromise;
}
