import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  // Provide a safe local default for development if MONGO_URI is not set
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shiv-furniture",
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: (process.env.CORS_ORIGIN || "").trim(),
  // Use a default development secret if not provided (not for production)
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",

  // Brand / business
  brandName: process.env.BRAND_NAME || "Shiv Furniture House",
  upiId: process.env.UPI_ID || "",
  merchantName: process.env.MERCHANT_NAME || "Shiv%20Furniture%20House",

  // Delivery pricing (pincode-based)
  shopPincode: String(process.env.SHOP_PINCODE || "").trim(),
  rateUP: Number(process.env.RATE_UP || 12),
  rateRajasthan: Number(process.env.RATE_RAJASTHAN || 14),
  rateOther: Number(process.env.RATE_OTHER || 20),
  pincodeKmDivisor: Number(process.env.PINCODE_KM_DIVISOR || 100),
  minDeliveryFee: Number(process.env.MIN_DELIVERY_FEE || 0),
  maxDeliveryFee: Number(process.env.MAX_DELIVERY_FEE || 999999),

  // Legacy (unused by UI now)
  shopLat: Number(process.env.SHOP_LAT || 0),
  shopLng: Number(process.env.SHOP_LNG || 0),
  perKmRate: Number(process.env.PER_KM_RATE || 0),
  shopAddress: process.env.SHOP_ADDRESS || "Raibha, Agra, Uttar Pradesh",

  // Admin seed
  adminEmail: process.env.ADMIN_EMAIL || "admin@shivfurniture.com",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin@12345",

  // Google Sign-In (client sends Google credential to backend; backend verifies)
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",

  // OTP settings
  otpTtlMs: Number(process.env.OTP_TTL_MS || 10 * 60 * 1000), // 10 minutes
  otpLength: Number(process.env.OTP_LENGTH || 6),

  // SMTP (email OTP)
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "",
};

// Fail fast in production if critical secrets are not configured
if (config.nodeEnv === "production") {
  const unsafeJwt = !process.env.JWT_SECRET || String(config.jwtSecret).startsWith("dev_") || String(config.jwtSecret).toLowerCase().includes("change_me");
  if (unsafeJwt) {
    console.error("FATAL: JWT_SECRET must be set to a strong secret in production. Set JWT_SECRET in your environment.");
    // Exit to prevent running with insecure defaults
    throw new Error("JWT_SECRET missing or insecure in production");
  }
  if (!process.env.MONGO_URI) {
    console.error("FATAL: MONGO_URI must be set in production environment.");
    throw new Error("MONGO_URI missing in production");
  }
}
