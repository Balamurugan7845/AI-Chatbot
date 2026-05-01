import axios from "axios";
import { API_URL } from "./config";

// ---------------- AXIOS INSTANCE ---------------- //

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- REQUEST INTERCEPTOR ---------------- //
// Attach access token

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
// Handle 401 → refresh token

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Call refresh API
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

        // Save tokens
        localStorage.setItem("token", newAccess);
        localStorage.setItem("refresh_token", newRefresh);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return api(originalRequest);
      } catch (err) {
        console.error("Refresh failed:", err);

        // Logout
        localStorage.clear();
        window.location.href = "/auth";

        return Promise.reject(err);
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
};

// ---------------- CHAT APIs ---------------- //

export const sendMessage = (message) =>
  api.post("/chat/", { message });

export const getChatHistory = () =>
  api.get("/chat/history");

// ---------------- EXPORT ---------------- //

export default api;