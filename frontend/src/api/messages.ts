interface Message {
  user: string;
  message: string;
  timestamp: string;
}


export const fetchMessages = async (roomId: string, baseUrl: string) => {
  try {
    const response = await fetch(`${baseUrl}/chat/${roomId}`);
    const data = await response.json();

    return data.map((msg:Message) => ({
      user: msg.user, // Ensure correct sender is maintained
      message: msg.message,
      timestamp: msg.timestamp,
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};
