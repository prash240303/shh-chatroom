// lib/http.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Function to get CSRF token from cookies
function getCsrfToken(): string | null {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track if we are currently refreshing the token
let isRefreshing = false;
// Queue to hold requests that fail while we are refreshing
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Process the queue after refresh attempt
const processQueue = (error: any, tokenRefreshed: boolean = false) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Add CSRF token to requests
http.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Optional: Dev logs only in dev mode
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or request was already retried, reject
    // Also reject if there is no originalRequest (should rarely happen)
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we are already refreshing, add this request to the queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
             // Once resolved, we retry the original request
             resolve(http(originalRequest));
          },
          reject: (err) => {
            reject(err || error);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      console.log("🔄 Access token expired, attempting token refresh...");
      
      const refreshResponse = await fetch(`${BASE_URL}refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(getCsrfToken() ? { "X-CSRFToken": getCsrfToken()! } : {}) 
        },
        credentials: "include", 
      });

      if (refreshResponse.ok) {
        console.log("✅ Token refresh successful");
        processQueue(null, true);
        return http(originalRequest);
      } else {
        throw new Error("Refresh failed");
      }
    } catch (refreshError) {
      console.error("❌ Token refresh failed, logging out:", refreshError);
      processQueue(refreshError, false);
      localStorage.removeItem("userEmailKey");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// We export the setRefreshTokenHandler as a no-op or removed if no longer needed.
// To avoid breaking existing imports immediately, we can export a dummy or update `useAuth` to stop using it.
export const setRefreshTokenHandler = (_handler: () => Promise<boolean>) => {
  console.warn("setRefreshTokenHandler is deprecated. http.ts manages refresh internally.");
};

export default http;