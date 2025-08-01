"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout as logoutAction } from "@/redux/slices/userSlice";
import { logout } from "@/services/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { UserProfile } from "@/services/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Get user data from Redux store
  const { id, name, email, phone, role, loading, error } = useAppSelector(
    (state) => state.user
  );

  const user = id ? { id, name, email, phone, role } : null;

  const signOut = async () => {
    try {
      await logout();
      dispatch(logoutAction());
      // Let the middleware handle the redirect
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading: loading === "pending", 
        error, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
