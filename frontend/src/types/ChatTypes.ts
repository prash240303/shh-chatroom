interface Message {
  user: string;
  message: string;
  timestamp: string;
}



interface Room {
  roomname: string;
  roomId: string;
}


interface ChatAreaProps {
  selectedRoom: {
    roomname: string;
    roomId: string;
  } | null;
}

export type { Message, Room, ChatAreaProps };