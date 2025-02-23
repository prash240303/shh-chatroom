import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { getAuthTokenFromCookie, handleLogout } from "@/lib/authUtils";
import toast from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy, Edit, LockKeyhole, LogOut, MoreVertical, Trash2 } from "lucide-react";

interface Room {
  roomname: string;
  roomid: string;
}

interface SidebarProps {
  setSelectedRoom: (room: Room) => void;
  selectedRoom: Room | undefined;
}

const Sidebar = ({ selectedRoom, setSelectedRoom }: SidebarProps) => {
  const [rooms, setRooms] = useState<{ room_name: string; created_at: string; room_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    const authToken = getAuthTokenFromCookie();
    if (authToken) {
      try {
        const response = await axios.get(`${BASE_URL}rooms/`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setRooms(response.data.rooms);
      } catch (error) {
        toast.error(`Failed to fetch rooms ${error}`);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="sidebar w-1/5 bg-neutral-900 border-r border-neutral-700 h-screen flex flex-col relative p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-2xl text-white font-bold">Shh</span>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-white hover:scale-105 border border-neutral-700 rounded-full p-2 transition-transform">
              <Edit className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-800 border-none shadow-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create a new room</DialogTitle>
              <DialogDescription className="text-neutral-400">Enter a name for your new chat room.</DialogDescription>
            </DialogHeader>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter a room name"
              className="bg-neutral-800 text-white placeholder-neutral-400 border border-neutral-600 rounded-md"
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="bg-neutral-800 border border-neutral-600 text-white hover:bg-neutral-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-neutral-900 hover:bg-black"
                onClick={() => setNewRoomName("")}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <AnimatePresence>
            {rooms.map((room) => (
              <motion.div
                key={room.room_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`relative flex items-center justify-between px-3 py-3 rounded-lg mb-1 cursor-pointer transition-all
                  ${room.room_id === selectedRoom?.roomid ? "bg-neutral-700 text-white" : "bg-transparent text-neutral-500 hover:bg-neutral-800"}
                `}
                onMouseEnter={() => setHoveredRoom(room.room_id)}
                onMouseLeave={() => setHoveredRoom(null)}
                onClick={() => setSelectedRoom({ roomname: room.room_name, roomid: room.room_id })}
              >
                <div className="flex items-center space-x-2">
                  <LockKeyhole className="w-4 h-4 text-neutral-400" />
                  <div className="font-medium text-sm truncate">{room.room_name}</div>
                </div>

                {/* Popover - Show only when hovered */}
                {(hoveredRoom === room.room_id || selectedRoom?.roomid === room.room_id) && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-neutral-400 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="bg-neutral-800 border border-neutral-700 text-neutral-300 w-40 p-2 rounded-md shadow-lg">
                      <Button
                        className="w-full justify-start px-2 py-1 text-xs text-red-500 hover:bg-neutral-700 hover:text-red-400"
                        variant="ghost"
                        onClick={() => {}}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                      </Button>
                      <Button
                        className="w-full justify-start px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?room_id=${room.room_id}`);
                          toast.success("Shareable link copied!");
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" /> Share Link
                      </Button>
                    </PopoverContent>
                  </Popover>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      )}

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="mt-4 mb-2 bg-neutral-700 hover:bg-red-600 transition-all"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
};

export default Sidebar;
