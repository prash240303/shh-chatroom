import axios from 'axios';
import { getAuthTokenFromCookie } from '@/lib/authUtils';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface Room {
  room_name: string;
  created_at: string;
  room_id: string;
}

export const fetchRooms = async () => {
  const authToken = getAuthTokenFromCookie();
  if (!authToken) throw new Error('No auth token found');

  const response = await axios.get(`${BASE_URL}rooms/`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data.rooms;
};

export const createRoom = async (roomName: string) => {
  const authToken = getAuthTokenFromCookie();
  if (!authToken) throw new Error('No auth token found');

  const response = await axios.post(
    `${BASE_URL}rooms/create/`,
    { chat_room_name: roomName.trim() },
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const DeleteRoom = async (room_id: string) => {
  const authToken = getAuthTokenFromCookie();
  if (!authToken) throw new Error('No auth token found');

  const response = await axios.delete(
    `${BASE_URL}room/delete/${room_id}/`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}