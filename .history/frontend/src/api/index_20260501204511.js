<<<<<<< HEAD
import axios from "axios";
import { API_URL } from "./config";

// ---------------- AXIOS INSTANCE ---------------- //

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 🔐 Refresh state
let isRefreshing = false;
let subscribers = [];

// ✅ Resolve queued requests
function onRefreshed(token) {
  subscribers.forEach((cb) => cb.resolve(token));
  subscribers = [];
}

// ❌ Reject queued requests
function onFailed(error) {
  subscribers.forEach((cb) => cb.reject(error));
  subscribers = [];
}

function addSubscriber(resolve, reject) {
  subscribers.push({ resolve, reject });
}

// ---------------- REQUEST INTERCEPTOR ---------------- //

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- RESPONSE INTERCEPTOR ---------------- //

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ No response → server/network issue
    if (!error.response) {
      return Promise.reject(error);
    }

    // ❌ Prevent infinite loop
    if (
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest._retry
    ) {
      logoutUser();
      return Promise.reject(error);
    }

    // 🔁 Token expired
    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addSubscriber(
            (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            (err) => reject(err)
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccess = res.data.access_token;
        const newRefresh = res.data.refresh_token;

        // ✅ Store new tokens
        localStorage.setItem("token", newAccess);
        localStorage.setItem("refresh_token", newRefresh);

        // ✅ Resolve all queued requests
        onRefreshed(newAccess);

        // ✅ Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);

      } catch (err) {
        // ❌ Reject all queued requests
        onFailed(err);

        logoutUser();
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- AUTH APIs ---------------- //

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);

  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem("refresh_token", res.data.refresh_token);

  return res.data;
};

export const logoutUser = () => {
  localStorage.clear();

  // ✅ Prevent multiple redirects spam
  if (window.location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
};

// ---------------- CHAT APIs ---------------- //

export const sendMessage = (message) =>
  api.post("/chat/", { message });

export const getChatHistory = () =>
  api.get("/chat/history");

export default api;
=======
export const streamMessage = async (token, message, handlers) => {
  const res = await fetch("http://localhost:8000/chat-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value);

    handlers.onChunk(buffer);
  }

  handlers.onEnd();
};
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
