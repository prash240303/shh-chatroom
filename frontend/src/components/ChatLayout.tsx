import ChatArea from "./ChatArea";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { checkAndRedirectIfUnauthenticated } from "@/lib/authUtils";

function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(undefined);

  useEffect(() => {
   checkAndRedirectIfUnauthenticated()
  }, []);

  return (
    <div className="flex">
      <Sidebar selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}  />
      <ChatArea selectedRoom={selectedRoom} />
    </div>
  );
}

export default ChatLayout;