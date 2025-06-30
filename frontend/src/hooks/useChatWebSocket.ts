import { getAuthTokenFromCookie } from "@/lib/authUtils";
import { Message } from "@/types/chat-types";
import { useEffect, useRef, useState } from "react";

export const useChatWebSocket = (selectedRoom?: {
  roomname: string;
  roomid: string;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [connectionFailed, setConnectionFailed] = useState(false);

  useEffect(() => {
    setMessages([]); // Reset messages on room switch
  
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  
    if (!selectedRoom) return;
  
    const token = getAuthTokenFromCookie();
    const socketUrl = `ws://localhost:8000/ws/chat/${selectedRoom.roomid}/?token=${token}`;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;
  
    socket.onopen = () => console.log("WebSocket connected");
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message_history") {
        setMessages(data.messages); // Overwrite with history
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data]); // Append new messages
      }
    };
  
    socket.onclose = () => setConnectionFailed(true);
  
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setMessages([]);
    };
  }, [selectedRoom]);
  
  return { messages, socketRef, setMessages, connectionFailed };
};
