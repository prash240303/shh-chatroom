interface Message {
  user: string;
  username:string;
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