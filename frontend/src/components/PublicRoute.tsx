// components/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already logged in, redirect to home
  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}