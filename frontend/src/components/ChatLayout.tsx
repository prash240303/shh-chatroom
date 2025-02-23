import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import ChatArea from "./ChatArea";
import { checkAndRedirectIfUnauthenticated } from "@/lib/authUtils";
import { Room } from "@/types/ChatTypes";


function ChatLayout() {
  const [selectedRoom, setSelectedRoom] = useState<Room |null>(null);

  useEffect(() => {
    checkAndRedirectIfUnauthenticated();
  }, []);

  return (
    <SidebarProvider>
        <AppSidebar selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />
        <ChatArea selectedRoom={selectedRoom} />
    </SidebarProvider>
  );
}

export default ChatLayout;
