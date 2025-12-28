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

  // Initial session check
  useEffect(() => {
    const checkAuth = async () => {
      const hasSessionHint = localStorage.getItem("userEmailKey");

      if (hasSessionHint) {
        // We attempt to validity the session by refreshing the token
        // or making a lightweight auth check.
        // If the access token is still valid, this refresh call might be redundant but safe
        // OR we can rely on making an API call to /me but we don't have one.
        // For now, attempting a refresh is a good way to verify the httpOnly cookie exists.
        const success = await refreshToken();
        if (success) {
          setIsAuthenticated(true);
        } else {
          // If refresh fails, clear the hint
          localStorage.removeItem("userEmailKey");
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
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
