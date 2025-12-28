import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import ChatArea from "./ChatArea";
import { Room } from "@/types/chat-types";


function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<Room |null>(null);
  return (
    <SidebarProvider>
        <AppSidebar selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
        <ChatArea selectedRoom={selectedRoom} />
    </SidebarProvider>
  );
}

export default ChatLayout;
