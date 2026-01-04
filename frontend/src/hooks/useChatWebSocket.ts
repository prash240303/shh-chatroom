// hooks/useChatWebSocket.ts
import { Message } from "@/types/chat-types";
import { useEffect, useRef, useState } from "react";
import { refreshToken } from "@/api/auth";
import { devError, devLog, devWarn } from "@/lib/logger";

export const useChatWebSocket = (selectedRoom?: {
  roomname: string;
  roomid: string;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    setMessages([]); 
    reconnectAttemptsRef.current = 0;

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

        devLog("Already refreshing token, waiting...");
        // Wait for ongoing refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }

      isRefreshingRef.current = true;

      try {
        const success = await refreshToken();
        
        if (success) {
          reconnectAttemptsRef.current = 0;
          // Wait a bit to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 200));
          return true;
        }
        
        devError("Token refresh failed");
        return false;
      } catch (error) {
        devError("Token refresh error:", error);
        return false;
      } finally {
        isRefreshingRef.current = false;
      }
    };

    const connectWebSocket = async () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.VITE_WS_URL || 'localhost:8000';
      
      // DON'T pass token in URL - Django middleware reads from cookies
      const socketUrl = `${wsProtocol}//${wsHost}/ws/chat/${selectedRoom.roomid}/`;
      
      devLog(" Connecting WebSocket to:", socketUrl);
      devLog(" Using httpOnly cookies for authentication");

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        devLog("WebSocket connected successfully");
        setConnectionFailed(false);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "message_history") {
            devLog("Received message history:", data.messages, "messages");
            setMessages(data.messages); 
          } else if (data.type === "message") {
            devLog("New message received");
            setMessages((prev) => [...prev, data]); 
          } else if (data.type === "error") {
            devError(" WebSocket error from server:", data.message);
          }
        } catch (e) {
          devError(" Error parsing WebSocket message:", e);
        }
      };

      socket.onclose = async (event) => {
        devWarn("WebSocket closed:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          reconnectAttempt: reconnectAttemptsRef.current
        });

        socketRef.current = null;

        // Code 4001 = Token expired (from Django middleware)
        // Code 4000 = No token
        // Code 4002 = Auth failed
        if (event.code === 4001) {
          devLog("WebSocket closed: Token expired (4001)");
          
          if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            devError("Max reconnection attempts reached");
            setConnectionFailed(true);
            localStorage.removeItem("userSession");
            window.location.href = "/login";
            return;
          }

          reconnectAttemptsRef.current++;
          
          const refreshSuccess = await handleTokenRefresh();
          
          if (refreshSuccess) {
            devLog(`Reconnecting with new token (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, 1000);
          } else {
            devError("Token refresh failed - redirecting to login");
            setConnectionFailed(true);
            localStorage.removeItem("userSession");
            window.location.href = "/login";
          }
        } else if (event.code === 4000 || event.code === 4002) {
          devError(" WebSocket auth failed (code " + event.code + ") - redirecting to login");
          setConnectionFailed(true);
          localStorage.removeItem("userSession");
          window.location.href = "/login";
        } else if (!event.wasClean) {
          // Other abnormal closures
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            devLog(`Reconnecting (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, 2000);
          } else {
            devError("Max reconnection attempts reached");
            setConnectionFailed(true);
          }
        }
      };

      socket.onerror = (err) => {
        devError("WebSocket error:", err);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        devLog("Closing WebSocket (cleanup)");
        socketRef.current.close(1000, "Component unmounting");
        socketRef.current = null;
      }
      
      setMessages([]);
      isRefreshingRef.current = false;
      reconnectAttemptsRef.current = 0;
    };
  }, [selectedRoom]);

  return { messages, socketRef, setMessages, connectionFailed };
};