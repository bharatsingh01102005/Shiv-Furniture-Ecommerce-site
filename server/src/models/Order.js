import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    shippingAddress: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      line1: { type: String, default: '' },
      area: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },
    pricing: {
      subtotal: { type: Number, default: 0 },
      deliveryDistanceKm: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      perKmRate: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        qty: Number,
        price: Number
      }
    ],
    amountRupees: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String, enum: ["UPI"], default: "UPI" },
    upiId: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    adminRemark: { type: String, default: "", maxlength: 240 },
    rejectReason: { type: String, default: "", maxlength: 240 },
    status: { type: String, enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "REJECTED", "CANCELLED"], default: "PENDING" }
  },
  { timestamps: true }
);

// Sanitize and coerce order fields before validation
orderSchema.pre("validate", function (next) {
  // Ensure userId is ObjectId-like (leave to mongoose to validate)

  // Shipping address cleanup
  if (!this.shippingAddress) this.shippingAddress = {};
  const s = this.shippingAddress;
  if (typeof s.name === "string") s.name = s.name.trim(); else s.name = String(s.name || "");
  if (typeof s.phone === "string") s.phone = s.phone.trim(); else s.phone = String(s.phone || "");
  if (typeof s.line1 === "string") s.line1 = s.line1.trim(); else s.line1 = String(s.line1 || "");
  if (typeof s.area === "string") s.area = s.area.trim(); else s.area = String(s.area || "");
  if (typeof s.city === "string") s.city = s.city.trim(); else s.city = String(s.city || "");
  if (typeof s.state === "string") s.state = s.state.trim(); else s.state = String(s.state || "");
  if (typeof s.pincode === "string") s.pincode = s.pincode.trim(); else s.pincode = String(s.pincode || "");
  s.lat = Number(s.lat || 0);
  s.lng = Number(s.lng || 0);

  // Items coercion
  if (!Array.isArray(this.items)) this.items = [];
  this.items = this.items.map((it) => {
    return {
      productId: it.productId,
      title: typeof it.title === "string" ? it.title.trim() : String(it.title || ""),
      qty: Math.max(1, Number(it.qty || 1)),
      price: Number(it.price || 0),
    };
  });

  // Pricing and amount coercion
  if (!this.pricing) this.pricing = {};
  this.pricing.subtotal = Number(this.pricing.subtotal || 0);
  this.pricing.deliveryDistanceKm = Number(this.pricing.deliveryDistanceKm || 0);
  this.pricing.deliveryFee = Number(this.pricing.deliveryFee || 0);
  this.pricing.perKmRate = Number(this.pricing.perKmRate || 0);
  this.pricing.total = Number(this.pricing.total || 0);

  this.amountRupees = Number(this.amountRupees || this.pricing.total || 0);
  this.currency = (this.currency || "INR").toString().toUpperCase();

  if (typeof this.adminRemark === "string") this.adminRemark = this.adminRemark.trim();
  if (typeof this.rejectReason === "string") this.rejectReason = this.rejectReason.trim();

  // Validate status enum will be enforced by mongoose
  next();
});

export const Order = mongoose.model("Order", orderSchema);
