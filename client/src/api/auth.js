import { api } from "./http";

export const AuthAPI = {
  me: () => api("/api/auth/me"),

  login: (email, password) =>
    api("/api/auth/login", { method: "POST", body: { email, password } }),

  signup: (name, email, password, phone) =>
    api("/api/auth/signup", { method: "POST", body: { name, email, password, phone } }),

  googleLogin: (credential) =>
    api("/api/auth/google", { method: "POST", body: { credential } }),

  requestResetOtp: (email) => api("/api/auth/forgot/request", { method: "POST", body: { email } }),

  resetPasswordWithOtp: ({ email, otp, newPassword }) => api("/api/auth/forgot/reset", { method: "POST", body: { email, otp, newPassword } }),

  logout: () => api("/api/auth/logout", { method: "POST", body: {} }),
};
