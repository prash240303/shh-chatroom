// import { getAuthTokenFromCookie } from "@/lib/authUtils";
// import { Message } from "@/types/ChatTypes";
// import { useEffect, useRef, useState } from "react";

// export const useChatWebSocket = (selectedRoom?: { roomname: string; roomid: string }) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const socketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     if (!selectedRoom) return;

//     const token = getAuthTokenFromCookie();
//     const socketUrl = `ws://localhost:8000/ws/chat/${selectedRoom.roomid}/?token=${token}`;
//     socketRef.current = new WebSocket(socketUrl);

//     socketRef.current.onopen = () => console.log("WebSocket connected");
//     socketRef.current.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === "message_history") {
//           setMessages(data.messages);
//         } else if (data.type === "message") {
//           setMessages((prev) => [...prev, data]);
//         }
//       } catch (error) {
//         console.error("WebSocket message error:", error);
//       }
//     };
//     socketRef.current.onclose = () => console.log("WebSocket disconnected");

//     return () => {
//       socketRef.current?.close();
//       setMessages([]);
//     };
//   }, [selectedRoom]);

//   return { messages, socketRef, setMessages };
// };


import { getAuthTokenFromCookie } from "@/lib/authUtils";
import { Message } from "@/types/ChatTypes";
import { useEffect, useRef, useState } from "react";

const MAX_RETRIES = 5; // Maximum retry attempts for WebSocket connection
const RECONNECT_DELAY = 2000; // Initial delay (2 sec), increases exponentially

export const useChatWebSocket = (selectedRoom?: { roomname: string; roomid: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedRoom) {
      console.log("No room selected, skipping WebSocket connection.");
      return;
    }

    const token = getAuthTokenFromCookie();
    const socketUrl = `ws://localhost:8000/ws/chat/${selectedRoom.roomid}/?token=${token}`;

    const connectWebSocket = () => {
      if (retriesRef.current >= MAX_RETRIES) {
        console.warn("Max WebSocket connection attempts reached. Stopping retries.");
        return;
      }

      console.log(`Attempting WebSocket connection (Attempt ${retriesRef.current + 1}/${MAX_RETRIES})`);
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        console.log("WebSocket connected successfully.");
        retriesRef.current = 0; // Reset retries on successful connection
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "message_history") {
            setMessages(data.messages);
          } else if (data.type === "message") {
            setMessages((prev) => [...prev, data]);
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.warn("WebSocket closed:", event.reason);

        // Attempt to reconnect if below max retries
        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          const delay = RECONNECT_DELAY * retriesRef.current; // Increase delay exponentially
          console.log(`Retrying WebSocket connection in ${delay / 1000} seconds...`);

          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        socketRef.current?.close(); // Ensure proper closure on error
      };
    };

    connectWebSocket();

    return () => {
      console.log("Cleaning up WebSocket connection.");
      socketRef.current?.close();
      setMessages([]);

      // Clear any scheduled reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [selectedRoom]);

  return { messages, socketRef, setMessages };
};
