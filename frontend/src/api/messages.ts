import axios from "axios";
import { getAuthTokenFromCookie } from "@/lib/authUtils";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getMessages = async (roomId: string) => {
      const authToken = getAuthTokenFromCookie();
  
  try {
    const response = await axios.get(`${BASE_URL}messages/${roomId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  
    console.log("API request", response.data);
    const data = response.data;

    if (data.type === "message_history" && Array.isArray(data.messages)) {
      return data.messages.map((msg: { user: { email: string }, message: string, timestamp: string }) => ({
        user: msg.user.email,
        message: msg.message,
        timestamp: msg.timestamp,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};
