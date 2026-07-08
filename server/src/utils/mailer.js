import nodemailer from "nodemailer";
import { config } from "../config.js";

let cachedTransport = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) return null;

  cachedTransport = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  });

  return cachedTransport;
}

export async function sendResetOtpEmail({ to, otp, name }) {
  const transport = getTransport();
  if (!transport) {
    // Don't crash in dev if SMTP not configured
    console.warn("⚠️ SMTP not configured. OTP (DEV):", otp, "to:", to);
    return { ok: false, devOtp: otp };
  }

  const from = config.smtpFrom || config.smtpUser;

  const subject = `${config.brandName} password reset OTP`;
  const text =
`Hi${name ? " " + name : ""},

Your OTP to reset password is: ${otp}

This OTP is valid for ${Math.round(config.otpTtlMs / 60000)} minutes.

If you didn’t request this, you can ignore this email.

— ${config.brandName}`;

  await transport.sendMail({ from, to, subject, text });
  return { ok: true };
}
