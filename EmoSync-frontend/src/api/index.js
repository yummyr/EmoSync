import axios from "axios";
import { tokenManager, handleTokenExpiration } from "@/utils/tokenManager";

const api = axios.create({
  baseURL: "http://localhost:8080/api", //  backend API base URL
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Initialize headers
    if (!config.headers) {
      config.headers = {};
    }
    // Add Token to request headers
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Use tokenManager to handle token expiration
      console.error("Unauthorized access - token invalid or expired");

      // Cleanup token manager and trigger logout
      tokenManager.cleanup();
      handleTokenExpiration();
    }

    return Promise.reject(error);
  }
);

export default api;
