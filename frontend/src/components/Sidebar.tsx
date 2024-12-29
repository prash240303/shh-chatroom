import axios from "axios";
import { useEffect, useState } from "react";
import { getAuthTokenFromCookie, handleLogout } from "@/lib/authUtils";
// import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_BASE_URL;

interface SidebarProps {
  setSelectedRoom: (roomName: string) => void;
}

const Sidebar = ({ setSelectedRoom }: SidebarProps) => {

  const [rooms, setRooms] = useState<{ room_id: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  // const navigate = useNavigate()
  const fetchRooms = async () => {
    const authToken = getAuthTokenFromCookie();
    console.log(authToken)
    if (authToken) {

      try {
        const response = await axios.get(`${BASE_URL}rooms/`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setRooms(response.data.rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("failed to fetch rooms")
      } finally {
        setLoading(false);
      }
    } else {
      console.error("No authentication token found");
      setLoading(false);
      // navigate("/login")
    }
  };

  const handleCreateRoom = async () => {
    const authToken = getAuthTokenFromCookie();
    if (!authToken || !newRoomName.trim()) {
      console.error("Missing authentication token or room name.");
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
      setDialogVisible(false);
      setNewRoomName("");

      const appUrl = window.location.origin;
      setShareableLink(`${appUrl}/?room_id=${newRoom.room_id}`);
    } catch (error) {
      console.error("Error creating or joining room:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);


  return (
    <div className="sidebar w-1/4 bg-gray-100 h-screen p-4 flex flex-col relative">
      <h2 className="text-lg font-bold mb-4">Chats</h2>

      <button
        onClick={() => setDialogVisible(true)}
        className="mb-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Create New Room
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <li
              key={room.room_id}
              onClick={() => setSelectedRoom(room.room_id)} // Pass the room ID on click
              className="p-2 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded mb-2"
            >
              <div className="font-semibold">{room.room_id}</div>
              <div className="text-xs text-gray-500">
                {new Date(room.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialogVisible && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Create a New Room</h3>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDialogVisible(false)}
                className="p-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {shareableLink && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <p className="text-sm">Share this link to invite friends:</p>
          <input
            readOnly
            value={shareableLink}
            className="w-full mt-2 p-2 border rounded-lg bg-gray-50"
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareableLink)}
            className="mt-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Copy Link
          </button>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;