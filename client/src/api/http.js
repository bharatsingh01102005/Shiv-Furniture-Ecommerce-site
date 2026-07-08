const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Base fetch helper — sends JSON requests and throws on error responses
export async function api(path, { method = "GET", body } = {}) {
  const options = {
    method,
    credentials: "include", // send cookies (JWT HttpOnly token)
  };

  if (body) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
