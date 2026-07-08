import crypto from "crypto";

/** 6-digit numeric OTP */
export function generateOtp(length = 6) {
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += digits[crypto.randomInt(0, digits.length)];
  }
  return out;
}
