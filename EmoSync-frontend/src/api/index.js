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
    //initilize headers
    if (!config.headers) {
      config.headers = {};
    }
    // add Token to request headers
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

 
    if (
      config.method?.toLowerCase() === "post" ||
      config.method?.toLowerCase() === "put"
    ) {
      const requestKey = `${config.method}-${config.url}-${JSON.stringify(
        config.data
      )}`;

      // if same request exists, cancel pre request
      if (pendingRequests.has(requestKey)) {
        const cancelToken = pendingRequests.get(requestKey);
        cancelToken.cancel("Duplicate request cancelled");
      }

      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      pendingRequests.set(requestKey, source);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {

    if (
      response.config.method?.toLowerCase() === "post" ||
      response.config.method?.toLowerCase() === "put"
    ) {
      const requestKey = `${response.config.method}-${
        response.config.url
      }-${JSON.stringify(response.config.data)}`;
      pendingRequests.delete(requestKey);
    }
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

    if (axios.isCancel(error)) {
    } else if (error.config) {
      const requestKey = `${error.config.method}-${
        error.config.url
      }-${JSON.stringify(error.config.data)}`;
      pendingRequests.delete(requestKey);
    }
    return Promise.reject(error);
  }
);

export default api;
