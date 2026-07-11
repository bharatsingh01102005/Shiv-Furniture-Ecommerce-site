/**
 * http.js — Centralized API base URL and fetch helper
 *
 * All API calls in the application go through this module.
 * VITE_API_URL must be set in .env (local) and in Vercel Environment Variables (production).
 *
 * Local:      VITE_API_URL=http://localhost:3000
 * Production: VITE_API_URL=https://your-server.vercel.app
 */
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    "[API] VITE_API_URL is not set. " +
      "Create a .env file at client/.env with VITE_API_URL=http://localhost:3000"
  );
}

/**
 * Base fetch helper — sends JSON requests and throws structured errors.
 * Handles both network failures and non-2xx HTTP responses.
 *
 * @param {string} path   - API path, e.g. "/api/auth/login"
 * @param {object} opts   - { method, body }
 * @returns {Promise<any>} Parsed JSON response
 */
export async function api(path, { method = "GET", body } = {}) {
  const options = {
    method,
    credentials: "include", // send HttpOnly JWT cookie with every request
  };

  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (networkError) {
    // fetch() itself threw — network is down, server unreachable, CORS preflight blocked, etc.
    throw new Error(
      "Cannot reach the server. Please check your internet connection and try again."
    );
  }

  // Try to parse JSON; fall back to an empty object if the body is not JSON
  let data = {};
  try {
    data = await response.json();
  } catch {
    // Non-JSON body (e.g. 502 HTML error page from Vercel) — leave data as {}
  }

  if (!response.ok) {
    // Use the server's error message when available, otherwise use HTTP status text
    throw new Error(data.message || response.statusText || "Request failed");
  }

  return data;
}
