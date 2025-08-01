import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        "Response error:",
        error.response.status,
        error.response.data
      );

      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        console.error("Unauthorized access - redirecting to login");
        // window.location.href = '/auth/signin';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export { api };
