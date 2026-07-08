import mongoose from "mongoose";

function clamp(n, min, max){
  const x = Number.isFinite(n) ? n : 0;
  return Math.min(max, Math.max(min, x));
}

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },

    // Principal amount (MRP)
    mrp: { type: Number, required: true, min: 1 },

    // Discount percent (0-95)
    discountPercent: { type: Number, default: 0, min: 0, max: 95 },

    // Final selling price (auto-calculated from MRP & discountPercent)
    price: { type: Number, required: true, min: 1 },

    category: { type: String, required: true, trim: true, maxlength: 40 },
    badge: { type: String, default: "" },
    image: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 300 },
    stock: { type: Number, default: 10, min: 0 }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Ensure price is consistent
productSchema.pre("validate", function(next){
  // Backward compatibility: if mrp missing, fall back to price
  if (!this.mrp && this.price) this.mrp = this.price;

  // Coerce numeric fields
  this.mrp = Math.round(Number(this.mrp || 0));
  this.discountPercent = clamp(Number(this.discountPercent || 0), 0, 95);
  this.stock = Math.max(0, Number(this.stock || 0));

  // Trim string fields
  if (typeof this.title === "string") this.title = this.title.trim();
  if (typeof this.category === "string") this.category = this.category.trim();
  if (typeof this.description === "string") this.description = this.description.trim();

  // Compute final price
  const finalPrice = Math.max(1, Math.round(this.mrp - (this.mrp * this.discountPercent) / 100));
  this.price = finalPrice;

  next();
});

productSchema.virtual("offPercent").get(function(){
  return Math.round(Number(this.discountPercent || 0));
});

export const Product = mongoose.model("Product", productSchema);
