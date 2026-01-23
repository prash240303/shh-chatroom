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
import { devLog, devError } from "@/lib/logger";
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
      devLog("Checking authentication on mount...");
      const hasSessionHint = localStorage.getItem("userEmailKey");

      if (hasSessionHint) {
        devLog("Verifying session with token refresh...");
        const success = await refreshToken();

        if (success) {
          devLog("Session verified - user authenticated");
          setIsAuthenticated(true);
        } else {
          devLog("Session invalid - clearing and redirecting");
          localStorage.removeItem("userSession");
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
    devLog("Logging out...");
    await logoutUser();
    devLog("Logout successful");
    
    // Clear state only after successful logout
    setIsAuthenticated(false);
    localStorage.removeItem("userSession");
    navigate("/login", { replace: true });
    
  } catch (err) {
    devError("Logout error:", err);
    // Optionally still logout locally if backend fails
    setIsAuthenticated(false);
    localStorage.removeItem("userSession");
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
