import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LockKeyhole,
  LogOut,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { handleLogout } from "@/lib/authUtils";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { fetchRooms, createRoom, Room } from "@/api/rooms";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { ThemeColorToggle } from "./ThemeColorToggle";
import { ThemeModeToggle } from "./ThemeModeToggle";
import { getGlobalColorTheme } from "@/lib/theme-colors";


interface AppSidebarProps {
  selectedRoom: {
    roomId: string;
    roomname: string;
  } | null;
  setSelectedRoom: (room: { roomId: string; roomname: string }) => void;
}

export function AppSidebar({ selectedRoom, setSelectedRoom }: AppSidebarProps) {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentColorTheme, setCurrentColorTheme] = useState(getGlobalColorTheme());

  console.log("curr", currentColorTheme)

  const handleCreateRoom = async () => {
    console.log("Starting room creation process...");
    if (!newRoomName.trim()) {
      console.log("Room creation aborted: Empty name");
      return;
    }

    try {
      console.log("Sending create room request:", {
        roomName: newRoomName.trim(),
      });
      const response = await createRoom(newRoomName);
      console.log("Room creation response:", response);

      await handleFetchRooms();
      console.log("Room list updated");
      toast.success("Room created successfully!");
      setNewRoomName("");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to create room";
      console.error("Room creation error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  const handleFetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const roomsData = await fetchRooms();
      setRooms(roomsData);
      console.log("Fetched rooms:", roomsData);
    } catch (error: any) {
      toast.error(`Failed to fetch rooms: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleFetchRooms();
  }, [handleFetchRooms]);

  console.log("theme", currentColorTheme)
  return (
    <Sidebar className="shh">
      <SidebarHeader className="flex flex-row w-full items-center justify-between pt-4 px-4 py-2">
        <span className="font-semibold text-3xl shh-bold text-primary">Shh</span>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button
              className=" border p-3 rounded-full text-primary hover:bg-primary/10 dark:hover:bg-primary/10 bg-secondary dark:bg-black border-primary/20 "
            >
              <Edit className="w-5 h-5" />
            </button>

          </DialogTrigger>
          <DialogContent className="bg-card border-border shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground text-xl font-semibold">
                Create a new room
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a name for your new chat room.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter a room name"
              className="bg-input text-foreground border-border 
            focus:border-ring focus:ring-ring placeholder:text-muted-foreground 
            transition-colors"
            />
            <DialogFooter className="mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="bg-secondary text-secondary-foreground border-border 
              hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => handleCreateRoom()}
                className="bg-primary text-white hover:bg-primary/90 
              transition-colors"
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
                        ${selectedRoom?.roomId === room.room_id
                          ? currentColorTheme === "Zinc"
                            ? "bg-primary dark:bg-secondary text-button"
                            : "bg-primary text-white hover:bg-primary hover:text-neutral-900"
                          : "hover:bg-primary/10"
                        }
                      `}
                      onClick={() =>
                        setSelectedRoom({
                          roomId: room.room_id,
                          roomname: room.room_name,
                        })
                      }
                      onMouseEnter={() => setHoveredRoom(room.room_id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                    >
                      <div className="flex gap-1 justify-center font-semibold items-center">
                        <LockKeyhole
                          className={`mr-2 w-4 h-4 ${selectedRoom?.roomId === room.room_id
                            ? "text-white"
                            : theme === "dark"
                              ? "text-primary"
                              : "text-primary"
                            }`}
                        />
                        <span
                          className={
                            selectedRoom?.roomId === room.room_id
                              ? theme === "dark" && currentColorTheme === "Zinc"
                                ? "text-red-600"
                                : "text-white"
                              : "text-secondary-foreground"
                          }
                        >
                          {room.room_name}
                        </span>
                      </div>
                      {/* Popover Menu for Options */}
                      {(hoveredRoom === room.room_id ||
                        selectedRoom?.roomId === room.room_id) && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-neutral-400 hover:text-neutral-300 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="bg-neutral-800 space-y-0 border border-neutral-700 w-40 p-1 rounded-md shadow-lg">
                              <button
                                className="w-full flex items-center rounded-sm px-2 py-2 text-xs text-red-400 hover:bg-neutral-700 hover:text-red-300"
                                onClick={() => { }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                              </button>
                              <button
                                className="w-full flex items-center rounded-sm px-2 py-2 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-neutral-200"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/?room_id=${room.room_id}`
                                  );
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
        <SidebarGroup className="flex flex-row gap-2 !important">
          <ThemeColorToggle onThemeChange={(newTheme) => {
            console.log('Theme changed to:', newTheme)
            setCurrentColorTheme(newTheme)
          }} />
          <ThemeModeToggle />
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