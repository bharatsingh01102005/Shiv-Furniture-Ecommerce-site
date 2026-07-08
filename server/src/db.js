import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDB() {
  try {
    if (!config.mongoUri) {
      throw new Error("MONGO_URI missing in environment");
    }

    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
