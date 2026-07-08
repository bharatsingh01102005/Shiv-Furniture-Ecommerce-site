function digitsOnly(v = "") {
  return String(v).replace(/\D/g, "");
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function normalizeState(state = "") {
  const s = String(state).trim().toLowerCase();
  if (!s) return "";
  if (s === "up" || s.includes("uttar pradesh") || s.includes("u.p")) return "uttar pradesh";
  if (s.includes("rajasthan")) return "rajasthan";
  return s;
}

export function pickRateByState(settings, state = "") {
  const n = normalizeState(state);
  if (n === "uttar pradesh") return Number(settings?.rateUP ?? 0);
  if (n === "rajasthan") return Number(settings?.rateRajasthan ?? 0);
  return Number(settings?.rateOther ?? 0);
}

export function estimateDistanceKmFromPincode(settings, destPincode = "") {
  const sp = digitsOnly(settings?.shopPincode || "");
  const dp = digitsOnly(destPincode || "");
  const divisor = Math.max(1, Number(settings?.pincodeKmDivisor || 100));
  if (!sp || sp.length < 4 || !dp || dp.length < 4) return 0;
  const a = Number(sp);
  const b = Number(dp);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const km = Math.abs(b - a) / divisor;
  // Reasonable clamp
  return Math.min(2500, Math.max(0, km));
}

export function calcDeliveryQuote(settings, { pincode = "", state = "", latitude = null, longitude = null } = {}) {
  let distanceKm = 0;
  
  // If coordinates are provided, use haversine distance
  if (latitude != null && longitude != null && settings?.shopLat && settings?.shopLng) {
    distanceKm = haversineKm(
      Number(settings.shopLat),
      Number(settings.shopLng),
      Number(latitude),
      Number(longitude)
    );
  } else {
    // Fall back to pincode-based estimation
    distanceKm = estimateDistanceKmFromPincode(settings, pincode);
  }
  
  const perKmRate = pickRateByState(settings, state);
  const rawFee = Math.round(distanceKm * perKmRate);
  const minFee = Math.max(0, Number(settings?.minDeliveryFee ?? 0));
  const maxFee = Math.max(minFee, Number(settings?.maxDeliveryFee ?? 999999));
  const deliveryFee = Math.min(maxFee, Math.max(minFee, rawFee));
  return { distanceKm, perKmRate, deliveryFee };
}
