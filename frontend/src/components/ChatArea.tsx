import { useEffect, useState, useRef, useMemo } from "react";
import { ChatBubble } from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { ChatAreaProps, Message } from "@/types/ChatTypes";
import { SidebarTrigger } from "./ui/sidebar";
import NoRoomSelected from "./NoRoomSelected";
import { getMessages } from "@/api/messages";

const ChatArea = ({ selectedRoom }: ChatAreaProps) => {
  const { messages: socketMessages, socketRef } = useChatWebSocket(selectedRoom ? { ...selectedRoom, roomid: selectedRoom.roomId } : undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const currentUserEmail = useMemo(() => localStorage.getItem("userEmailKey")?.trim().toLowerCase() || "", []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("Selected Room:", selectedRoom);

  // Fetch message history when selectedRoom changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedRoom) {
        console.log("No room selected, skipping fetch.");
        return;
      }

      console.log(`Fetching messages for room: ${selectedRoom?.roomId}`);
      const historyMessages = await getMessages(selectedRoom?.roomId);
      console.log("Fetched messages from API:", historyMessages);

      setMessages(historyMessages);
    };

    fetchMessages();
  }, [selectedRoom]);

  // Update messages when WebSocket messages change
  useEffect(() => {
    console.log("New WebSocket messages received:", socketMessages);
    setMessages((prev) => [...prev, ...socketMessages]);
  }, [socketMessages]);

  useEffect(() => {
    console.log("Updated messages:", messages);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && selectedRoom && socketRef.current) {
      const newMessage = {
        type: "message",
        user: currentUserEmail,
        message,
        timestamp: new Date().toISOString(),
      };

      console.log("Sending message:", newMessage);
      socketRef.current.send(JSON.stringify(newMessage));
      setMessage("");
    }
  };

  return (
    <div className="chat-area relative w-full h-screen border-l border-neutral-300 bg-neutral-100 text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white flex flex-col place-items-center transition-colors duration-300">
      <div className="absolute top-4 left-4">
        <SidebarTrigger />
      </div>

      {selectedRoom ? (
        <>
          {/* Header */}
          <div className="header w-full text-center p-4">
            <h1 className="text-lg text-white dark:text-neutral-900 font-bold">{selectedRoom?.roomname}</h1>
          </div>

          {/* Messages */}
          <div className="messages max-w-5xl flex-1 overflow-y-auto p-4 w-full">
            {messages.map((msg: Message, index: number) => {
              const isSender = msg.user.toLowerCase() === currentUserEmail;
              const isFirstMessageInGroup = index === 0 || messages[index - 1]?.user !== msg.user;

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
          <ChatInput message={message} setMessage={setMessage} sendMessage={sendMessage} />
        </>
      ) : (
        <NoRoomSelected />
      )}
    </div>
  );
};

export default ChatArea;
