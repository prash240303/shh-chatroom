import { useEffect, useState, useRef, useMemo, memo } from "react";
import { ChatBubble } from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { ChatAreaProps, Message } from "@/types/chat-types";
import { SidebarTrigger } from "./ui/sidebar";
import NoRoomSelected from "./NoRoomSelected";
import { User } from "@/types/chat-types";
import { useNavigate } from "react-router-dom";
import { devWarn, devLog } from "@/lib/logger";

const ChatArea = memo<ChatAreaProps>(({ selectedRoom }) => {
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();
  const [currUser, setCurrUser] = useState<User | null>(null);

  // Memoize room config to prevent unnecessary WebSocket reconnections
  const roomConfig = useMemo<{ roomname: string; roomid: string } | undefined>(
    () =>
      selectedRoom
        ? { roomname: selectedRoom.roomname, roomid: selectedRoom.roomId }
        : undefined,
    [selectedRoom?.roomname, selectedRoom?.roomId]
  );

  const { messages, socketRef } = useChatWebSocket(roomConfig);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem("userSession");
    devLog("user", user);
    if (user) {
      setCurrUser(JSON.parse(user));
    } else {
      devLog("user not found");
      navigate("/login");
    }
  }, []);

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
      if(!currUser){
        devWarn("User not found");
        return;
      }
      const newMessage = {
        type: "message",
        username: currUser?.username,
        email: currUser?.email,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      socketRef.current.send(JSON.stringify(newMessage));
      setMessage("");
    } else {
      devWarn("WebSocket is not open or room not selected.");
    }
  };

  if (!selectedRoom) {
    return (
      <div className="chat-area relative w-full h-screen bg-neutral-100 text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white flex flex-col place-items-center transition-colors duration-300">
        <div className="absolute top-4 left-4">
          <SidebarTrigger />
        </div>
        <NoRoomSelected />
      </div>
    );
  }

  return (
    <div className="chat-area relative w-full h-screen  bg-neutral-100 text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white flex flex-col place-items-center transition-colors duration-300">
      <div className="bg-white/20 absolute flex items-center border-b  z-50 backdrop-blur-md  top-0 left-0 w-full px-4 dark:bg-black/20 ">
        <div className=" top-4 left-4">
          <SidebarTrigger />
        </div>

        {/* Header */}
        <div className="p-4 text-left">
          <h1 className="text-lg font-bold text-primary">
            {selectedRoom.roomname}
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="messages max-w-5xl mt-12 flex-1 overflow-y-auto p-4 w-full">
        {messages.map((msg: Message, index: number) => {
          devLog("msg", msg);
          devLog("currUser", currUser);
          const isSender = msg.username === currUser?.username;
          const isFirstMessageInGroup =
            index === 0 || messages[index - 1]?.username !== msg.username;

          return (
            <ChatBubble
              key={`${msg.timestamp}-${index}`}
              message={msg.message}
              isSender={isSender}
              userName={msg.username}
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
