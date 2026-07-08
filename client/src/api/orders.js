import { api } from "./http";

export const OrdersAPI = {
  // Get logged-in user's orders
  myOrders: () => api("/api/orders"),

  // Get delivery fee estimate by pincode
  deliveryQuote: (params) =>
    api("/api/orders/delivery-quote", { method: "POST", body: params }),

  // Place a new order
  create: (items, transactionId = "", shippingAddress) =>
    api("/api/orders/create", {
      method: "POST",
      body: { items, transactionId, shippingAddress },
    }),

  // Admin: get all orders
  adminAll: () => api("/api/orders/admin/all"),

  // Admin: update order status
  adminSetStatus: (id, status, adminRemark = "", rejectReason = "") =>
    api(`/api/orders/admin/${id}/status`, {
      method: "PUT",
      body: { status, adminRemark, rejectReason },
    }),
};
