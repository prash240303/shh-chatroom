import React, { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { getAuthTokenFromCookie } from "@/lib/authUtils";
import { ChatBubble } from "./ChatBubble";

interface Message {
  user: string;
  message: string;
  timestamp: string;
}

interface ChatAreaProps {
  selectedRoom?: {
    roomname: string;
    roomid: string;
  };
}

const ChatArea = ({ selectedRoom }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load the current user's email
  useEffect(() => {
    const email = localStorage.getItem("userEmailKey") || "";
    setCurrentUserEmail(email.trim().toLowerCase());
  }, []);

  // WebSocket logic for real-time messaging
  useEffect(() => {
    if (!selectedRoom) return; // Skip if `selectedRoom` is null

    const token = getAuthTokenFromCookie();
    console.log("Connecting to WebSocket for room:", selectedRoom.roomid);
    console.log("Token:", token);
    const socketUrl = `ws://localhost:8000/ws/chat/${selectedRoom.roomid}/?token=${token}`;
    console.log("WebSocket URL:", socketUrl);
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };


    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);

        if (data.type === "message_history") {
          setMessages(
            data.messages.map((msg: Message) => ({
              user: msg.user,
              message: msg.message,
              timestamp: msg.timestamp,
            }))
          );
        } else if (data.type === "message") {
          setMessages((prev) => [
            ...prev,
            {
              user: data.user,
              message: data.message,
              timestamp: data.timestamp,
            },
          ]);
        } else {
          console.warn("Unexpected WebSocket data format:", data);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };


    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      console.log("Cleaning up WebSocket connection for room:", selectedRoom.roomid);
      socketRef.current?.close();
      socketRef.current = null;
      setMessages([]); // Reset messages when the room changes
    };
  }, [selectedRoom]);



  // 👇 Auto-scroll to the latest message when `messages` update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message.trim() && selectedRoom && socketRef.current) {
      const newMessage = {
        type: "message",
        user: currentUserEmail,
        message,
        timestamp: new Date().toISOString(),
      };

      // Send message via WebSocket
      socketRef.current.send(JSON.stringify(newMessage));
      setMessage(""); // Clear the input field

      console.log("Message sent:", newMessage);
    }
  };


  return (
    <div className="chat-area w-4/5 h-screen border-l border-neutral-700 flex flex-col place-items-center bg-neutral-800">
      {/* Header */}
      <div className="header w-full text-center text-white p-4">
        <h1 className="text-lg font-bold">{selectedRoom?.roomname || "Select a Room"}</h1>
      </div>

      {/* Messages */}
      <div className="messages max-w-5xl flex-1 overflow-y-auto p-4 w-full">
        {messages.map((msg, index) => {
          const isSender = msg.user.toLowerCase() === currentUserEmail.toLowerCase();
          const isFirstMessageInGroup =
            index === 0 || messages[index - 1]?.user !== msg.user;

          return (
            <ChatBubble
              key={index}
              message={msg.message}
              isSender={isSender}
              userName={msg.user}
              timestamp={new Date(msg.timestamp)}
              avatarUrl="/"
              isFirstMessageInGroup={isFirstMessageInGroup}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center max-w-5xl gap-2 border border-neutral-600 rounded-full mb-6 py-2 pl-8 pr-2 w-full"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-neutral-800 text-white border-none outline-none"
        />
        <button
          type="submit"
          className="p-2 bg-white text-black rounded-full hover:bg-neutral-400 hover:text-white flex items-center justify-center"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
