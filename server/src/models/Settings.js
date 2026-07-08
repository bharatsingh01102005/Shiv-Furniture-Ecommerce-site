import mongoose from "mongoose";

// Delivery is calculated using only PINCODE (no latitude/longitude required).
// We keep older fields (shopLat/shopLng/perKmRate) for backward compatibility
// but the app uses the new pincode-based fields.

const settingsSchema = new mongoose.Schema(
  {
    // New (pincode-based)
    shopPincode: { type: String, default: "" },

    // Rate per km (₹) by region
    rateUP: { type: Number, default: 12, min: 0, max: 1000 },
    rateRajasthan: { type: Number, default: 14, min: 0, max: 1000 },
    rateOther: { type: Number, default: 20, min: 0, max: 1000 },

    // Distance approximation from pincodes:
    // distanceKm = abs(destPincode - shopPincode) / pincodeKmDivisor
    // Example: divisor 100 => (302001 - 282001)/100 ≈ 200 km
    pincodeKmDivisor: { type: Number, default: 100, min: 1, max: 10000 },

    minDeliveryFee: { type: Number, default: 0, min: 0, max: 100000 },
    maxDeliveryFee: { type: Number, default: 999999, min: 0, max: 999999 },

    shopAddress: { type: String, default: "" },
    currency: { type: String, default: "INR" },

    // Old (legacy)
    shopLat: { type: Number, default: 0 },
    shopLng: { type: Number, default: 0 },
    perKmRate: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// Coerce numeric and string fields
settingsSchema.pre("validate", function (next) {
  if (typeof this.shopPincode === "string") this.shopPincode = this.shopPincode.trim(); else this.shopPincode = String(this.shopPincode || "");

  this.rateUP = Number(this.rateUP || 0);
  this.rateRajasthan = Number(this.rateRajasthan || 0);
  this.rateOther = Number(this.rateOther || 0);

  this.pincodeKmDivisor = Math.max(1, Number(this.pincodeKmDivisor || 1));
  this.minDeliveryFee = Math.max(0, Number(this.minDeliveryFee || 0));
  this.maxDeliveryFee = Math.max(0, Number(this.maxDeliveryFee || 0));

  if (typeof this.shopAddress === "string") this.shopAddress = this.shopAddress.trim(); else this.shopAddress = String(this.shopAddress || "");
  this.currency = (this.currency || "INR").toString().toUpperCase();

  this.shopLat = Number(this.shopLat || 0);
  this.shopLng = Number(this.shopLng || 0);
  this.perKmRate = Number(this.perKmRate || 0);

  next();
});

export const Settings = mongoose.model("Settings", settingsSchema);
