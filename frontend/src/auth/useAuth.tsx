// auth/useAuth.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser, refreshToken } from "@/api/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication on mount...");
      const hasSessionHint = localStorage.getItem("userEmailKey");

      if (hasSessionHint) {
        console.log("Verifying session with token refresh...");
        const success = await refreshToken();
        
        if (success) {
          console.log("Session verified - user authenticated");
          setIsAuthenticated(true);
        } else {
          console.log("Session invalid - clearing and redirecting");
          localStorage.removeItem("userEmailKey");
          setIsAuthenticated(false);
          // Don't navigate here - let ProtectedRoute handle it
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      console.log("Logout successful");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem("userEmailKey");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}