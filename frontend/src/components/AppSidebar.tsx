import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LockKeyhole, LogOut, MoreVertical, Copy, Trash2, Edit } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { getAuthTokenFromCookie, handleLogout } from "@/lib/authUtils";
import toast from "react-hot-toast";
import axios from "axios";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Room } from "@/types/ChatTypes";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";

const BASE_URL = import.meta.env.VITE_BASE_URL;


interface AppSidebarProps {
  selectedRoom: Room | null;
  setSelectedRoom: (room: Room) => void;
}

export function AppSidebar({ selectedRoom, setSelectedRoom }: AppSidebarProps) {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState<{ room_name: string; created_at: string; room_id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const authToken = getAuthTokenFromCookie();
    if (authToken) {
      try {
        const response = await axios.get(`${BASE_URL}rooms/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setRooms(response.data.rooms);
      } catch (error) {
        toast.error(`Failed to fetch rooms ${error}`);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <Sidebar
    className={`shh ${
      theme === "dark"
        ? "bg-neutral-900 text-white"
        : theme === "hazel"
        ? "bg-hazel text-black"
        : "bg-neutral-100 text-black"
    }`}
    >
      <SidebarHeader className="flex flex-row w-full items-center justify-between pt-4 px-4 py-2">
        <span className="text-xl font-bold">Shh</span>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="text-neutral-700 dark:text-neutral-300 inline-block w-fit hover:scale-110 
  border border-neutral-400 dark:border-neutral-600 rounded-full p-2 transition-all 
  hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Edit className="w-4 h-4" />
            </button>


          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-neutral-800 border-none shadow-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">Create a new room</DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Enter a name for your new chat room.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter a room name"
              className="bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-500 
               dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-600 
               rounded-md focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400"
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 
                 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-neutral-900 dark:bg-black text-white hover:bg-neutral-800 dark:hover:bg-neutral-700"
                onClick={() => setNewRoomName("")}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {loading ? (
              <div className="p-4">Loading rooms...</div>
            ) : (
              <SidebarMenu>
                <AnimatePresence>
                  {rooms.map((room) => (
                    <motion.div
                      key={room.room_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`relative flex items-center justify-between px-3 py-3 rounded-lg mb-1 cursor-pointer transition-all
                        ${selectedRoom?.roomId === room.room_id ? "bg-neutral-800 text-white" : "hover:bg-neutral-500 hover:text-neutral-200"}
                      `}
                      onClick={() => setSelectedRoom({ roomname: room.room_name, roomId: room.room_id })}
                      onMouseEnter={() => setHoveredRoom(room.room_id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                    >
                      <div className="flex gap-1 justify-center font-semibold items-center">

                        <LockKeyhole className="mr-2 w-4 h-4" />
                        <span>{room.room_name}</span>
                      </div>
                      {/* Popover Menu for Options */}
                      {(hoveredRoom === room.room_id || selectedRoom?.roomId === room.room_id) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-neutral-400 hover:text-white transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-neutral-800 space-y-0 border border-neutral-700 text-neutral-300 w-40 p-1 rounded-md shadow-lg">
                            <button
                              className="w-full flex items-center rounded-sm px-2 py-2 text-xs text-red-500 hover:bg-neutral-700 hover:text-red-400"
                              onClick={() => { }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                            </button>
                            <button
                              className="w-full flex items-center rounded-sm px-2 py-2 text-xs text-neutral-300 hover:bg-neutral-700"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/?room_id=${room.room_id}`);
                                toast.success("Shareable link copied!");
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" /> Share Link
                            </button>
                          </PopoverContent>
                        </Popover>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Theme</SidebarGroupLabel>
          <SidebarGroupContent>
            <ThemeSwitcher />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


      <SidebarFooter>
        <Button
          variant="destructive"
          className="mt-4 mb-2 bg-red-600 text-white dark:bg-red-600 hazel:bg-hazel-primary 
          hover:bg-red-500 dark:hover:bg-red-500 hazel:hover:bg-hazel-accent transition-all"
                      onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
