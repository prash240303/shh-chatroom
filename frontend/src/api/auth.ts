import http from "@/lib/http";

export interface User {
  id: number;
  email: string;
  name?: string;
  // Add other user fields as needed
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

export const refreshToken = async (): Promise<boolean> => {
  try {
    // The backend refresh endpoint expects nothing in body, relies on httpOnly cookie
    await http.post("/refresh/"); 
    return true;
  } catch (error) {
    return false;
  }
};
