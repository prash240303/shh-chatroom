import http from "@/lib/http";

export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export const loginUser = async (data: Record<string, any>): Promise<LoginResponse> => {
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
        ...(csrfToken ? { "X-CSRFToken": csrfToken } : {})
      },
      credentials: "include",
    });

    // Log response headers
    const setCookieHeader = response.headers.get('set-cookie');
    console.log("Set-Cookie header:", setCookieHeader);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Refresh successful, response:", data);
      
      // Check cookies after refresh
      await new Promise(resolve => setTimeout(resolve, 100));
      const newCookies = document.cookie;
      console.log("Cookies after refresh:", newCookies);
      
      const hasNewAccessToken = newCookies.includes('access_token');
      console.log("New access_token set:", hasNewAccessToken);
      
      return true;
    } else {
      const errorText = await response.text();
      console.error("Refresh failed:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("Refresh error:", error);
    return false;
  }
};

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