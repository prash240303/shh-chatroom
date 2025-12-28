import { Message } from "@/types/chat-types";
import { useEffect, useRef, useState } from "react";
import { refreshToken } from "@/api/auth";

export const useChatWebSocket = (selectedRoom?: {
  roomname: string;
  roomid: string;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    setMessages([]); 

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (!selectedRoom) return;

    const handleTokenRefresh = async (): Promise<boolean> => {
      if (isRefreshingRef.current) {
        return false;
      }

      isRefreshingRef.current = true;
      console.log("🔄 Refreshing access token for WebSocket...");

      try {
        const success = await refreshToken();
        
        if (success) {
          console.log("✅ Token refresh successful");
          return true;
        }
        
        throw new Error("Refresh failed");
      } catch (error) {
        console.log("❌ Token refresh failed");
        return false;
      } finally {
        isRefreshingRef.current = false;
      }
    };

    const connectWebSocket = async () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.VITE_WS_URL || 'localhost:8000';
      const socketUrl = `${wsProtocol}//${wsHost}/ws/chat/${selectedRoom.roomid}/`;
      
      console.log("🔌 Connecting WebSocket:", socketUrl);

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected");
        setConnectionFailed(false);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "message_history") {
            setMessages(data.messages); 
          } else if (data.type === "message") {
            setMessages((prev) => [...prev, data]); 
          }
        } catch (e) {
          console.error("Error parsing message:", e);
        }
      };

      socket.onclose = async (event) => {
        console.warn("⚠️ WebSocket closed:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });

        // Check if close was due to authentication error
        if (event.code === 4001 || event.code === 4003 || event.code === 1006) {
          console.log("🔐 WebSocket closed due to authentication issue");
          
          // Attempt to refresh token
          const refreshSuccess = await handleTokenRefresh();
          
          if (refreshSuccess) {
            // Wait a bit for the new token to be set, then reconnect
            console.log("🔄 Reconnecting WebSocket with new token...");
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, 500);
          } else {
            console.error("❌ Could not reconnect: Refresh failed.");
            setConnectionFailed(true);
          }
        } else if (!event.wasClean) {
          // For other abnormal closures, try to reconnect once
          console.log("🔄 Attempting to reconnect WebSocket...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 1000);
        } else {
          // Normal closure
          setConnectionFailed(false);
        }
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
        socketRef.current = null;
      }
      
      setMessages([]);
      isRefreshingRef.current = false;
    };
  }, [selectedRoom?.roomid]);

  return { messages, socketRef, setMessages, connectionFailed };
};