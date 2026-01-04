// lib/api/rooms.ts
import http from "../lib/http";

export interface Room {
  room_name: string;
  created_at: string;
  room_id: string;
}

// Fetch all rooms for current user
export const fetchRooms = async (): Promise<Room[]> => {
  try {
    const res = await http.get("/rooms/");
    return res.data.rooms;
  } catch (error: any) {
    throw error;
  }
};

// Create a new room
export const createRoom = async (roomName: string) => {
  try {
    const res = await http.post("/rooms/create/", {
      chat_room_name: roomName.trim(),
    });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Delete a room
export const deleteRoom = async (room_id: string) => {
  try {
    const res = await http.delete(`/room/delete/${room_id}/`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Join a room
export const joinRoom = async (room_id: string) => {
  try {
    const res = await http.post("/room/join/", { room_id });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};