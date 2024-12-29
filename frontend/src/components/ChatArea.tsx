import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import { getAuthTokenFromCookie } from "@/lib/authUtils";
import ChatBubble from "./ChatBubble"; // Import the ChatBubble component
import toast from "react-hot-toast";

interface Message {
  message: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    id: number;
  };
  timestamp: string;
  chat_room: string;
}

interface ChatAreaProps {
  selectedRoom: string | undefined;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedRoom }) => {
  const BASE_URL = `http://127.0.0.1:8000/`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const currentUserEmail = "test@gmail.com"; // Replace this with the actual current user email logic

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedRoom) {
        try {
          const response = await axios.get(`${BASE_URL}messages/${selectedRoom}/`, {
            headers: {
              Authorization: `Bearer ${getAuthTokenFromCookie()}`,
            },
          });
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [selectedRoom]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && selectedRoom) {
      try {
        const response = await axios.post(
          `${BASE_URL}messages/${selectedRoom}/send/`,
          { message },
          {
            headers: {
              Authorization: `Bearer ${getAuthTokenFromCookie()}`,
            },
          }
        );
        if(!response){
          toast.error("Error from our side, please try again later")
        }
        setMessages((prev) => [
          ...prev,
          {
            message,
            user: {
              email: currentUserEmail,
              first_name: "You",
              last_name: "",
              id: 0, // Placeholder for the current user
            },
            timestamp: new Date().toISOString(),
            chat_room: selectedRoom,
          },
        ]);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="chat-area w-3/4 h-screen flex flex-col">
      <div className="header bg-gray-800 text-white p-4">
        <h1 className="text-lg font-bold">{selectedRoom || "Select a Room"}</h1>
      </div>
      <div className="messages flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            message={msg.message}
            isSender={msg.user.email === currentUserEmail}
            userName={`${msg.user.first_name} ${msg.user.last_name}`}
          />
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-gray-100 flex gap-2 items-center"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Send />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
