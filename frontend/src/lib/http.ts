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

// Helper function to get access token from cookies
function getAccessToken(): string | null {
  const name = 'access_token';
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
    
    // Log the access token being sent
    const currentAccessToken = getAccessToken();
    console.log(`${config.method?.toUpperCase()} ${config.url}`);
    console.log(`Access token in request:`, currentAccessToken ? currentAccessToken.substring(0, 50) + '...' : 'NO TOKEN');
    
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
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      console.log(`Request failed with status ${error.response?.status}:`, originalRequest?.url);
      return Promise.reject(error);
    }

    console.log(`401 UNAUTHORIZED on ${originalRequest.url}`);
    console.log(`Old access token (expired):`, getAccessToken()?.substring(0, 50) + '...');

    // If we are already refreshing, add this request to the queue
    if (isRefreshing) {
      console.log(`Already refreshing token, adding request to queue...`);
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            console.log(`Retrying queued request: ${originalRequest.url}`);
            const newToken = getAccessToken();
            console.log(`New access token for queued request:`, newToken?.substring(0, 50) + '...');
            
            // CRITICAL: Remove old Cookie header to let browser send fresh cookies
            delete originalRequest.headers.Cookie;
            
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
      console.log("Access token expired, attempting token refresh...");
      
      const refreshResponse = await fetch(`${BASE_URL}refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(getCsrfToken() ? { "X-CSRFToken": getCsrfToken()! } : {}) 
        },
        credentials: "include", 
      });

      if (refreshResponse.ok) {
        console.log("Token refresh successful");
        
        // Wait a tiny bit to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const newAccessToken = getAccessToken();
        console.log(`New access token after refresh:`, newAccessToken?.substring(0, 50) + '...');
        
        // CRITICAL: Remove the old Cookie header from the original request
        // This allows the browser to automatically include the fresh cookies
        delete originalRequest.headers.Cookie;
        
        processQueue(null, true);
        
        console.log(`Retrying original request: ${originalRequest.url}`);
        return http(originalRequest);
      } else {
        console.error("Refresh response not OK:", refreshResponse.status);
        throw new Error("Refresh failed");
      }
    } catch (refreshError) {
      console.error("Token refresh failed, logging out:", refreshError);
      processQueue(refreshError, false);
      localStorage.removeItem("userEmailKey");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const setRefreshTokenHandler = (_handler: () => Promise<boolean>) => {
  console.warn("setRefreshTokenHandler is deprecated. http.ts manages refresh internally.");
};

export default http;
