import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Settings } from "../models/Settings.js";
import { hashPassword } from "../utils/password.js";
import { config } from "../config.js";

// Demo products for initial setup
const demoProducts = [
  {
    title: "Luxury Sofa",
    mrp: 24999,
    discountPercent: 10,
    category: "Sofas",
    badge: "Best Seller",
    description: "Soft cushions + premium finish for a luxury living room.",
    stock: 8,
  },
  {
    title: "Fabric Sofa",
    mrp: 19999,
    discountPercent: 10,
    category: "Sofas",
    badge: "Trending",
    description: "Comfortable fabric sofa with modern look.",
    stock: 12,
  },
  {
    title: "Wooden Bed",
    mrp: 32999,
    discountPercent: 10,
    category: "Beds",
    badge: "Premium",
    description: "Strong solid wood bed with elegant design.",
    stock: 5,
  },
  {
    title: "King Size Bed",
    mrp: 38999,
    discountPercent: 15,
    category: "Beds",
    badge: "Hot",
    description: "Spacious king bed for perfect sleep.",
    stock: 4,
  },
  {
    title: "Dining Set (4 Seater)",
    mrp: 15999,
    discountPercent: 10,
    category: "Dining",
    badge: "Value",
    description: "Perfect family meals with comfort and style.",
    stock: 9,
  },
  {
    title: "Office Chair",
    mrp: 6999,
    discountPercent: 0,
    category: "Chairs",
    badge: "Ergonomic",
    description: "Comfortable chair for long working hours.",
    stock: 15,
  },
  {
    title: "Modern Lamp",
    mrp: 999,
    discountPercent: 15,
    category: "Decor",
    badge: "New",
    description: "Warm light lamp for cozy vibes.",
    stock: 30,
  },
];

// Seed products only if the collection is empty
export async function seedProductsIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  // Use create so Mongoose validation and pre('validate') hooks run
  // (insertMany bypasses some middleware and `price` would be missing)
  await Product.create(demoProducts);
  console.log("🌱 Demo products seeded successfully");
}

// Create default shop settings if not already configured
export async function ensureSettings() {
  const existing = await Settings.findOne();
  if (existing) return;

  await Settings.create({
    shopPincode: config.shopPincode || "",
    rateUP: config.rateUP || 12,
    rateRajasthan: config.rateRajasthan || 14,
    rateOther: config.rateOther || 20,
    pincodeKmDivisor: config.pincodeKmDivisor || 100,
    minDeliveryFee: config.minDeliveryFee || 0,
    maxDeliveryFee: config.maxDeliveryFee || 999999,
    shopLat: config.shopLat || 0,
    shopLng: config.shopLng || 0,
    perKmRate: config.perKmRate || 0,
    shopAddress: config.shopAddress || "Raibha, Agra, Uttar Pradesh",
    currency: "INR",
  });

  console.log("🏪 Default shop settings created");
}

// Ensure the admin user exists (creates or updates)
export async function ensureAdminUser() {
  const email = config.adminEmail.toLowerCase();
  const passwordHash = await hashPassword(config.adminPassword);

  const existing = await User.findOne({ email });

  if (existing) {
    // Update password and ensure admin flag is set (keeps the same _id so orders stay linked)
    existing.passwordHash = passwordHash;
    existing.isAdmin = true;
    await existing.save();
    console.log("👑 Admin user updated:", email);
  } else {
    await User.create({ name: "Admin", email, passwordHash, isAdmin: true });
    console.log("👑 Admin user created:", email);
  }
}