import { api } from "./http";

export const SettingsAPI = {
  // Public: get delivery pricing info (used at checkout)
  public: () => api("/api/settings/public"),

  // Admin: get full settings
  adminGet: () => api("/api/settings/admin"),

  // Admin: update settings
  adminUpdate: (payload) =>
    api("/api/settings/admin", { method: "PUT", body: payload }),
};
