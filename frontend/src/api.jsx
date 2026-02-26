// frontend/src/api.jsx

// Use environment variable in production
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// Remove trailing slash if exists
const BASE = API_BASE.replace(/\/+$/, "");

async function safeFetch(path, options = {}) {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data };
    }

    return data;
  } catch (err) {
    console.error("API Error:", err);
    return { success: false, error: "Network error" };
  }
}

// API Methods
export const getMessages = () => safeFetch("/messages");

export const postMessage = (text, model) =>
  safeFetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model }),
  });

export const clearMessages = () =>
  safeFetch("/messages/clear", {
    method: "POST",
  });

export const getModels = () => safeFetch("/models");

export const getStats = () => safeFetch("/messages/stats");

export default {
  getMessages,
  postMessage,
  clearMessages,
  getModels,
  getStats,
};