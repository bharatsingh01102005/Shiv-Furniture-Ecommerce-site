import { config } from "../config.js";

export function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}
