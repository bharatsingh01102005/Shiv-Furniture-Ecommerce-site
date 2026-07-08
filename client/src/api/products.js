import { api } from "./http";

export const ProductsAPI = {
  // Get all products (supports search and category filter)
  list: ({ search = "", category = "" } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    const queryString = params.toString();
    return api(`/api/products${queryString ? `?${queryString}` : ""}`);
  },

  // Create a new product (admin only)
  create: (payload) => api("/api/products", { method: "POST", body: payload }),

  // Update an existing product (admin only)
  update: (id, payload) =>
    api(`/api/products/${id}`, { method: "PUT", body: payload }),

  // Delete a product (admin only)
  remove: (id) => api(`/api/products/${id}`, { method: "DELETE", body: {} }),
};
