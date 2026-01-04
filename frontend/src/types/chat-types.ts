interface Message {
  username:string;
  email:string;
  message: string;
  timestamp: string;
}

interface User {
  email: string;
  username: string;
  id: string;
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

export type { Message, Room, ChatAreaProps, User };