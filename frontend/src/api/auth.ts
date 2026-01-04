import http from "@/lib/http";
import { devError, devLog } from "@/lib/logger";
import { User } from "@/types/chat-types";

export interface LoginResponse {
  user: User;
  message: string;
}

export const loginUser = async (
  data: Record<string, any>
): Promise<LoginResponse> => {
  const response = await http.post("/login/", data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await http.post("/logout/");
};

// api/auth.ts
export const refreshToken = async (): Promise<boolean> => {
  try {
    const csrfToken = getCsrfToken();

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      devLog("Refresh successful, response:", data);

      return true;
    } else {
      const errorText = await response.text();
      devError("Refresh failed:", response.status, errorText);
      return false;
    }
  } catch (error) {
    devError("Refresh error:", error);
    return false;
  }
};

function getCsrfToken(): string | null {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
