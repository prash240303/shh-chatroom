import ChatArea from "./ChatArea";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { checkAndRedirectIfUnauthenticated } from "@/lib/authUtils";

type Room = {
  roomname: string;
  roomid: string;
};
function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<Room>({ roomname: "", roomid: "" });

  useEffect(() => {
    checkAndRedirectIfUnauthenticated()
  }, []);

  return (
    <div className="flex">
      <Sidebar selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
        <ChatArea selectedRoom={selectedRoom} />
    </div>
  );
}

export default ChatLayout;