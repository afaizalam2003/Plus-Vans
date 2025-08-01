import axios, { AxiosError } from "axios";
import { getAuthToken } from "./auth";

// Create axios instance with base config
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Add request interceptor to always use latest token
http.interceptors.request.use(
  (config) => {
    // Skip adding auth header for login/signup requests
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    const token = getAuthToken();
    if (token?.access_token) {
      config.headers.Authorization = `${token.token_type} ${token.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is not a 401 or if we've already retried, reject
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    
    // If we've already tried to refresh the token, redirect to signin
    if (originalRequest.url?.includes('/auth/refresh')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
      return Promise.reject(error);
    }
    
    // For 401/403 errors, redirect to signin
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default http;
