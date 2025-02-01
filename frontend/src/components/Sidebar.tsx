import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { getAuthTokenFromCookie, handleLogout } from "@/lib/authUtils";
import toast from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Importing Shadcn Popover
import { Copy, Edit, LockKeyhole, LogOut, MoreVertical, Trash2 } from "lucide-react";

interface Room {
  roomname: string;
  roomid: string;
}

interface SidebarProps {
  setSelectedRoom: (room: Room ) => void;
  selectedRoom: Room | undefined;
}

const Sidebar = ({ selectedRoom, setSelectedRoom }: SidebarProps) => {
  const [rooms, setRooms] = useState<{ room_name: string; created_at: string; room_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [shareableLink, setShareableLink] = useState<string>("");

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
        console.log("rooms list", response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    } else {
      console.error("No authentication token found");
      setLoading(false);
    }
  }, []);

  const handleCreateRoom = async () => {
    const authToken = getAuthTokenFromCookie();
    if (!authToken || !newRoomName.trim()) {
      toast.error("Room name cannot be empty.");
      return;
    }

    try {
      const createResponse = await axios.post(
        `${BASE_URL}rooms/create/`,
        { chat_room_name: newRoomName },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log(createResponse);
      const newRoom = createResponse.data;
      await axios.post(
        `${BASE_URL}room/join/`,
        { room_id: newRoom.room_id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      fetchRooms();
      setIsCreateDialogOpen(false);
      setSelectedRoom({ roomname: newRoom.room_name, roomid: newRoom.room_id });
      setNewRoomName("");

      const appUrl = window.location.origin;
      setShareableLink(`${appUrl}/?room_id=${newRoom.room_id}`);
      toast.success("Room created successfully!");
    } catch (error) {
      console.error("Error creating or joining room:", error);
      toast.error("Failed to create room");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) return;

    try {
      await axios.delete(`${BASE_URL}room/delete/${roomId}/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      fetchRooms();
      toast.success("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <motion.div className="sidebar w-1/5 bg-neutral-800 border-r-neutral-400 h-screen p-4 flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <span className="text-3xl text-white font-bold">Chats</span>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-white border w-fit rounded-full border-neutral-500 p-2">
              <Edit />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-800 ">
            <DialogHeader>
              <DialogTitle className="text-white">Create a new room</DialogTitle>
              <DialogDescription className="text-neutral-500">
                Enter a name for your new chat room.
              </DialogDescription>
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
                className="bg-neutral-800 border hover:bg-black hover:text-white border-neutral-600 text-white"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-neutral-900 hover:bg-black"
                onClick={handleCreateRoom}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-4 px-4">
          <AnimatePresence>
            {rooms.map((room) => (
              <motion.div
                key={room.room_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-600 rounded-lg mb-1 transition-colors ${
                  room.room_name === selectedRoom?.roomname ? "bg-neutral-700 text-neutral-100" : "bg-transparent text-neutral-500"
                }`}
              >
                <div
                  className="flex items-center flex-1"
                  onClick={() => setSelectedRoom({ roomname: room.room_name, roomid: room.room_id })}
                >
                  <LockKeyhole className="w-4 h-4 mr-2" />
                  <div className="font-medium text-sm text-neutral-300 truncate">{room.room_name}</div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-2 text-neutral-400 hover:text-white">
                      <MoreVertical />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-neutral-800 text-neutral-300 w-48 p-2 rounded-lg shadow-lg">
                    <Button
                      className="w-full justify-start text-red-500 hover:text-red-700"
                      variant="ghost"
                      onClick={() => handleDeleteRoom(room.room_id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                    </Button>
                    <Button
                      className="w-full justify-start text-neutral-400 hover:text-neutral-200"
                      variant="ghost"
                      onClick={() => {
                        const appUrl = window.location.origin;
                        setShareableLink(`${appUrl}/?room_id=${room.room_id}`);
                        navigator.clipboard.writeText(shareableLink);
                        toast.success("Shareable link generated!");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Share Link
                    </Button>
                  </PopoverContent>
                </Popover>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      )}

      <Button
        variant="destructive"
        className="mt-4 mb-2 bg-neutral-600"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </motion.div>
  );
};

export default Sidebar;
