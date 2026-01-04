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
  Trash2,
  Edit,
  Link,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/auth/useAuth";
import { useTheme } from "next-themes";
import { fetchRooms, createRoom, Room, deleteRoom } from "@/api/rooms";
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
import { cn } from "@/lib/utils";
import http from "@/lib/http";

interface AppSidebarProps {
  selectedRoom: {
    roomId: string;
    roomname: string;
  } | null;
  setSelectedRoom: (room: { roomId: string; roomname: string } | null) => void;
}

export function AppSidebar({ selectedRoom, setSelectedRoom }: AppSidebarProps) {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentColorTheme, setCurrentColorTheme] = useState(
    getGlobalColorTheme()
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  // console.log("list of rooms", rooms);
  // console.log("curr", currentColorTheme);
  // console.log("selected room", selectedRoom);

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

  const handleDeleteRooms = async (roomId: string) => {
    if (!roomId) {
      toast.error("No room selected");
      return;
    }

    try {
      console.log("Deleting room with ID:", roomId);

      const response = await deleteRoom(roomId);
      console.log("Room deleted:", response);

      toast.success("Room deleted successfully!");

      // Remove room instantly from UI **without waiting for refetch**
      setRooms((prev) => prev.filter((room) => room.room_id !== roomId));

      // If the deleted room was selected — reset selection
      if (selectedRoom?.roomId === roomId) {
        setSelectedRoom(null);
      }

      // Refetch to ensure sync with backend
      await handleFetchRooms();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete room");
    }
  };

  useEffect(() => {
    handleFetchRooms();
  }, [handleFetchRooms]);

  function handleLogout() {
    logout();
    localStorage.removeItem("userSession");
    toast.success("Logged out successfully!");
  }

  console.log("theme", currentColorTheme);
  return (
    <Sidebar className="shh">
      <SidebarHeader className="flex flex-row w-full items-center justify-between pt-4 px-4 py-2">
        <span className="font-semibold text-3xl shh-bold text-primary">
          Shh
        </span>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <button className=" border p-3 rounded-full text-primary hover:bg-primary/10 dark:hover:bg-primary/10 bg-secondary dark:bg-black border-primary/20 ">
              <Edit className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-secondary border-border shadow-lg">
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
              className="bg-secondary text-foreground border-primary/30 
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
                      className={`relative isolate group flex items-center justify-between px-3 py-3 rounded-lg mb-1 cursor-pointer transition-all
                        ${
                          selectedRoom?.roomId === room.room_id
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
                          className={`mr-2 w-4 h-4 ${
                            selectedRoom?.roomId === room.room_id
                              ? "text-white"
                              : "text-secondary-foreground"
                          }
                            `}
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
                            <button
                              className={`transition-colors ${
                                selectedRoom?.roomId === room.room_id
                                  ? "text-white"
                                  : "text-secondary-foreground group-hover:text-black"
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-secondary space-y-0 border border-primary/10 w-36 p-1 rounded-md shadow-lg">
                            <button
                              className="w-full flex items-center rounded-sm px-2 py-2 text-xs text-primary hover:bg-primary hover:text-white"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${window.location.origin}/?room_id=${room.room_id}`
                                );
                                toast.success("Shareable link copied!");
                              }}
                            >
                              <Link className="w-4 h-4 mr-2" /> Share Link
                            </button>

                            <button
                              className="w-full flex items-center rounded-sm px-2 py-2 text-xs text-primary hover:bg-primary hover:text-white"
                              onClick={() => {
                                setRoomToDelete(room.room_id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Room
                            </button>

                            <Dialog
                              open={isDeleteDialogOpen}
                              onOpenChange={setIsDeleteDialogOpen}
                            >
                              <DialogContent className="bg-secondary border-border">
                                <DialogHeader>
                                  <DialogTitle>Delete Room?</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this room?
                                    This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setIsDeleteDialogOpen(false);
                                      setRoomToDelete(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    onClick={async () => {
                                      if (roomToDelete)
                                        await handleDeleteRooms(roomToDelete);
                                      setIsDeleteDialogOpen(false);
                                      setRoomToDelete(null);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
          <ThemeColorToggle
            onThemeChange={(newTheme) => {
              console.log("Theme changed to:", newTheme);
              setCurrentColorTheme(newTheme);
            }}
          />
          <ThemeModeToggle />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="destructive"
          className={cn(
            "mt-4 mb-2 transition-all",
            currentColorTheme === "Zinc"
              ? "bg-black dark:bg-secondary hover:bg-neutral-800 dark:hover:bg-neutral-700"
              : "bg-primary hover:bg-primary/70"
          )}
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
