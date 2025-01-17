import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUp } from "lucide-react";
import { getAuthTokenFromCookie } from "@/lib/authUtils";
import toast from "react-hot-toast";
import { ChatBubble } from "./ChatBubble";

interface User {
  email: string;
  first_name: string;
  last_name: string;
  id: number;
}

interface Message {
  message: string;
  user: User;
  timestamp: string;
  chat_room: string;
}

interface ChatAreaProps {
  selectedRoom: string | undefined;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedRoom }) => {
  const BASE_URL = `http://127.0.0.1:8000/`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmailKey") || "";
    setCurrentUserEmail(email.trim().toLowerCase());
  }, []);

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  }


  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoom) {
        try {
          const response = await axios.get<Message[]>(`${BASE_URL}messages/${selectedRoom}/`, {
            headers: {
              Authorization: `Bearer ${getAuthTokenFromCookie()}`,
            },
          });
          setMessages(response.data);
          console.log(response.data)
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error("Failed to fetch messages");
        }
      }
    };

    fetchMessages();

    if (selectedRoom) {
      // Initialize WebSocket
      const token = getCookie("token");
      console.log("hahah", token)
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/38e08bf4-746f-4b18-8da8-f02262ac121c/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InByYXNoQGdtYWlsLmNvbSIsImlkIjoiMSIsImV4cCI6MTczNzIxNTUwMH0.DXIXC38xusVLXcZcVo2f_FjT8mu6Krh75EAxbhU6s7I`);
      
      ws.onopen = () => console.log("WebSocket connection opened");
      
      ws.onmessage = (event) => {
        const data: Message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, data]);
      };
      
      ws.onclose = () => console.log("WebSocket connection closed");
      
      ws.onerror = (error) => console.error("WebSocket error:", error);

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [selectedRoom]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && selectedRoom && socket) {
      socket.send(
        JSON.stringify({
          message,
        })
      );
      setMessages((prev) => [
        ...prev,
        {
          message,
          user: {
            email: currentUserEmail,
            first_name: "You",
            last_name: "",
            id: 0,
          },
          timestamp: new Date().toISOString(),
          chat_room: selectedRoom,
        },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="chat-area w-4/5 h-screen border-l border-neutral-700 flex flex-col place-items-center bg-neutral-800">
      <div className="header w-full text-center text-white p-4">
        <h1 className="text-lg font-bold">{selectedRoom || "Select a Room"}</h1>
      </div>

      <div className="messages max-w-5xl flex-1 overflow-y-auto p-4 w-full">
        {messages.map((msg, index) => {
          const isSender = msg.user.email.trim().toLowerCase() === currentUserEmail;
          const isFirstMessageInGroup =
            index === 0 || messages[index - 1].user.email !== msg.user.email;

          return (
            <ChatBubble
              key={index}
              message={msg.message}
              isSender={isSender}
              userName={`${msg.user.first_name} ${msg.user.last_name}`}
              timestamp={new Date(msg.timestamp)}
              avatarUrl="/"
              isFirstMessageInGroup={isFirstMessageInGroup}
            />
          );
        })}
      </div>

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
