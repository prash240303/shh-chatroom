import { useEffect, useState, useRef, useMemo, memo } from "react";
import { ChatBubble } from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { ChatAreaProps, Message } from "@/types/chat-types";
import { SidebarTrigger } from "./ui/sidebar";
import NoRoomSelected from "./NoRoomSelected";

const ChatArea = memo<ChatAreaProps>(({ selectedRoom }) => {
  const [message, setMessage] = useState<string>("");
  
  const currentUserEmail = useMemo<string>(
    () => localStorage.getItem("userEmailKey")?.trim().toLowerCase() || "",
    []
  );

  // Memoize room config to prevent unnecessary WebSocket reconnections
  const roomConfig = useMemo<{ roomname: string; roomid: string } | undefined>(
    () => selectedRoom 
      ? { roomname: selectedRoom.roomname, roomid: selectedRoom.roomId }
      : undefined,
    [selectedRoom?.roomname, selectedRoom?.roomId]
  );

  const { messages, socketRef } = useChatWebSocket(roomConfig);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (): void => {
    if (
      message.trim() &&
      selectedRoom &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      const newMessage = {
        type: "message",
        user: currentUserEmail,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };
  
      socketRef.current.send(JSON.stringify(newMessage));
      setMessage("");
    } else {
      console.warn("WebSocket is not open or room not selected.");
    }
  };

  if (!selectedRoom) {
    return (
      <div className="chat-area relative w-full h-screen border-l border-neutral-300 bg-neutral-100 text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white flex flex-col place-items-center transition-colors duration-300">
        <div className="absolute top-4 left-4">
          <SidebarTrigger />
        </div>
        <NoRoomSelected />
      </div>
    );
  }

  return (
    <div className="chat-area relative w-full h-screen border-l border-neutral-300 bg-neutral-100 text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white flex flex-col place-items-center transition-colors duration-300">
      <div className="absolute top-4 left-4">
        <SidebarTrigger />
      </div>

      {/* Header */}
      <div className="header w-full text-center p-4">
        <h1 className="text-lg text-white dark:text-neutral-900 font-bold">
          {selectedRoom.roomname}
        </h1>
      </div>

      {/* Messages */}
      <div className="messages max-w-5xl flex-1 overflow-y-auto p-4 w-full">
        {messages.map((msg: Message, index: number) => {
          const isSender = msg.user.toLowerCase() === currentUserEmail;
          const isFirstMessageInGroup =
            index === 0 || messages[index - 1]?.user !== msg.user;

          return (
            <ChatBubble
              key={`${msg.timestamp}-${index}`}
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
      <ChatInput
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
});

ChatArea.displayName = "ChatArea";

export default ChatArea;