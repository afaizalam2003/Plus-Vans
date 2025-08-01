import http from "./http-common";
import Cookies from "js-cookie";
import type { UserProfile } from "./types";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Constants
export const AUTH_TOKEN_KEY = "auth_token";
const TOKEN_TYPE_KEY = "token_type";

// User registration data interface
interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

// JWT token response interface
interface TokenResponse {
  access_token: string;
  token_type: string;
  converted_bookings: null;
  failed_bookings: null;
}

// OAuth2 login credentials interface
interface LoginData {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

// Profile update data interface
interface ProfileUpdateData {
  name: string;
  phone: string;
  role: "customer" | "admin" | "ops" | "support";
}

// Cookie options
const TOKEN_COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

/**
 * Save authentication token to cookies
 * @param token JWT token response
 */
const saveAuthToken = (token: TokenResponse): void => {
  if (typeof window !== "undefined") {
    // Save in cookies for server-side requests
    Cookies.set(AUTH_TOKEN_KEY, token.access_token, TOKEN_COOKIE_OPTIONS);
    Cookies.set(TOKEN_TYPE_KEY, token.token_type, TOKEN_COOKIE_OPTIONS);

    // Also save in localStorage for client-side access
    localStorage.setItem(AUTH_TOKEN_KEY, token.access_token);
    localStorage.setItem(TOKEN_TYPE_KEY, token.token_type);
  }
};

/**
 * Remove authentication token from cookies
 */
const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    // Remove from cookies
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(TOKEN_TYPE_KEY);

    // Remove from localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
  }
};

/**
 * Get authentication token from cookies
 * @returns Token response or null if not found
 */
export const getAuthToken = (): TokenResponse | null => {
  // Return null if not in browser context
  if (typeof window === "undefined") return null;

  try {
    let access_token: string | null = null;
    let token_type = 'Bearer';

    // Try to get from localStorage first
    try {
      access_token = localStorage.getItem(AUTH_TOKEN_KEY);
      token_type = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
    } catch (e) {
      console.warn('Error accessing localStorage:', e);
    }

    // If not in localStorage, try cookies
    if (!access_token) {
      try {
        access_token = Cookies.get(AUTH_TOKEN_KEY);
        token_type = Cookies.get(TOKEN_TYPE_KEY) || 'Bearer';

        // If found in cookies, sync to localStorage
        if (access_token) {
          try {
            localStorage.setItem(AUTH_TOKEN_KEY, access_token);
            localStorage.setItem(TOKEN_TYPE_KEY, token_type);
          } catch (e) {
            console.warn('Error writing to localStorage:', e);
          }
        }
      } catch (e) {
        console.warn('Error accessing cookies:', e);
      }
    }

    if (access_token) {
      return {
        access_token,
        token_type,
        converted_bookings: null,
        failed_bookings: null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error in getAuthToken:", error);
    return null;
  }
};

/**
 * Register a new user account
 * @param userData User registration data
 * @returns JWT token response
 */
export const signup = async (userData: SignupData): Promise<TokenResponse> => {
  try {
    const response = await http.post<TokenResponse>("/auth/signup", userData);
    
    // Save token to localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.access_token);
      localStorage.setItem(TOKEN_TYPE_KEY, response.data.token_type || 'Bearer');
    }
    
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Authenticate user and get access token
 * @param loginData OAuth2 login credentials
 * @returns JWT token response
 */
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (loginData: LoginData): Promise<TokenResponse> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginData.username,
        password: loginData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Save token to localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
      localStorage.setItem(TOKEN_TYPE_KEY, data.token_type || 'Bearer');
    }
    
    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
  throw lastError || new Error('Login failed after multiple attempts');
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  removeAuthToken();
};

/**
 * Get the current user's profile
 * @returns User profile data
 */
export const getProfile = async (): Promise<UserProfile> => {
  const response = await http.get<UserProfile>("/profile/me");
  return response.data;
};

/**
 * Update the current user's profile
 * @param profileData Profile data to update
 * @returns Updated user profile
 */
export const updateProfile = async (
  profileData: ProfileUpdateData
): Promise<UserProfile> => {
  const response = await http.put<UserProfile>("/profile/me", profileData);
  return response.data;
};
